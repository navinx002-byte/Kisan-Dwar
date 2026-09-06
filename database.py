import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "kisandwar.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # 1. Farmers Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS farmers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farmer_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        aadhaar_last4 TEXT NOT NULL,
        village TEXT NOT NULL,
        district TEXT NOT NULL,
        preferred_lang TEXT DEFAULT 'kannada',
        bank_account TEXT NOT NULL,
        bank_ifsc TEXT NOT NULL
    )
    ''')

    # 2. Land Records Table (Quota & Ceiling)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS land_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farmer_id INTEGER NOT NULL,
        survey_number TEXT NOT NULL,
        land_acreage REAL NOT NULL,
        soil_type TEXT DEFAULT 'Black Soil',
        crop_type TEXT DEFAULT 'Paddy (Grade A)',
        district_yield_rate REAL DEFAULT 25.0,
        total_quota REAL NOT NULL,
        quota_used REAL DEFAULT 0.0,
        FOREIGN KEY (farmer_id) REFERENCES farmers(id)
    )
    ''')

    # 3. Procurement Centres (Mandis) Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS procurement_centres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mandi_code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        district TEXT NOT NULL,
        state TEXT DEFAULT 'Karnataka',
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        daily_capacity_trucks INTEGER DEFAULT 150,
        current_queue_count INTEGER DEFAULT 12,
        avg_wait_mins INTEGER DEFAULT 25,
        rain_risk_percent INTEGER DEFAULT 15,
        is_frozen INTEGER DEFAULT 0,
        tarpaulin_stock INTEGER DEFAULT 200,
        labor_crew_active INTEGER DEFAULT 3
    )
    ''')

    # 4. Panchayat Pre-Check Passes Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS panchayat_prechecks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farmer_id INTEGER NOT NULL,
        survey_number TEXT NOT NULL,
        crop_type TEXT NOT NULL,
        probe_test_date TEXT,
        moisture_percent REAL NOT NULL,
        foreign_matter_percent REAL DEFAULT 1.2,
        status TEXT DEFAULT 'PASSED',
        certificate_code TEXT UNIQUE,
        officer_name TEXT DEFAULT 'Gram Agri Assistant',
        FOREIGN KEY (farmer_id) REFERENCES farmers(id)
    )
    ''')

    # 5. Slot Bookings Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS slot_bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_ref TEXT UNIQUE NOT NULL,
        farmer_id INTEGER NOT NULL,
        mandi_id INTEGER NOT NULL,
        crop_type TEXT NOT NULL,
        quantity_quintals REAL NOT NULL,
        booking_date TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        vehicle_type TEXT DEFAULT 'Tractor-Trolley',
        vehicle_number TEXT DEFAULT 'KA-36-TR-4021',
        soil_color_answered TEXT,
        drying_days_answered INTEGER,
        status TEXT DEFAULT 'CONFIRMED',
        qr_code_data TEXT,
        created_at TEXT,
        FOREIGN KEY (farmer_id) REFERENCES farmers(id),
        FOREIGN KEY (mandi_id) REFERENCES procurement_centres(id)
    )
    ''')

    # 6. Queue Tokens Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS queue_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token_number INTEGER NOT NULL,
        booking_id INTEGER NOT NULL,
        mandi_id INTEGER NOT NULL,
        status TEXT DEFAULT 'WAITING',
        check_in_time TEXT,
        is_tarpaulin_covered INTEGER DEFAULT 0,
        covered_timestamp TEXT,
        FOREIGN KEY (booking_id) REFERENCES slot_bookings(id),
        FOREIGN KEY (mandi_id) REFERENCES procurement_centres(id)
    )
    ''')

    # 7. Weighbridge Logs Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS weighbridge_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        token_number INTEGER,
        gross_weight REAL NOT NULL,
        tare_weight REAL NOT NULL,
        net_weight REAL NOT NULL,
        moisture_reading REAL DEFAULT 14.5,
        msp_rate REAL DEFAULT 2320.0,
        total_amount REAL NOT NULL,
        scale_slip_photo TEXT,
        logged_at TEXT,
        dbt_batch_id INTEGER,
        FOREIGN KEY (booking_id) REFERENCES slot_bookings(id)
    )
    ''')

    # 8. DBT Payment Batches Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS dbt_payment_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_ref TEXT UNIQUE NOT NULL,
        mandi_id INTEGER NOT NULL,
        total_farmers INTEGER DEFAULT 1,
        total_payout REAL DEFAULT 0.0,
        status TEXT DEFAULT 'SUBMITTED',
        created_at TEXT,
        approved_at TEXT,
        pfms_utr_ref TEXT,
        FOREIGN KEY (mandi_id) REFERENCES procurement_centres(id)
    )
    ''')

    conn.commit()
    conn.close()
