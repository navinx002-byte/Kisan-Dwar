from datetime import datetime
from database import get_db, init_db

def seed():
    init_db()
    conn = get_db()
    cursor = conn.cursor()

    # Check if already seeded
    cursor.execute("SELECT COUNT(*) FROM farmers")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    # 1. Seed Farmers
    farmers = [
        ("FARM-KA-8941", "Basavaraj Gowda (ಬಸವರಾಜ್ ಗೌಡ)", "9845123456", "5421", "Sirwar", "Raichur", "kannada", "XXXXXX4512", "SBIN0001244"),
        ("FARM-TN-3022", "Murugan Shanmugam (முருகன் சண்முகம்)", "9443198765", "8934", "Thiruvaiyaru", "Thanjavur", "tamil", "XXXXXX8934", "IOBA0000321"),
        ("FARM-AP-4109", "Venkateswara Rao (వెంకటేశ్వర రావు)", "9989012345", "1129", "Tenali", "Guntur", "telugu", "XXXXXX1129", "ANDB0000876"),
        ("FARM-HR-1098", "Ramesh Kumar Sharma (रमेश शर्मा)", "9812045678", "7712", "Gharaunda", "Karnal", "hindi", "XXXXXX7712", "PUNB0002143")
    ]
    cursor.executemany(
        "INSERT INTO farmers (farmer_id, name, phone, aadhaar_last4, village, district, preferred_lang, bank_account, bank_ifsc) VALUES (?,?,?,?,?,?,?,?,?)",
        farmers
    )

    # 2. Seed Land Records
    land_records = [
        (1, "SY-142/2A", 2.5, "Black Soil", "Paddy (Grade A)", 25.0, 62.5, 15.0),
        (2, "TN-SY-88/B", 3.0, "Alluvial Soil", "Paddy (Common)", 26.0, 78.0, 0.0),
        (3, "AP-SY-301/1", 4.0, "Red Sandy Loam", "Paddy (Grade A)", 24.0, 96.0, 20.0),
        (4, "HR-SY-19/4", 5.0, "Alluvial Loam", "Wheat (FAQ)", 22.0, 110.0, 35.0)
    ]
    cursor.executemany(
        "INSERT INTO land_records (farmer_id, survey_number, land_acreage, soil_type, crop_type, district_yield_rate, total_quota, quota_used) VALUES (?,?,?,?,?,?,?,?)",
        land_records
    )

    # 3. Seed Procurement Centres
    mandis = [
        ("MANDI-KA-01", "APMC Yard, Raichur (Main Gate 1)", "Raichur", "Karnataka", 16.2076, 77.3463, 120, 8, 20, 85, 0, 250, 3),
        ("MANDI-TN-02", "Thanjavur Direct Purchase Centre (DPC)", "Thanjavur", "Tamil Nadu", 10.7870, 79.1378, 150, 35, 55, 30, 0, 180, 4),
        ("MANDI-AP-03", "Guntur APMC Grain Yard", "Guntur", "Andhra Pradesh", 16.3067, 80.4365, 180, 92, 120, 10, 0, 300, 5),
        ("MANDI-HR-04", "Karnal New Grain Market", "Karnal", "Haryana", 29.6857, 76.9905, 200, 14, 15, 5, 0, 400, 3)
    ]
    cursor.executemany(
        "INSERT INTO procurement_centres (mandi_code, name, district, state, lat, lng, daily_capacity_trucks, current_queue_count, avg_wait_mins, rain_risk_percent, is_frozen, tarpaulin_stock, labor_crew_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        mandis
    )

    # 4. Seed Panchayat Pre-Check
    cursor.execute(
        "INSERT INTO panchayat_prechecks (farmer_id, survey_number, crop_type, probe_test_date, moisture_percent, foreign_matter_percent, status, certificate_code, officer_name) VALUES (?,?,?,?,?,?,?,?,?)",
        (1, "SY-142/2A", "Paddy (Grade A)", "2026-10-18 10:30:00", 14.2, 0.8, "PASSED", "PAN-RC-2026-8812", "K. Suresh (Gram Agri Officer)")
    )

    # 5. Seed Active Booking & Live Token
    cursor.execute(
        "INSERT INTO slot_bookings (booking_ref, farmer_id, mandi_id, crop_type, quantity_quintals, booking_date, time_slot, vehicle_type, vehicle_number, soil_color_answered, drying_days_answered, status, qr_code_data, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        ("BK-2026-9042", 1, 1, "Paddy (Grade A)", 40.0, "Today", "10:00 AM - 11:00 AM", "Tractor-Trolley", "KA-36-TR-4021", "Black Soil", 3, "SERVING", "KISANDWAR:BK-2026-9042:FARM-KA-8941:40QTL", "2026-10-19 09:15:00")
    )
    booking_id = cursor.lastrowid

    cursor.execute(
        "INSERT INTO queue_tokens (token_number, booking_id, mandi_id, status, check_in_time, is_tarpaulin_covered) VALUES (?,?,?,?,?,?)",
        (42, booking_id, 1, "SERVING", "2026-10-19 09:30:00", 0)
    )

    # 6. Seed Past Sales Records for Passbook
    cursor.execute(
        "INSERT INTO slot_bookings (booking_ref, farmer_id, mandi_id, crop_type, quantity_quintals, booking_date, time_slot, vehicle_type, vehicle_number, status, qr_code_data, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
        ("BK-2026-1088", 1, 1, "Paddy (Grade A)", 15.0, "15 Oct 2026", "09:00 AM - 10:00 AM", "Tractor-Trolley", "KA-36-TR-4021", "COMPLETED", "KISANDWAR:BK-2026-1088:COMPLETED", "2026-10-15 08:30:00")
    )
    past_bk_id = cursor.lastrowid

    cursor.execute(
        "INSERT INTO dbt_payment_batches (batch_ref, mandi_id, total_farmers, total_payout, status, created_at, approved_at, pfms_utr_ref) VALUES (?,?,?,?,?,?,?,?)",
        ("DBT-BATCH-KA-2026-04", 1, 1, 34800.0, "APPROVED_BY_ADMIN", "2026-10-15 11:00:00", "2026-10-15 11:30:00", "PFMS-RBI-908234112")
    )
    batch_id = cursor.lastrowid

    cursor.execute(
        "INSERT INTO weighbridge_logs (booking_id, token_number, gross_weight, tare_weight, net_weight, moisture_reading, msp_rate, total_amount, scale_slip_photo, logged_at, dbt_batch_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        (past_bk_id, 18, 55.2, 40.2, 15.0, 13.8, 2320.0, 34800.0, "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=60", "2026-10-15 10:15:00", batch_id)
    )

    conn.commit()
    conn.close()
    print("✅ KisanDwar Seeded Successfully with zero-dependency SQLite!")

if __name__ == "__main__":
    seed()
