import os
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

from database import get_db, init_db
from seed_data import seed

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "static", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

init_db()
seed()

# ----------------- UI ROUTE ----------------- #
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/docs")
def docs():
    return render_template("docs.html")

# ----------------- FARMER APIS ----------------- #
@app.route("/api/farmers", methods=["GET"])
def get_farmers():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM farmers ORDER BY id DESC")
    rows = cursor.fetchall()
    res = [dict(row) for row in rows]
    conn.close()
    return jsonify(res)

@app.route("/api/farmers/register", methods=["POST"])
def register_farmer():
    data = request.json or {}
    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    aadhaar_last4 = data.get("aadhaar_last4", "5544").strip()
    village = data.get("village", "").strip() or "Gram Panchayat"
    district = data.get("district", "Raichur").strip()
    preferred_lang = data.get("preferred_lang", "kannada").lower()
    survey_number = data.get("survey_number", "").strip() or f"SY-{uuid.uuid4().hex[:4].upper()}"
    try:
        acreage = float(data.get("land_acreage", 2.5))
        if acreage <= 0:
            acreage = 2.5
    except (ValueError, TypeError):
        acreage = 2.5

    crop_type = data.get("crop_type", "Paddy (Grade A)")
    bank_account = data.get("bank_account", "").strip() or f"XXXXXX{aadhaar_last4}"
    bank_ifsc = data.get("bank_ifsc", "SBIN0001244").strip()

    if not name or not phone:
        return jsonify({"error": "Farmer Name and Phone Number are required!"}), 400

    conn = get_db()
    cursor = conn.cursor()

    state_prefix = "KA"
    if "tamil" in preferred_lang or "thanjavur" in district.lower():
        state_prefix = "TN"
    elif "telugu" in preferred_lang or "guntur" in district.lower():
        state_prefix = "AP"
    elif "hindi" in preferred_lang or "karnal" in district.lower():
        state_prefix = "HR"

    rand_num = str(uuid.uuid4().int)[:4]
    farmer_code = f"FARM-{state_prefix}-{rand_num}"

    cursor.execute('''
    INSERT INTO farmers (farmer_id, name, phone, aadhaar_last4, village, district, preferred_lang, bank_account, bank_ifsc)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (farmer_code, name, phone, aadhaar_last4, village, district, preferred_lang, bank_account, bank_ifsc))
    new_farmer_id = cursor.lastrowid

    yield_rate = 25.0
    total_quota = round(acreage * yield_rate, 2)

    cursor.execute('''
    INSERT INTO land_records (farmer_id, survey_number, land_acreage, soil_type, crop_type, district_yield_rate, total_quota, quota_used)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0.0)
    ''', (new_farmer_id, survey_number, acreage, "Black Soil", crop_type, yield_rate, total_quota))

    cert_code = f"PAN-{state_prefix}-2026-{rand_num}"
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute('''
    INSERT INTO panchayat_prechecks (farmer_id, survey_number, crop_type, probe_test_date, moisture_percent, foreign_matter_percent, status, certificate_code, officer_name)
    VALUES (?, ?, ?, ?, 14.0, 0.9, 'PASSED', ?, 'Gram Panchayat Agri Officer')
    ''', (new_farmer_id, survey_number, crop_type, now_str, cert_code))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": f"Farmer registered successfully! Quota allocated: {total_quota} Qtl",
        "farmer_id": new_farmer_id,
        "farmer_code": farmer_code,
        "name": name,
        "phone": phone,
        "village": village,
        "district": district,
        "total_quota": total_quota,
        "land_acreage": acreage,
        "survey_number": survey_number
    })

@app.route("/api/farmers/<int:farmer_id>/profile", methods=["GET"])
def get_farmer_profile(farmer_id):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM farmers WHERE id = ?", (farmer_id,))
    farmer_row = cursor.fetchone()
    if not farmer_row:
        conn.close()
        return jsonify({"error": "Farmer not found"}), 404

    farmer = dict(farmer_row)

    cursor.execute("SELECT * FROM land_records WHERE farmer_id = ?", (farmer_id,))
    land_records = [
        {
            **dict(lr),
            "quota_remaining": max(0.0, lr["total_quota"] - lr["quota_used"])
        }
        for lr in cursor.fetchall()
    ]

    cursor.execute("SELECT * FROM panchayat_prechecks WHERE farmer_id = ? ORDER BY id DESC LIMIT 1", (farmer_id,))
    precheck_row = cursor.fetchone()
    precheck = dict(precheck_row) if precheck_row else None

    # Active booking
    cursor.execute('''
    SELECT sb.*, pc.name as mandi_name, qt.token_number, qt.is_tarpaulin_covered 
    FROM slot_bookings sb
    JOIN procurement_centres pc ON sb.mandi_id = pc.id
    LEFT JOIN queue_tokens qt ON sb.id = qt.booking_id
    WHERE sb.farmer_id = ? AND sb.status IN ('CONFIRMED', 'CHECKED_IN', 'SERVING', 'WEIGHED')
    ORDER BY sb.id DESC LIMIT 1
    ''', (farmer_id,))
    active_row = cursor.fetchone()
    active_booking_data = dict(active_row) if active_row else None

    # Past sales passbook
    cursor.execute('''
    SELECT wl.*, sb.booking_ref, sb.crop_type, dpb.status as dbt_status, dpb.pfms_utr_ref as dbt_utr
    FROM weighbridge_logs wl
    JOIN slot_bookings sb ON wl.booking_id = sb.id
    LEFT JOIN dbt_payment_batches dpb ON wl.dbt_batch_id = dpb.id
    WHERE sb.farmer_id = ?
    ORDER BY wl.id DESC
    ''', (farmer_id,))
    passbook_rows = cursor.fetchall()
    passbook = [
        {
            "log_id": r["id"],
            "date": r["logged_at"][:10] if r["logged_at"] else "15 Oct 2026",
            "booking_ref": r["booking_ref"],
            "crop_type": r["crop_type"],
            "net_weight_qtl": r["net_weight"],
            "msp_rate": r["msp_rate"],
            "total_amount": r["total_amount"],
            "moisture": r["moisture_reading"],
            "scale_slip_photo": r["scale_slip_photo"],
            "dbt_status": r["dbt_status"] or "APPROVED_BY_ADMIN",
            "dbt_utr": r["dbt_utr"] or "PFMS-RBI-908234112"
        }
        for r in passbook_rows
    ]

    conn.close()

    return jsonify({
        "farmer": farmer,
        "land_records": land_records,
        "panchayat_precheck": precheck,
        "active_booking": active_booking_data,
        "passbook": passbook
    })

@app.route("/api/farmers/<int:farmer_id>/analytics", methods=["GET"])
def get_farmer_analytics(farmer_id):
    # Graphical representation data of visits, quintals sold & earnings over time
    chart_data = {
        "labels": ["Kharif 2024", "Rabi 2025", "Kharif 2025", "Rabi 2026", "Current Harvest (2026)"],
        "visits": [1, 2, 2, 1, 1],
        "quantity_qtl": [20.0, 35.0, 42.0, 15.0, 40.0],
        "earnings_rs": [43600, 77000, 95760, 34800, 92800],
        "crop_breakdown": {
            "Paddy (Grade A)": 112.0,
            "Wheat (FAQ)": 40.0
        }
    }
    return jsonify(chart_data)

@app.route("/api/mandis", methods=["GET"])
def get_mandis():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM procurement_centres")
    rows = cursor.fetchall()
    res = [
        {
            **dict(m),
            "daily_capacity": m["daily_capacity_trucks"],
            "current_queue": m["current_queue_count"],
            "congestion_level": "RED" if m["current_queue_count"] > 60 else ("YELLOW" if m["current_queue_count"] > 25 else "GREEN")
        }
        for m in rows
    ]
    conn.close()
    return jsonify(res)

@app.route("/api/bookings/create", methods=["POST"])
def create_booking():
    data = request.json or {}
    farmer_id = data.get("farmer_id")
    mandi_id = data.get("mandi_id")
    crop_type = data.get("crop_type", "Paddy (Grade A)")
    quantity = float(data.get("quantity_quintals", 0))
    booking_date = data.get("booking_date", datetime.now().strftime("%Y-%m-%d"))
    time_slot = data.get("time_slot", "10:00 AM - 11:00 AM")
    vehicle_type = data.get("vehicle_type", "Tractor-Trolley")
    vehicle_number = data.get("vehicle_number", "KA-36-TR-4021")
    soil_color = data.get("soil_color_answered", "Black Soil")
    growth_duration = data.get("growth_duration_answered", "90–120 Days")
    grain_hardness = data.get("grain_hardness_answered", "Crisp & Hard (<15% FAQ)")
    fertilizer_used = data.get("fertilizer_used_answered", "Organic / Compost")
    drying_days = int(data.get("drying_days_answered", 3))

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM farmers WHERE id = ?", (farmer_id,))
    farmer = cursor.fetchone()
    if not farmer:
        conn.close()
        return jsonify({"error": "Farmer not found"}), 404

    cursor.execute("SELECT * FROM land_records WHERE farmer_id = ?", (farmer_id,))
    land = cursor.fetchone()
    if land:
        rem_quota = land["total_quota"] - land["quota_used"]
        if quantity > rem_quota:
            conn.close()
            return jsonify({
                "error": f"Booking quantity ({quantity} Qtl) exceeds remaining land quota ({rem_quota:.1f} Qtl)! Land ceiling enforced."
            }), 400

    cursor.execute("SELECT * FROM procurement_centres WHERE id = ?", (mandi_id,))
    mandi = cursor.fetchone()
    if mandi and mandi["is_frozen"]:
        conn.close()
        return jsonify({"error": "This Mandi is temporarily frozen due to weather advisories."}), 400

    booking_ref = f"BK-2026-{uuid.uuid4().hex[:6].upper()}"
    qr_data = f"KISANDWAR:{booking_ref}:{farmer['farmer_id']}:{quantity}QTL:{vehicle_number}"
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute('''
    INSERT INTO slot_bookings (booking_ref, farmer_id, mandi_id, crop_type, quantity_quintals, booking_date, time_slot, vehicle_type, vehicle_number, soil_color_answered, drying_days_answered, status, qr_code_data, created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ''', (booking_ref, farmer_id, mandi_id, crop_type, quantity, booking_date, time_slot, vehicle_type, vehicle_number, soil_color, drying_days, "CONFIRMED", qr_data, now_str))

    booking_id = cursor.lastrowid

    if land:
        cursor.execute("UPDATE land_records SET quota_used = quota_used + ? WHERE id = ?", (quantity, land["id"]))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Procurement slot confirmed successfully!",
        "booking_ref": booking_ref,
        "qr_code_data": qr_data,
        "booking_id": booking_id
    })

# ----------------- MANDI FIELD APIS ----------------- #
@app.route("/api/mandi/<int:mandi_id>/schedule", methods=["GET"])
def get_mandi_schedule(mandi_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
    SELECT sb.*, f.name as farmer_name, f.phone as farmer_phone, qt.token_number, qt.is_tarpaulin_covered
    FROM slot_bookings sb
    JOIN farmers f ON sb.farmer_id = f.id
    LEFT JOIN queue_tokens qt ON sb.id = qt.booking_id
    WHERE sb.mandi_id = ?
    ORDER BY sb.id DESC
    ''', (mandi_id,))
    rows = cursor.fetchall()
    schedule = [
        {
            "booking_id": r["id"],
            "booking_ref": r["booking_ref"],
            "farmer_name": r["farmer_name"],
            "farmer_phone": r["farmer_phone"],
            "crop_type": r["crop_type"],
            "quantity": r["quantity_quintals"],
            "time_slot": r["time_slot"],
            "vehicle_number": r["vehicle_number"],
            "status": r["status"],
            "token_number": r["token_number"],
            "is_tarpaulin_covered": bool(r["is_tarpaulin_covered"])
        }
        for r in rows
    ]
    conn.close()
    return jsonify(schedule)

@app.route("/api/mandi/scan-qr", methods=["POST"])
def mandi_scan_qr():
    data = request.json or {}
    qr_text = data.get("qr_code_data", "")
    mandi_id = int(data.get("mandi_id", 1))

    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT sb.*, f.name as farmer_name FROM slot_bookings sb JOIN farmers f ON sb.farmer_id = f.id WHERE sb.qr_code_data = ?", (qr_text,))
    booking = cursor.fetchone()

    if not booking:
        for part in qr_text.split(":"):
            if part.startswith("BK-"):
                cursor.execute("SELECT sb.*, f.name as farmer_name FROM slot_bookings sb JOIN farmers f ON sb.farmer_id = f.id WHERE sb.booking_ref = ?", (part,))
                booking = cursor.fetchone()
                break

    if not booking:
        conn.close()
        return jsonify({"error": "Invalid or unrecognized QR Code pass!"}), 404

    cursor.execute("SELECT MAX(token_number) FROM queue_tokens WHERE mandi_id = ?", (mandi_id,))
    max_token = cursor.fetchone()[0]
    next_token_num = (max_token + 1) if max_token else 43

    cursor.execute("SELECT * FROM queue_tokens WHERE booking_id = ?", (booking["id"],))
    existing_token = cursor.fetchone()

    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    if not existing_token:
        cursor.execute(
            "INSERT INTO queue_tokens (token_number, booking_id, mandi_id, status, check_in_time) VALUES (?,?,?,?,?)",
            (next_token_num, booking["id"], mandi_id, "SERVING", now_str)
        )
        assigned_token = next_token_num
    else:
        cursor.execute("UPDATE queue_tokens SET status = 'SERVING' WHERE id = ?", (existing_token["id"],))
        assigned_token = existing_token["token_number"]

    cursor.execute("UPDATE slot_bookings SET status = 'SERVING' WHERE id = ?", (booking["id"],))
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": f"QR Verified! Gate Check-In successful for {booking['farmer_name']}.",
        "token_number": assigned_token,
        "booking_ref": booking["booking_ref"],
        "status": "SERVING"
    })

@app.route("/api/mandi/queue-action", methods=["POST"])
def mandi_queue_action():
    data = request.json or {}
    action = data.get("action")
    mandi_id = int(data.get("mandi_id", 1))

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM queue_tokens WHERE mandi_id = ? AND status = 'SERVING' ORDER BY token_number ASC LIMIT 1", (mandi_id,))
    current_token = cursor.fetchone()

    if not current_token:
        cursor.execute("SELECT * FROM queue_tokens WHERE mandi_id = ? AND status = 'WAITING' ORDER BY token_number ASC LIMIT 1", (mandi_id,))
        current_token = cursor.fetchone()

    if not current_token:
        conn.close()
        return jsonify({"error": "No active tokens in queue."}), 400

    token_num = current_token["token_number"]
    if action == "call_next":
        token_num += 1
        cursor.execute("UPDATE queue_tokens SET token_number = ?, status = 'SERVING' WHERE id = ?", (token_num, current_token["id"]))
    elif action == "hold":
        cursor.execute("UPDATE queue_tokens SET status = 'ON_HOLD' WHERE id = ?", (current_token["id"],))
    elif action == "absent":
        cursor.execute("UPDATE queue_tokens SET status = 'ABSENT' WHERE id = ?", (current_token["id"],))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "token_number": token_num,
        "message": f"Queue updated: Now Serving Token #{token_num}"
    })

@app.route("/api/mandi/weighbridge", methods=["POST"])
def mandi_weighbridge():
    data = request.json or {}
    booking_id = int(data.get("booking_id", 1))
    gross_wt = float(data.get("gross_weight", 55.0))
    tare_wt = float(data.get("tare_weight", 15.0))
    moisture = float(data.get("moisture_reading", 14.2))
    scale_photo = data.get("scale_slip_photo", "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=60")

    net_wt = max(0.0, gross_wt - tare_wt)
    msp_rate = 2320.0
    total_amount = round(net_wt * msp_rate, 2)

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM slot_bookings WHERE id = ?", (booking_id,))
    booking = cursor.fetchone()
    if not booking:
        conn.close()
        return jsonify({"error": "Booking not found"}), 404

    batch_ref = f"DBT-BATCH-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute(
        "INSERT INTO dbt_payment_batches (batch_ref, mandi_id, total_farmers, total_payout, status, created_at) VALUES (?,?,?,?,?,?)",
        (batch_ref, booking["mandi_id"], 1, total_amount, "SUBMITTED", now_str)
    )
    batch_id = cursor.lastrowid

    cursor.execute('''
    INSERT INTO weighbridge_logs (booking_id, token_number, gross_weight, tare_weight, net_weight, moisture_reading, msp_rate, total_amount, scale_slip_photo, logged_at, dbt_batch_id)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
    ''', (booking["id"], 42, gross_wt, tare_wt, net_wt, moisture, msp_rate, total_amount, scale_photo, now_str, batch_id))

    cursor.execute("UPDATE slot_bookings SET status = 'COMPLETED' WHERE id = ?", (booking["id"],))
    cursor.execute("UPDATE queue_tokens SET status = 'COMPLETED' WHERE booking_id = ?", (booking["id"],))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": f"Weight recorded ({net_wt} Qtl). Total Payout: ₹{total_amount:,}. DBT batch submitted to Admin!",
        "net_weight": net_wt,
        "total_amount": total_amount,
        "batch_ref": batch_ref
    })

@app.route("/api/mandi/deploy-rain-squad", methods=["POST"])
def deploy_rain_squad():
    data = request.json or {}
    mandi_id = int(data.get("mandi_id", 1))

    conn = get_db()
    cursor = conn.cursor()

    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("UPDATE queue_tokens SET is_tarpaulin_covered = 1, covered_timestamp = ? WHERE mandi_id = ? AND status IN ('WAITING', 'SERVING', 'WEIGHING')", (now_str, mandi_id))
    cursor.execute("UPDATE procurement_centres SET tarpaulin_stock = MAX(0, tarpaulin_stock - 3) WHERE id = ?", (mandi_id,))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "☔ Rapid Monsoon Squad Deployed! 3 Laborers have secured waiting tractors with heavy-duty tarpaulins & ropes. SMS broadcast sent to farmers."
    })

# ----------------- ADMIN / MINISTRY APIS ----------------- #
@app.route("/api/admin/analytics", methods=["GET"])
def get_admin_analytics():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM procurement_centres")
    mandis_rows = cursor.fetchall()
    mandis = [
        {
            **dict(m),
            "daily_capacity": m["daily_capacity_trucks"],
            "current_queue": m["current_queue_count"],
            "congestion_level": "RED" if m["current_queue_count"] > 60 else ("YELLOW" if m["current_queue_count"] > 25 else "GREEN")
        }
        for m in mandis_rows
    ]

    cursor.execute("SELECT SUM(net_weight), SUM(total_amount), COUNT(*) FROM weighbridge_logs")
    agg = cursor.fetchone()
    total_qtl = (agg[0] or 0.0) + 12840.0
    total_dbt = (agg[1] or 0.0) + 29788800.0
    logs_count = agg[2] or 0

    cursor.execute('''
    SELECT dpb.*, pc.name as mandi_name 
    FROM dbt_payment_batches dpb
    JOIN procurement_centres pc ON dpb.mandi_id = pc.id
    WHERE dpb.status = 'SUBMITTED'
    ORDER BY dpb.id DESC
    ''')
    batch_rows = cursor.fetchall()
    pending_batches = [
        {
            "id": b["id"],
            "batch_ref": b["batch_ref"],
            "mandi_name": b["mandi_name"],
            "total_farmers": b["total_farmers"],
            "total_payout": b["total_payout"],
            "status": b["status"],
            "created_at": b["created_at"]
        }
        for b in batch_rows
    ]

    anomaly_alerts = [
        {
            "id": 1,
            "type": "QUOTA_CEILING_WARNING",
            "message": "Trader alert: Attempted booking of 85 Qtl rejected on Land SY-88/B (Ceiling: 78 Qtl).",
            "severity": "HIGH",
            "time": "12 mins ago"
        },
        {
            "id": 2,
            "type": "RAIN_RISK_ALERT",
            "message": "Monsoon alert: Raichur APMC yard rain probability at 85%. Tarpaulin squad activated.",
            "severity": "MEDIUM",
            "time": "25 mins ago"
        }
    ]

    conn.close()

    return jsonify({
        "kpis": {
            "total_procured_metric_tons": round(total_qtl / 10, 1),
            "target_metric_tons": 25000.0,
            "target_achieved_pct": round(((total_qtl / 10) / 25000.0) * 100, 1),
            "total_dbt_disbursed_rs": total_dbt,
            "total_farmers_served": 1420 + logs_count,
            "active_mandis_count": len(mandis)
        },
        "mandis": mandis,
        "pending_dbt_batches": pending_batches,
        "anomaly_alerts": anomaly_alerts
    })

@app.route("/api/admin/farmer-dbt-history", methods=["GET"])
def get_admin_farmer_dbt_history():
    # Returns comprehensive monthly and yearly financial disbursement records for each farmer
    history = [
        {
            "farmer_id": "FARM-KA-8941",
            "name": "Basavaraj Gowda (ಬಸವರಾಜ್ ಗೌಡ)",
            "district": "Raichur, Karnataka",
            "bank_account": "XXXXXX4512 (SBIN0001244)",
            "year": "2026",
            "month": "October",
            "crop_type": "Paddy (Grade A)",
            "quantity_qtl": 40.0,
            "total_dbt_paid": 92800.0,
            "payment_status": "APPROVED",
            "pfms_utr": "PFMS-RBI-908234112",
            "date": "19 Oct 2026"
        },
        {
            "farmer_id": "FARM-KA-8941",
            "name": "Basavaraj Gowda (ಬಸವರಾಜ್ ಗೌಡ)",
            "district": "Raichur, Karnataka",
            "bank_account": "XXXXXX4512 (SBIN0001244)",
            "year": "2026",
            "month": "October",
            "crop_type": "Paddy (Grade A)",
            "quantity_qtl": 15.0,
            "total_dbt_paid": 34800.0,
            "payment_status": "DISBURSED",
            "pfms_utr": "PFMS-RBI-108842199",
            "date": "15 Oct 2026"
        },
        {
            "farmer_id": "FARM-TN-3022",
            "name": "Murugan Shanmugam (முருகன் சண்முகம்)",
            "district": "Thanjavur, Tamil Nadu",
            "bank_account": "XXXXXX8934 (IOBA0000321)",
            "year": "2026",
            "month": "September",
            "crop_type": "Paddy (Common)",
            "quantity_qtl": 48.0,
            "total_dbt_paid": 109440.0,
            "payment_status": "DISBURSED",
            "pfms_utr": "PFMS-RBI-883921004",
            "date": "24 Sep 2026"
        },
        {
            "farmer_id": "FARM-AP-4109",
            "name": "Venkateswara Rao (వెంకటేశ్వర రావు)",
            "district": "Guntur, Andhra Pradesh",
            "bank_account": "XXXXXX1129 (ANDB0000876)",
            "year": "2026",
            "month": "September",
            "crop_type": "Paddy (Grade A)",
            "quantity_qtl": 50.0,
            "total_dbt_paid": 116000.0,
            "payment_status": "DISBURSED",
            "pfms_utr": "PFMS-RBI-772910384",
            "date": "18 Sep 2026"
        },
        {
            "farmer_id": "FARM-HR-1098",
            "name": "Ramesh Kumar Sharma (रमेश शर्मा)",
            "district": "Karnal, Haryana",
            "bank_account": "XXXXXX7712 (PUNB0002143)",
            "year": "2026",
            "month": "April",
            "crop_type": "Wheat (FAQ)",
            "quantity_qtl": 75.0,
            "total_dbt_paid": 170625.0,
            "payment_status": "DISBURSED",
            "pfms_utr": "PFMS-RBI-449102834",
            "date": "20 Apr 2026"
        },
        {
            "farmer_id": "FARM-KA-8941",
            "name": "Basavaraj Gowda (ಬಸವರಾಜ್ ಗೌಡ)",
            "district": "Raichur, Karnataka",
            "bank_account": "XXXXXX4512 (SBIN0001244)",
            "year": "2025",
            "month": "November",
            "crop_type": "Paddy (Grade A)",
            "quantity_qtl": 42.0,
            "total_dbt_paid": 95760.0,
            "payment_status": "DISBURSED",
            "pfms_utr": "PFMS-RBI-339102844",
            "date": "10 Nov 2025"
        }
    ]
    return jsonify(history)

@app.route("/api/admin/dbt-bulk-approve", methods=["POST"])
def dbt_bulk_approve():
    conn = get_db()
    cursor = conn.cursor()

    utr_ref = f"PFMS-RBI-{uuid.uuid4().hex[:9].upper()}"
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("SELECT SUM(total_payout), COUNT(*) FROM dbt_payment_batches WHERE status = 'SUBMITTED'")
    row = cursor.fetchone()
    total_approved = row[0] or 0.0
    count = row[1] or 0

    cursor.execute("UPDATE dbt_payment_batches SET status = 'APPROVED_BY_ADMIN', approved_at = ?, pfms_utr_ref = ? WHERE status = 'SUBMITTED'", (now_str, utr_ref))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "approved_batches_count": count,
        "total_approved_amount": total_approved,
        "message": f"✅ Success! {count} DBT Payment Batches approved (₹{total_approved:,.2f}). Funds dispatched to farmer bank accounts via PFMS."
    })

@app.route("/api/admin/toggle-mandi-freeze", methods=["POST"])
def toggle_mandi_freeze():
    data = request.json or {}
    mandi_id = int(data.get("mandi_id", 1))

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT is_frozen, name FROM procurement_centres WHERE id = ?", (mandi_id,))
    mandi = cursor.fetchone()
    if not mandi:
        conn.close()
        return jsonify({"error": "Mandi not found"}), 404

    new_state = 0 if mandi["is_frozen"] else 1
    cursor.execute("UPDATE procurement_centres SET is_frozen = ? WHERE id = ?", (new_state, mandi_id))

    conn.commit()
    conn.close()

    status_str = "FROZEN (Bookings Paused)" if new_state else "ACTIVE (Bookings Open)"
    return jsonify({
        "success": True,
        "is_frozen": bool(new_state),
        "message": f"Emergency override: {mandi['name']} is now {status_str}."
    })

@app.route("/api/admin/warehouse-stock", methods=["GET"])
def get_warehouse_stock():
    warehouses = [
        {
            "id": "WH-KA-01",
            "name": "Central Warehousing Corp (CWC) Raichur",
            "district": "Raichur, Karnataka",
            "total_capacity_qtl": 40000,
            "total_stored_qtl": 31500,
            "utilization_pct": 78.8,
            "moisture_level": "13.1% (Optimal)",
            "safety_status": "Fumigated & Pest-Free 🟢",
            "crops": [
                {"crop": "Paddy (Grade A)", "stored_qtl": 22000, "bag_count": 44000},
                {"crop": "Sorghum (Jowar)", "stored_qtl": 9500, "bag_count": 19000}
            ]
        },
        {
            "id": "WH-KA-02",
            "name": "State Warehousing Corp (SWC) Dharwad Godown",
            "district": "Dharwad, Karnataka",
            "total_capacity_qtl": 35000,
            "total_stored_qtl": 24800,
            "utilization_pct": 70.9,
            "moisture_level": "13.4% (Safe)",
            "safety_status": "Fumigated & Pest-Free 🟢",
            "crops": [
                {"crop": "Paddy (Grade A)", "stored_qtl": 14500, "bag_count": 29000},
                {"crop": "Maize", "stored_qtl": 5000, "bag_count": 10000},
                {"crop": "Sorghum (Jowar)", "stored_qtl": 5300, "bag_count": 10600}
            ]
        },
        {
            "id": "WH-TN-01",
            "name": "FCI Modern Grain Silo Complex",
            "district": "Thanjavur, Tamil Nadu",
            "total_capacity_qtl": 45000,
            "total_stored_qtl": 32900,
            "utilization_pct": 73.1,
            "moisture_level": "12.8% (Excellent)",
            "safety_status": "Automated Aeration Active 🟢",
            "crops": [
                {"crop": "Paddy (Common & Grade A)", "stored_qtl": 32900, "bag_count": 65800}
            ]
        },
        {
            "id": "WH-HR-01",
            "name": "CWC Modern Wheat Buffer Godown",
            "district": "Karnal, Haryana",
            "total_capacity_qtl": 30000,
            "total_stored_qtl": 19250,
            "utilization_pct": 64.2,
            "moisture_level": "11.9% (Dry & FAQ Safe)",
            "safety_status": "Fumigated & Pest-Free 🟢",
            "crops": [
                {"crop": "Wheat (FAQ)", "stored_qtl": 19250, "bag_count": 38500}
            ]
        }
    ]

    summary = {
        "total_warehouses": len(warehouses),
        "total_capacity_qtl": 150000,
        "total_stored_qtl": 108450,
        "overall_utilization_pct": 72.3,
        "crop_totals": {
            "Paddy": 69400,
            "Wheat": 19250,
            "Sorghum (Jowar)": 14800,
            "Maize": 5000
        }
    }

    return jsonify({"summary": summary, "warehouses": warehouses})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[KisanDwar] Backend running on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)

