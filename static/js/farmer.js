// KisanDwar - Master Multilingual Engine, Voice Audio Controller & Visual Analytics
// Supports Kannada, Tamil, Telugu, Hindi, and English (100% Native UI & Audio Readout)

let currentFarmerId = 1;
let currentLanguage = 'kannada';
let farmerProfileData = null;
let farmerVisitsChartInstance = null;

// Complete 100% Native Translations Dictionary
const fullTranslations = {
  kannada: {
    voice_lang: "kn-IN",
    welcome: "ಕಿಸಾನ್ ದ್ವಾರ ರೈತ ಪೋರ್ಟಲ್‌ಗೆ ಸುಸ್ವಾಗತ",
    nav_home: "🏠 ಮುಖಪುಟ / ಸಾರಾಂಶ",
    nav_analytics: "📈 ಭೇಟಿ ಮತ್ತು ಮಾರಾಟ ಗ್ರಾಫ್",
    nav_book: "📅 ಸ್ಲಾಟ್ ಬುಕಿಂಗ್",
    nav_token: "🎟️ ಲೈವ್ ಕ್ಯೂ ಟೋಕನ್",
    nav_passbook: "📜 ಮಾರಾಟ ಪಾಸ್‌ಬುಕ್",
    nav_profile: "👤 ಪ್ರೊಫೈಲ್ ಮತ್ತು ಭೂಮಿ ಕೋಟಾ",
    btn_voice_readout: "🔊 ಧ್ವನಿ ಓದುವಿಕೆ",
    btn_book_slot: "➕ ಹೊಸ ಸ್ಲಾಟ್ ಬುಕ್ ಮಾಡಿ",

    // Summary Cards
    summary_sold_title: "ಸರ್ಕಾರಕ್ಕೆ ಒಟ್ಟು ಮಾರಾಟ",
    summary_sold_sub: "110 ಚೀಲಗಳು ಮಾರಾಟವಾಗಿದೆ",
    summary_earn_title: "ಒಟ್ಟು ಡಿಬಿಟಿ ಆದಾಯ",
    summary_earn_sub: "100% ನೇರ ಬ್ಯಾಂಕ್ ವರ್ಗಾವಣೆ",
    summary_quota_title: "ಉಳಿದಿರುವ ಭೂಮಿ ಕೋಟಾ",
    summary_quota_sub: "ಒಟ್ಟು 62.5 ಕ್ವಿಂಟಾಲ್‌ನಲ್ಲಿ",
    summary_quality_title: "ಪಂಚಾಯತ್ ಗುಣಮಟ್ಟ",
    summary_quality_val: "ಉತ್ತೀರ್ಣ 🟢",
    summary_quality_sub: "ತೇವಾಂಶ: 14.2% (FAQ ಸರಿ)",

    // Words Summary Box & Single Graph
    analytics_box_title: "📢 ಅಧಿಕೃತ ಮಂಡಿ ಭೇಟಿ ಸಾರಾಂಶ (Official Mandi Summary)",
    btn_listen_summary: "🔊 ಸಾರಾಂಶ ಆಲಿಸಿ",
    visit_word_summary: "📊 ಭೇಟಿ ಸಾರಾಂಶ: ಈ ತಿಂಗಳು (ಅಕ್ಟೋಬರ್) ನೀವು ಮಂಡಿಗೆ 1 ಬಾರಿ ಭೇಟಿ ನೀಡಿದ್ದೀರಿ. ಈ ಋತುವಿನಲ್ಲಿ ಒಟ್ಟು 2 ಬಾರಿ ಭೇಟಿ ನೀಡಿ 55 ಕ್ವಿಂಟಾಲ್ ಧಾನ್ಯವನ್ನು ಸರ್ಕಾರಿ ಎಂಎಸ್‌ಪಿ (MSP) ದರದಲ್ಲಿ ಯಶಸ್ವಿಯಾಗಿ ಮಾರಾಟ ಮಾಡಿದ್ದೀರಿ. ಒಟ್ಟು ₹1,27,600 ಮೊತ್ತವು ನಿಮ್ಮ ಆಧಾರ್ ಲಿಂಕ್ ಆದ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಡಿಬಿಟಿ (DBT) ಮೂಲಕ ನೇರವಾಗಿ ಜಮೆಯಾಗಿದೆ. ಮುಂದಿನ ಸ್ಲಾಟ್ ಬುಕಿಂಗ್ ಲಭ್ಯವಿದೆ!",
    chart_main_title: "🌾 ಮಂಡಿ ಭೇಟಿ ಮತ್ತು ಧಾನ್ಯ ಮಾರಾಟದ ಇತಿಹಾಸ ಗ್ರಾಫ್",
    chart_sub_title: "ಪ್ರತಿ ಸುಗ್ಗಿಯ ಋತುವಿನಲ್ಲಿ ಸರ್ಕಾರಕ್ಕೆ ಮಾರಾಟವಾದ ಧಾನ್ಯದ ಪ್ರಮಾಣ (ಕ್ವಿಂಟಾಲ್)",
    chart_dataset_label: "ಮಾರಾಟವಾದ ಪ್ರಮಾಣ (ಕ್ವಿಂಟಾಲ್)",
    chart_timeline_badge: "ಸುಗ್ಗಿ ಇತಿಹಾಸ",
    chart_season_labels: ["ಖಾರೀಫ್ 2024", "ರಬಿ 2025", "ಖಾರೀಫ್ 2025", "ರಬಿ 2026", "ಪ್ರಸ್ತುತ ಸುಗ್ಗಿ (2026)"],

    // 5 Visual Questions
    wizard_step_title: "ಹಂತ-ಹಂತದ ಪರಿಶೀಲನೆ (5 ಪ್ರಶ್ನೆಗಳು)",
    wizard_main_title: "🌾 ಹೊಸ ಧಾನ್ಯ ಖರೀದಿ ಸ್ಲಾಟ್ ಬುಕ್ ಮಾಡಿ",
    listen_all_qs: "🔊 ಎಲ್ಲಾ 5 ಪ್ರಶ್ನೆಗಳನ್ನು ಆಲಿಸಿ",
    listen_btn: "🔊 ಆಲಿಸಿ",
    
    q1_title: "1. ಬೆಳೆಯನ್ನು ಯಾವಾಗ ಕಟಾವು ಮಾಡಲಾಯಿತು?",
    q1_opt1: "📅 ಕಳೆದ 7 ದಿನಗಳಲ್ಲಿ",
    q1_opt2: "📅 1–2 ವಾರಗಳ ಹಿಂದೆ",
    q1_opt3: "📅 1+ ತಿಂಗಳ ಹಿಂದೆ",
    q1_audio: "ಪ್ರಶ್ನೆ ಒಂದು: ಬೆಳೆಯನ್ನು ಯಾವಾಗ ಕಟಾವು ಮಾಡಲಾಯಿತು? ಕಳೆದ ಏಳು ದಿನಗಳಲ್ಲಿ, ಒಂದು ಅಥವಾ ಎರಡು ವಾರಗಳ ಹಿಂದೆ, ಅಥವಾ ಒಂದು ತಿಂಗಳ ಹಿಂದೆ?",

    q2_title: "2. ಬೆಳೆಯನ್ನು ಎಷ್ಟು ದಿನ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿದ್ದೀರಿ?",
    q2_opt1: "☀️ 0 ದಿನ (ಹಸಿ ಬೆಳೆ)",
    q2_opt2: "☀️ 2–3 ದಿನ (ಉತ್ತಮ)",
    q2_opt3: "☀️ 5+ ದಿನಗಳು",
    q2_audio: "ಪ್ರಶ್ನೆ ಎರಡು: ಬೆಳೆಯನ್ನು ಎಷ್ಟು ದಿನ ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸಿದ್ದೀರಿ? ಶೂನ್ಯ ದಿನ, ಎರಡು ಅಥವಾ ಮೂರು ದಿನಗಳು, ಅಥವಾ ಐದು ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು?",

    q3_title: "3. ನಿಮ್ಮ ಹೊಲದ ಮಣ್ಣಿನ ಬಣ್ಣ ಯಾವುದು? (ಭೂಲೇಖ್ ದಾಖಲೆ):",
    q3_opt1: "🟫 ಕಪ್ಪು ಮಣ್ಣು",
    q3_opt2: "🟥 ಕೆಂಪು ಮಣ್ಣು",
    q3_opt3: "🟨 ಮರಳು / ಜೇಡಿ ಮಣ್ಣು",
    q3_audio: "ಪ್ರಶ್ನೆ ಮೂರು: ನಿಮ್ಮ ಹೊಲದ ಮಣ್ಣಿನ ಬಣ್ಣ ಯಾವುದು? ಕಪ್ಪು ಮಣ್ಣು, ಕೆಂಪು ಮಣ್ಣು, ಅಥವಾ ಜೇಡಿ ಮಣ್ಣು?",

    q4_title: "4. ಧಾನ್ಯದ ಗಡಸುತನ ಮತ್ತು ತೇವಾಂಶ ಮಟ್ಟ:",
    q4_opt1: "🌾 ಗರಿಗರಿ / ಗಟ್ಟಿ (<15% FAQ)",
    q4_opt2: "🌾 ಸಾಧಾರಣ (16–17%)",
    q4_opt3: "🌾 ಮೆದು / ಹಸಿ (>18%)",
    q4_audio: "ಪ್ರಶ್ನೆ ನಾಲ್ಕು: ಧಾನ್ಯದ ಗಡಸುತನ ಮತ್ತು ತೇವಾಂಶ ಮಟ್ಟ ಹೇಗಿದೆ? ಗರಿಗರಿ ಗಟ್ಟಿ, ಸಾಧಾರಣ, ಅಥವಾ ಮೆದು ತೇವಾಂಶ?",

    q5_title: "5. ಧಾನ್ಯ ತರುವ ಸಾರಿಗೆ ವಾಹನ ಯಾವುದು?",
    q5_opt1: "🚜 ಟ್ರ್ಯಾಕ್ಟರ್-ಟ್ರಾಲಿ",
    q5_opt2: "🚚 ಸಣ್ಣ ಟ್ರಕ್ (ಟಾಟಾ ಏಸ್)",
    q5_opt3: "🛺 ಆಟೋ / ಮಿನಿ ವಾಹನ",
    q5_audio: "ಪ್ರಶ್ನೆ ಐದು: ಧಾನ್ಯ ತರುವ ಸಾರಿಗೆ ವಾಹನ ಯಾವುದು? ಟ್ರ್ಯಾಕ್ಟರ್ ಟ್ರಾಲಿ, ಸಣ್ಣ ಟ್ರಕ್, ಅಥವಾ ಆಟೋ ಮಿನಿ ವಾಹನ?",

    wizard_mandi_label: "ಖರೀದಿ ಕೇಂದ್ರ (ಮಂಡಿ) ಆಯ್ಕೆಮಾಡಿ:",
    wizard_qty_label: "ಮಾರಾಟ ಮಾಡುವ ಪ್ರಮಾಣ (ಕ್ವಿಂಟಾಲ್):",
    wizard_time_label: "ಆಗಮನದ ಸಮಯ ಕಿಟಕಿ:",
    btn_cancel: "ರದ್ದುಮಾಡಿ",
    btn_confirm_slot: "✅ ದೃಢೀಕರಿಸಿ ಮತ್ತು ಡಿಜಿಟಲ್ QR ಪಾಸ್ ಪಡೆಯಿರಿ",

    // Live Queue Tracker
    token_broadcaster_badge: "ಲೈವ್ ಮಂಡಿ ಕ್ಯೂ ಬ್ರಾಡ್‌ಕಾಸ್ಟರ್",
    token_yard_pos_title: "ನೈಜ ಸಮಯದ ಯಾರ್ಡ್ ಸ್ಥಾನ",
    token_yard_pos_sub: "ಎಪಿಎಂಸಿ ಯಾರ್ಡ್, ರಾಯಚೂರು • ಮುಖ್ಯ ತೂಕ ಗೇಟ್ 1",
    token_assigned_label: "ನಿಮಗೆ ನಿಗದಿಯಾದ ಟೋಕನ್",
    token_serving_info: "ಈಗ ತೂಕ ನಡೆಯುತ್ತಿರುವ ಟೋಕನ್: #40 • ಮುಂದೆ 2 ವಾಹನಗಳಿವೆ",
    token_wait_time_label: "ಅಂದಾಜು ಕಾಯುವ ಸಮಯ",
    token_wait_time_val: "~15 ನಿಮಿಷಗಳು",
    token_monsoon_prot_label: "ಮಳೆ ರಕ್ಷಣೆ",
    token_monsoon_prot_val: "☔ ಟಾರ್ಪಾಲಿನ್ ರಕ್ಷಿಸಲಾಗಿದೆ",
    token_view_qr_btn: "📱 ಗೇಟ್ ಪ್ರವೇಶ QR ಪಾಸ್ ವೀಕ್ಷಿಸಿ",

    // Passbook Table
    passbook_title: "ನನ್ನ ಧಾನ್ಯ ಖರೀದಿ ಪಾಸ್‌ಬುಕ್ ಮತ್ತು ಇತಿಹಾಸ",
    passbook_sub: "ಅಧಿಕೃತ ಕಾನೂನು ರಸೀದಿಗಳು ಮತ್ತು ಡಿಬಿಟಿ ಲೆಕ್ಕಪತ್ರ",
    passbook_verified_badge: "ಸರ್ಕಾರಿ ಪರಿಶೀಲಿತ ಲೆಡ್ಜರ್",
    th_date: "ದಿನಾಂಕ",
    th_crop: "ಬೆಳೆ / ಧಾನ್ಯ",
    th_weight: "ನಿವ್ವಳ ತೂಕ",
    th_rate: "ಎಂಎಸ್‌ಪಿ ದರ",
    th_total: "ಒಟ್ಟು ಮೊತ್ತ",
    th_status: "ಪಾವತಿ ಸ್ಥಿತಿ",
    th_cert: "ರಸೀದಿ",
    status_credited: "● ಜಮೆಯಾಗಿದೆ (DBT)",
    btn_ejform: "📥 e-J-Form",

    // Profile & Land Quota
    verified_farmer: "ಆಧಾರ್ ಪರಿಶೀಲಿಸಿದ ರೈತ",
    land_quota_title: "ಭೂ ಕಂದಾಯ ದಾಖಲೆ ಕೋಟಾ (ಭೂಲೇಖ್ ಪರಿಶೀಲಿಸಲಾಗಿದೆ)",
    precheck_passed: "🟢 ಗ್ರಾಮ ಪಂಚಾಯತ್ ತಪಾಸಣೆ ಉತ್ತೀರ್ಣ",
    survey_no: "ಸರ್ವೆ ನಂಬರ್",
    verified_acreage: "ಪರಿಶೀಲಿಸಿದ ಜಮೀನು",
    rem_quota: "ಉಳಿದಿರುವ ಕೋಟಾ ಮಿತಿ",
    quota_util_label: "ಋತುವಿನ ಕೋಟಾ ಬಳಕೆ:",
    quota_pct_label: "24% ಕೋಟಾ ಬಳಸಲಾಗಿದೆ",
    quota_formula_text: "ಸೂತ್ರ: 2.5 ಎಕರೆ × 25 ಕ್ವಿಂ/ಎಕರೆ = 62.5 ಕ್ವಿಂಟಾಲ್ ಗರಿಷ್ಠ",

    // Active Booking Card
    active_booking_title: "ಸಕ್ರಿಯ ಸ್ಲಾಟ್ ಬುಕಿಂಗ್",
    your_token: "ನಿಮ್ಮ ಕ್ಯೂ ಟೋಕನ್",
    now_serving: "ಈಗ ನಡೆಯುತ್ತಿರುವ ಟೋಕನ್",
    time_window: "ಸಮಯದ ಕಿಟಕಿ",
    vehicle_no: "ವಾಹನ ಸಂಖ್ಯೆ",
    est_wait: "ಅಂದಾಜು ಕಾಯುವಿಕೆ",
    rain_prot: "ಮಳೆ ರಕ್ಷಣೆ",
    show_qr_pass: "📱 ಗೇಟ್ ಕ್ಯೂಆರ್ ಪಾಸ್ ವೀಕ್ಷಿಸಿ",
    listen_status: "🔊 ಧ್ವನಿ ವಿವರಣೆ",
    rain_alert_msg: "ಮಳೆ ಎಚ್ಚರಿಕೆ: ಮಂಡಿ ಯಾರ್ಡ್‌ನಲ್ಲಿ ನಿಮ್ಮ ವಾಹನಕ್ಕೆ ಟಾರ್ಪಾಲಿನ್ ಹೊದಿಕೆ ಹಾಕಲಾಗಿದೆ",
    rain_covered_badge: "☔ ಟಾರ್ಪಾಲಿನ್ ಹೊದಿಸಲಾಗಿದೆ",
    rain_normal_badge: "ಸಾಮಾನ್ಯ",

    // Modals
    qr_modal_badge: "ಅಧಿಕೃತ ಗೇಟ್ ಪ್ರವೇಶ ಪಾಸ್",
    qr_modal_title: "ಮಂಡಿ ಖರೀದಿ ಕ್ಯೂಆರ್ ಪಾಸ್",
    qr_modal_tip: "ತಕ್ಷಣದ ಟೋಕನ್ ಸಕ್ರಿಯಗೊಳಿಸಲು ಆಗಮಿಸಿದ ತಕ್ಷಣ ಮಂಡಿ ಗೇಟ್ ಕ್ಯಾಮೆರಾಗೆ ಈ ಕ್ಯೂಆರ್ ತೋರಿಸಿ.",
    qr_modal_done: "ಮುಗಿಯಿತು",
    ejform_gov_title: "ಭಾರತ ಸರ್ಕಾರ • ಗ್ರಾಹಕ ವ್ಯವಹಾರಗಳ ಸಚಿವಾಲಯ",
    ejform_sub_title: "ಆಹಾರ ಮತ್ತು ಸಾರ್ವಜನಿಕ ವಿತರಣಾ ಇಲಾಖೆ • ಡಿಜಿಟಲ್ e-J-Form",
    ejform_print: "🖨️ ರಸೀದಿ ಪ್ರಿಂಟ್ ಮಾಡಿ",
    ejform_close: "ಮುಚ್ಚಿ"
  },

  tamil: {
    voice_lang: "ta-IN",
    welcome: "கிசான் துவார் விவசாய போர்ட்டலுக்கு வரவேற்கிறோம்",
    nav_home: "🏠 முகப்பு / சுருக்கம்",
    nav_analytics: "📈 வருகை & விற்பனை வரைபடம்",
    nav_book: "📅 முன்பதிவு ஸ்லாட்",
    nav_token: "🎟️ நேரலை டோக்கன்",
    nav_passbook: "📜 விற்பனை பாஸ்புக்",
    nav_profile: "👤 சுயவிவரம் & நில ஒதுக்கீடு",
    btn_voice_readout: "🔊 குரல் வாசிப்பு",
    btn_book_slot: "➕ புதிய முன்பதிவு",

    summary_sold_title: "அரசுக்கு விற்ற மொத்த தானியம்",
    summary_sold_sub: "110 மூட்டைகள் விற்கப்பட்டது",
    summary_earn_title: "மொத்த DBT வருமானம்",
    summary_earn_sub: "100% நேரடி வங்கி பரிமாற்றம்",
    summary_quota_title: "மீதமுள்ள நில ஒதுக்கீடு",
    summary_quota_sub: "மொத்த 62.5 குவிண்டாலில்",
    summary_quality_title: "பஞ்சாயத்து தரம்",
    summary_quality_val: "தேர்ச்சி 🟢",
    summary_quality_sub: "ஈரப்பதம்: 14.2% (FAQ சரி)",

    analytics_box_title: "📢 அதிகாரப்பூர்வ மண்டி வருகை சுருக்கம் (Official Mandi Summary)",
    btn_listen_summary: "🔊 சுருக்கத்தைக் கேளுங்கள்",
    visit_word_summary: "📊 வருகை சுருக்கம்: இந்த மாதம் (அக்டோபர்) நீங்கள் 1 முறை மண்டிக்கு வருகை தந்துள்ளீர்கள். இந்த பருவத்தில் மொத்தம் 2 முறை சென்று 55 குவிண்டால் தானியங்களை அரசு நிர்ணய விலையில் (MSP) விற்றுள்ளீர்கள். உங்கள் ஆதார் இணைக்கப்பட்ட வங்கிக் கணக்கில் ₹1,27,600 நேரடியாக (DBT) செலுத்தப்பட்டுள்ளது. அடுத்த முன்பதிவு தயாராக உள்ளது!",
    chart_main_title: "🌾 மண்டி வருகை & தானிய விற்பனை வரலாறு வரைபடம்",
    chart_sub_title: "அரசுக்கு ஒவ்வொரு பருவத்திலும் விற்பனை செய்யப்பட்ட தானிய அளவு (குவிண்டால்)",
    chart_dataset_label: "விற்பனை அளவு (குவிண்டால்)",
    chart_timeline_badge: "அறுவடை வரலாறு",
    chart_season_labels: ["காரீஃப் 2024", "ரபி 2025", "காரீஃப் 2025", "ரபி 2026", "தற்போதைய அறுவடை (2026)"],

    wizard_step_title: "படி-படியான சரிபார்ப்பு (5 கேள்விகள்)",
    wizard_main_title: "🌾 புதிய கொள்முதல் இடத்தை முன்பதிவு செய்யவும்",
    listen_all_qs: "🔊 அனைத்து 5 கேள்விகளையும் கேளுங்கள்",
    listen_btn: "🔊 கேள்",

    q1_title: "1. பயிர் எப்போது அறுவடை செய்யப்பட்டது?",
    q1_opt1: "📅 கடந்த 7 நாட்களில்",
    q1_opt2: "📅 1–2 வாரங்களுக்கு முன்",
    q1_opt3: "📅 1+ மாதத்திற்கு முன்",
    q1_audio: "கேள்வி ஒன்று: பயிர் எப்போது அறுவடை செய்யப்பட்டது? கடந்த ஏழு நாட்களில், ஒன்று அல்லது இரண்டு வாரங்களுக்கு முன், அல்லது ஒரு மாதத்திற்கு முன்?",

    q2_title: "2. பயிரை எத்தனை நாட்கள் வெயிலில் காயவைத்தீர்கள்?",
    q2_opt1: "☀️ 0 நாள் (பச்சை பயிர்)",
    q2_opt2: "☀️ 2–3 நாட்கள் (நல்லது)",
    q2_opt3: "☀️ 5+ நாட்கள்",
    q2_audio: "கேள்வி இரண்டு: பயிரை எத்தனை நாட்கள் வெயிலில் காயவைத்தீர்கள்? பூஜ்ஜிய நாள், இரண்டு முதல் மூன்று நாட்கள், அல்லது ஐந்து நாட்களுக்கு மேல்?",

    q3_title: "3. உங்கள் நிலத்தின் மண் நிறம் என்ன? (நில வருவாய் பதிவு):",
    q3_opt1: "🟫 கரிசல் மண்",
    q3_opt2: "🟥 செம்மண்",
    q3_opt3: "🟨 வண்டல் / களிமண்",
    q3_audio: "கேள்வி மூன்று: உங்கள் நிலத்தின் மண் நிறம் என்ன? கரிசல் மண், செம்மண், அல்லது வண்டல் மண்?",

    q4_title: "4. தானியத்தின் கடினத்தன்மை & ஈரப்பத நிலை:",
    q4_opt1: "🌾 மொறுமொறுப்பான / கடினமான (<15% FAQ)",
    q4_opt2: "🌾 மிதமான (16–17%)",
    q4_opt3: "🌾 மென்மையான / ஈரப்பதம் (>18%)",
    q4_audio: "கேள்வி நான்கு: தானிய கடினத்தன்மை மற்றும் ஈரப்பதம் எப்படி உள்ளது? கடினமானது, மிதமானது, அல்லது ஈரப்பதம் கொண்டதா?",

    q5_title: "5. தானியம் கொண்டு வரும் வாகனம் எது?",
    q5_opt1: "🚜 டிராக்டர்-டிராலி",
    q5_opt2: "🚚 சிறிய டிரக் (டாடா ஏஸ்)",
    q5_opt3: "🛺 ஆட்டோ / மினி வாகனம்",
    q5_audio: "கேள்வி ஐந்து: தானியம் கொண்டு வரும் வாகனம் எது? டிராக்டர் டிராலி, சிறிய டிரக், அல்லது ஆட்டோ?",

    wizard_mandi_label: "கொள்முதல் மையத்தை (மண்டி) தேர்ந்தெடுக்கவும்:",
    wizard_qty_label: "விற்க வேண்டிய அளவு (குவிண்டால்):",
    wizard_time_label: "வருகை நேர இடைவெளி:",
    btn_cancel: "ரத்துசெய்",
    btn_confirm_slot: "✅ உறுதிசெய்து டிஜிட்டல் QR பாஸ் பெறவும்",

    token_broadcaster_badge: "நேரலை மண்டி வரிசை ஒளிபரப்பு",
    token_yard_pos_title: "நிகழ்நேர யார்டு நிலை",
    token_yard_pos_sub: "APMC யார்டு, ராய்ச்சூர் • பிரதான எடை கேட் 1",
    token_assigned_label: "உங்களுக்கு ஒதுக்கப்பட்ட டோக்கன்",
    token_serving_info: "தற்போது எடை போடுவது: #40 • முன்னால் 2 வாகனங்கள்",
    token_wait_time_label: "மதிப்பிடப்பட்ட காத்திருப்பு நேரம்",
    token_wait_time_val: "~15 நிமிடங்கள்",
    token_monsoon_prot_label: "மழை பாதுகாப்பு",
    token_monsoon_prot_val: "☔ தார்பாய் மூடப்பட்டது",
    token_view_qr_btn: "📱 நுழைவு QR பாஸ் பார்க்கவும்",

    passbook_title: "எனது கொள்முதல் பாஸ்புக் & முந்தைய விற்பனை",
    passbook_sub: "அதிகாரப்பூர்வ e-J-Form ரசீதுகள் மற்றும் வங்கி DBT கணக்குகள்",
    passbook_verified_badge: "அரசு சரிபார்க்கப்பட்ட கணக்கு",
    th_date: "தேதி",
    th_crop: "பயிர் / தானியம்",
    th_weight: "நிகர எடை",
    th_rate: "MSP விலை",
    th_total: "மொத்த தொகை",
    th_status: "பணம் செலுத்திய நிலை",
    th_cert: "சான்றிதழ்",
    status_credited: "● செலுத்தப்பட்டது (DBT)",
    btn_ejform: "📥 e-J-Form",

    verified_farmer: "ஆதார் சரிபார்க்கப்பட்ட விவசாயி",
    land_quota_title: "நில வருவாய் பதிவு ஒதுக்கீடு (பூலேக் சரிபார்க்கப்பட்டது)",
    precheck_passed: "🟢 கிராம பஞ்சாயத்து சான்றிதழ் தேர்ச்சி",
    survey_no: "சர்வே எண்",
    verified_acreage: "சரிபார்க்கப்பட்ட நில அளவு",
    rem_quota: "மீதமுள்ள ஒதுக்கீடு வரம்பு",
    quota_util_label: "பருவ ஒதுக்கீடு பயன்பாடு:",
    quota_pct_label: "24% ஒதுக்கீடு பயன்படுத்தப்பட்டது",
    quota_formula_text: "சூத்திரம்: 2.5 ஏக்கர் × 25 குவி/ஏக்கர் = 62.5 குவிண்டால் அதிகபட்சம்",

    active_booking_title: "செயலில் உள்ள முன்பதிவு",
    your_token: "உங்கள் க்யூ டோக்கன்",
    now_serving: "தற்போது அழைப்பது",
    time_window: "நேர இடைவெளி",
    vehicle_no: "வாகன எண்",
    est_wait: "மதிப்பிடப்பட்ட காத்திருப்பு",
    rain_prot: "மழை பாதுகாப்பு",
    show_qr_pass: "📱 நுழைவு QR பாஸ் பார்க்கவும்",
    listen_status: "🔊 குரல் விளக்கம்",
    rain_alert_msg: "மழை எச்சரிக்கை: மண்டியில் உங்கள் டிராக்டருக்கு தார்பாய் மூடப்பட்டுள்ளது",
    rain_covered_badge: "☔ தார்பாய் மூடப்பட்டது",
    rain_normal_badge: "வழக்கமான",

    qr_modal_badge: "அதிகாரப்பூர்வ கேட் நுழைவு பாஸ்",
    qr_modal_title: "மண்டி கொள்முதல் QR பாஸ்",
    qr_modal_tip: "டோக்கன் உடனே செயல்பட மண்டி கேட் கேமராவில் இந்த QR குறியீட்டைக் காட்டவும்.",
    qr_modal_done: "முடிந்தது",
    ejform_gov_title: "இந்திய அரசு • நுகர்வோர் விவகார அமைச்சகம்",
    ejform_sub_title: "உணவு மற்றும் பொது விநியோகத் துறை • டிஜிட்டல் e-J-Form",
    ejform_print: "🖨️ ரசீது அச்சிடு",
    ejform_close: "மூடு"
  },

  telugu: {
    voice_lang: "te-IN",
    welcome: "కిసాన్ ద్వార్ రైతు పోర్టల్‌కు స్వాగతం",
    nav_home: "🏠 హోమ్ / సారాంశం",
    nav_analytics: "📈 విక్రయాల విశ్లేషణ గ్రాఫ్",
    nav_book: "📅 స్లాట్ బుకింగ్",
    nav_token: "🎟️ లైవ్ టోకెన్",
    nav_passbook: "📜 అమ్మకాల పాస్‌బుక్",
    nav_profile: "👤 ప్రొఫైల్ & భూమి కోటా",
    btn_voice_readout: "🔊 వాయిస్ రీడర్",
    btn_book_slot: "➕ కొత్త స్లాట్ బుక్ చేయండి",

    summary_sold_title: "ప్రభుత్వానికి అమ్మిన మొత్తం ధాన్యం",
    summary_sold_sub: "110 సంచులు అమ్మబడ్డాయి",
    summary_earn_title: "మొత్తం డీబీటీ ఆదాయం",
    summary_earn_sub: "100% ప్రత్యక్ష బ్యాంకు బదిలీ",
    summary_quota_title: "మిగిలిన భూమి కోటా",
    summary_quota_sub: "మొత్తం 62.5 క్వింటాళ్లలో",
    summary_quality_title: "పంచాయతీ నాణ్యత",
    summary_quality_val: "పాస్ 🟢",
    summary_quality_sub: "తేమ: 14.2% (FAQ సరైనది)",

    analytics_box_title: "📢 అధికారిక మండి సందర్శన సారాంశం (Official Mandi Summary)",
    btn_listen_summary: "🔊 సారాంశం వినండి",
    visit_word_summary: "📊 సందర్శన సారాంశం: ఈ నెలలో (అక్టోబర్) మీరు 1 సారి మండిని సందర్శించారు. ఈ సీజన్‌లో మొత్తం 2 సార్లు వెళ్లి 55 క్వింటాళ్ల ధాన్యాన్ని ప్రభుత్వ మద్దతు ధరకు (MSP) విక్రయించారు. మీ ఆధార్ లింక్ అయిన బ్యాంకు ఖాతాకు ₹1,27,600 డీబీటీ (DBT) ద్వారా నేరుగా జమ చేయబడింది. కొత్త స్లాట్ బుకింగ్ సిద్ధంగా ఉంది!",
    chart_main_title: "🌾 మండి సందర్శనలు & ధాన్యం అమ్మకాల గ్రాఫ్",
    chart_sub_title: "ప్రతి సీజన్‌లో ప్రభుత్వానికి విక్రయించిన ధాన్యం పరిమాణం (క్వింటాళ్లు)",
    chart_dataset_label: "అమ్మిన పరిమాణం (క్వింటాళ్లు)",
    chart_timeline_badge: "పంట చరిత్ర",
    chart_season_labels: ["ఖరీఫ్ 2024", "రబీ 2025", "ఖరీఫ్ 2025", "రబీ 2026", "ప్రస్తుత పంట (2026)"],

    wizard_step_title: "దశలవారీగా ధృవీకరణ (5 ప్రశ్నలు)",
    wizard_main_title: "🌾 కొత్త కొనుగోలు స్లాట్ బుక్ చేయండి",
    listen_all_qs: "🔊 అన్ని 5 ప్రశ్నలను వినండి",
    listen_btn: "🔊 వినండి",

    q1_title: "1. పంట ఎప్పుడు కోశారు?",
    q1_opt1: "📅 గత 7 రోజుల్లో",
    q1_opt2: "📅 1–2 వారాల క్రితం",
    q1_opt3: "📅 1+ నెల క్రితం",
    q1_audio: "మొదటి ప్రశ్న: పంట ఎప్పుడు కోశారు? గత ఏడు రోజుల్లో, ఒకటి లేదా రెండు వారాల క్రితం, లేదా ఒక నెల క్రితమా?",

    q2_title: "2. పంటను ఎన్ని రోజులు ఎండబెట్టారు?",
    q2_opt1: "☀️ 0 రోజులు (పచ్చి పంట)",
    q2_opt2: "☀️ 2–3 రోజులు (మంచిది)",
    q2_opt3: "☀️ 5+ రోజులు",
    q2_audio: "రెండవ ప్రశ్న: పంటను ఎన్ని రోజులు ఎండబెట్టారు? సున్నా రోజులు, రెండు నుండి మూడు రోజులు, లేదా ఐదు రోజుల కంటే ఎక్కువా?",

    q3_title: "3. మీ పొలం నేల రంగు ఏమిటి? (భూ రికార్డుల సరిపోలిక):",
    q3_opt1: "🟫 నల్ల నేల",
    q3_opt2: "🟥 ఎర్ర నేల",
    q3_opt3: "🟨 ఇసుక / బంకమట్టి నేల",
    q3_audio: "మూడవ ప్రశ్న: మీ పొలం నేల రంగు ఏమిటి? నల్ల నేల, ఎర్ర నేల, లేదా బంకమట్టి నేల?",

    q4_title: "4. ధాన్యం గట్టిదనం & తేమ స్థాయి:",
    q4_opt1: "🌾 గట్టిగా / కరకరలాడే (<15% FAQ)",
    q4_opt2: "🌾 మధ్యస్థం (16–17%)",
    q4_opt3: "🌾 మెత్తగా / పచ్చిది (>18%)",
    q4_audio: "నాల్గవ ప్రశ్న: ధాన్యం గట్టిదనం మరియు తేమ ఎలా ఉంది? గట్టిగా కరకరలాడేదా, మధ్యస్థమా, లేదా పచ్చిదా?",

    q5_title: "5. ధాన్యం తీసుకువచ్చే వాహనం ఏది?",
    q5_opt1: "🚜 ట్రాక్టర్-ట్రాలీ",
    q5_opt2: "🚚 చిన్న ట్రక్ (టాటా ఏస్)",
    q5_opt3: "🛺 ఆటో / మినీ లోడర్",
    q5_audio: "ఐదవ ప్రశ్న: ధాన్యం తీసుకువచ్చే వాహనం ఏది? ట్రాక్టర్ ట్రాలీ, చిన్న ట్రక్, లేదా ఆటో?",

    wizard_mandi_label: "కొనుగోలు కేంద్రం (మండి) ఎంచుకోండి:",
    wizard_qty_label: "అమ్మే పరిమాణం (క్వింటాళ్లు):",
    wizard_time_label: "రాక సమయం:",
    btn_cancel: "రద్దు చేయండి",
    btn_confirm_slot: "✅ నిర్ధారించి డిజిటల్ QR పాస్ పొందండి",

    token_broadcaster_badge: "లైవ్ మండి క్యూ బ్రాడ్‌కాస్టర్",
    token_yard_pos_title: "రియల్ టైమ్ యార్డ్ స్థానం",
    token_yard_pos_sub: "APMC యార్డ్, రాయచూర్ • ప్రధాన కాటా గేట్ 1",
    token_assigned_label: "మీకు కేటాయించిన టోకెన్",
    token_serving_info: "ప్రస్తుతం కాటా నడుస్తోంది: #40 • ముందు 2 వాహనాలు ఉన్నాయి",
    token_wait_time_label: "అంచనా వేసిన వేచి ఉండే సమయం",
    token_wait_time_val: "~15 నిమిషాలు",
    token_monsoon_prot_label: "వర్ష రక్షణ",
    token_monsoon_prot_val: "☔ టార్పాలిన్ కప్పబడింది",
    token_view_qr_btn: "📱 గేట్ ఎంట్రీ QR పాస్ చూడండి",

    passbook_title: "నా ధాన్యం కొనుగోలు పాస్‌బుక్ & లావాదేవీలు",
    passbook_sub: "అధికారిక e-J-Form రసీదులు & డీబీటీ బ్యాంక్ లావాదేవీలు",
    passbook_verified_badge: "ప్రభుత్వ ధృవీకృత లెడ్జర్",
    th_date: "తేదీ",
    th_crop: "పంట / ధాన్యం",
    th_weight: "నికర బరువు",
    th_rate: "ఎంఎస్పీ ధర",
    th_total: "మొత్తం సొమ్ము",
    th_status: "చెల్లింపు స్థితి",
    th_cert: "రసీదు",
    status_credited: "● జమ చేయబడింది (DBT)",
    btn_ejform: "📥 e-J-Form",

    verified_farmer: "ఆధార్ ధృవీకరించబడిన రైతు",
    land_quota_title: "భూమి రికార్డుల కోటా (భూలేఖ్ ధృవీకరించబడింది)",
    precheck_passed: "🟢 గ్రామ పంచాయతీ తనిఖీ పాస్",
    survey_no: "సర్వే నంబర్",
    verified_acreage: "ధృవీకరించిన భూమి",
    rem_quota: "మిగిలిన కోటా పరిమితి",
    quota_util_label: "సీజన్ కోటా వినియోగం:",
    quota_pct_label: "24% కోటా ఉపయోగించబడింది",
    quota_formula_text: "సూత్రం: 2.5 ఎకరాలు × 25 క్విం/ఎకరా = 62.5 క్వింటాళ్లు గరిష్టం",

    active_booking_title: "ప్రస్తుత స్లాట్ బుకింగ్",
    your_token: "మీ క్యూ టోకెన్",
    now_serving: "ప్రస్తుత టోకెన్",
    time_window: "సమయం విండో",
    vehicle_no: "వాహనం నంబర్",
    est_wait: "అంచనా సమయం",
    rain_prot: "వర్ష రక్షణ",
    show_qr_pass: "📱 గేట్ QR పాస్ చూడండి",
    listen_status: "🔊 వాయిస్ వినండి",
    rain_alert_msg: "వర్షం హెచ్చరిక: మండి యార్డులో మీ ట్రాక్టర్‌కు టార్పాలిన్ కప్పబడింది",
    rain_covered_badge: "☔ టార్పాలిన్ కప్పబడింది",
    rain_normal_badge: "సాధారణం",

    qr_modal_badge: "అధికారిక గేట్ ఎంట్రీ పాస్",
    qr_modal_title: "మండి సేకరణ QR పాస్",
    qr_modal_tip: "టోకెన్ వెంటనే యాక్టివేట్ కావడానికి మండి గేట్ కెమెరాకు ఈ QR చూపించండి.",
    qr_modal_done: "పూర్తయింది",
    ejform_gov_title: "భారత ప్రభుత్వం • వినియోగదారుల వ్యవహారాల మంత్రిత్వ శాఖ",
    ejform_sub_title: "ఆహార & ప్రజా పంపిణీ శాఖ • డిజిటల్ e-J-Form",
    ejform_print: "🖨️ రసీదు ప్రింట్ చేయండి",
    ejform_close: "మూసివేయండి"
  },

  hindi: {
    voice_lang: "hi-IN",
    welcome: "किसान द्वार कृषक पोर्टल में आपका स्वागत है",
    nav_home: "🏠 मुख्य पृष्ठ / सारांश",
    nav_analytics: "📈 मंडी आगमन एवं विक्रय ग्राफ",
    nav_book: "📅 स्लॉट बुकिंग",
    nav_token: "🎟️ लाइव कतार टोकन",
    nav_passbook: "📜 खरीद पासबुक",
    nav_profile: "👤 प्रोफ़ाइल एवं भूमि कोटा",
    btn_voice_readout: "🔊 आवाज में सुनें",
    btn_book_slot: "➕ नया स्लॉट बुक करें",

    summary_sold_title: "सरकार को कुल विक्रय",
    summary_sold_sub: "110 बोरी अनाज बेचा गया",
    summary_earn_title: "कुल डीबीटी आय",
    summary_earn_sub: "100% सीधा बैंक खाता भुगतान",
    summary_quota_title: "बची हुई भूमि कोटा सीमा",
    summary_quota_sub: "कुल 62.5 क्विंटल में से",
    summary_quality_title: "पंचायत गुणवत्ता",
    summary_quality_val: "सत्यापित 🟢",
    summary_quality_sub: "नमी: 14.2% (FAQ मानक पास)",

    analytics_box_title: "📢 आधिकारिक मंडी आगमन सारांश (Official Mandi Summary)",
    btn_listen_summary: "🔊 सारांश सुनें",
    visit_word_summary: "📊 आगमन सारांश: इस महीने (अक्टूबर) आपने 1 बार मंडी का दौरा किया है। इस फसल सीजन में कुल 2 बार मंडी जाकर 55 क्विंटल अनाज सरकारी एमएसपी (MSP) दर पर बेचा है। आपके आधार लिंक बैंक खाते में ₹1,27,600 सीधे डीबीटी (DBT) के माध्यम से ट्रांसफर किए जा चुके हैं। नया स्लॉट बुकिंग उपलब्ध है!",
    chart_main_title: "🌾 मंडी आगमन एवं अनाज विक्रय इतिहास ग्राफ",
    chart_sub_title: "प्रत्येक फसल सीजन में सरकार को बेचा गया अनाज परिमाण (क्विंटल)",
    chart_dataset_label: "विक्रय की गई मात्रा (क्विंटल)",
    chart_timeline_badge: "फसल इतिहास",
    chart_season_labels: ["खरीफ 2024", "रबी 2025", "खरीफ 2025", "रबी 2026", "वर्तमान फसल (2026)"],

    wizard_step_title: "चरण-दर-चरण सत्यापन (5 प्रश्न)",
    wizard_main_title: "🌾 नया अनाज खरीद स्लॉट बुक करें",
    listen_all_qs: "🔊 सभी 5 प्रश्न आवाज में सुनें",
    listen_btn: "🔊 सुनें",

    q1_title: "1. फसल की कटाई कब हुई थी?",
    q1_opt1: "📅 पिछले 7 दिनों में",
    q1_opt2: "📅 1–2 सप्ताह पहले",
    q1_opt3: "📅 1+ महीने पहले",
    q1_audio: "पहला प्रश्न: फसल की कटाई कब हुई थी? पिछले सात दिनों में, एक या दो सप्ताह पहले, या एक महीने पहले?",

    q2_title: "2. फसल को कितने दिन धूप में सुखाया गया?",
    q2_opt1: "☀️ 0 दिन (ताजा फसल)",
    q2_opt2: "☀️ 2–3 दिन (उत्तम सूखा)",
    q2_opt3: "☀️ 5+ दिन",
    q2_audio: "दूसरा प्रश्न: फसल को कितने दिन धूप में सुखाया गया? शून्य दिन, दो से तीन दिन, या पांच दिन से अधिक?",

    q3_title: "3. आपके खेत की मिट्टी का रंग क्या है? (भूलेख राजस्व मिलान):",
    q3_opt1: "🟫 काली मिट्टी",
    q3_opt2: "🟥 लाल मिट्टी",
    q3_opt3: "🟨 दोमट / चिकनी मिट्टी",
    q3_audio: "तीसरा प्रश्न: आपके खेत की मिट्टी का रंग क्या है? काली मिट्टी, लाल मिट्टी, या दोमट चिकनी मिट्टी?",

    q4_title: "4. दाने का सूखापन एवं नमी स्तर:",
    q4_opt1: "🌾 कुरकुरा / कड़ा (<15% FAQ पास)",
    q4_opt2: "🌾 मध्यम सूखा (16–17%)",
    q4_opt3: "🌾 नरम / गीला (>18%)",
    q4_audio: "चौथा प्रश्न: दाने का सूखापन कैसा है? कुरकुरा कड़ा, मध्यम सूखा, या नरम गीला?",

    q5_title: "5. अनाज परिवहन के लिए वाहन का प्रकार:",
    q5_opt1: "🚜 ट्रैक्टर-ट्रॉली",
    q5_opt2: "🚚 छोटा ट्रक (टाटा ऐस)",
    q5_opt3: "🛺 ऑटो / मिनी लोडर",
    q5_audio: "पांचवां प्रश्न: अनाज परिवहन हेतु वाहन का प्रकार क्या है? ट्रैक्टर ट्रॉली, छोटा ट्रक, या ऑटो?",

    wizard_mandi_label: "खरीद केंद्र (मंडी) चुनें:",
    wizard_qty_label: "विक्रय मात्रा (क्विंटल):",
    wizard_time_label: "आगमन समय विंडो:",
    btn_cancel: "रद्द करें",
    btn_confirm_slot: "✅ पुष्टि करें एवं डिजिटल QR पास प्राप्त करें",

    token_broadcaster_badge: "लाइव मंडी कतार ब्रॉडकास्टर",
    token_yard_pos_title: "रियल-टाइम यार्ड स्थिति",
    token_yard_pos_sub: "एपीएमसी यार्ड, रायचूर • मुख्य धर्मकांटा गेट 1",
    token_assigned_label: "आपका आवंटित टोकन",
    token_serving_info: "वर्तमान तौल टोकन: #40 • आगे 2 वाहन शेष हैं",
    token_wait_time_label: "अनुमानित प्रतीक्षा समय",
    token_wait_time_val: "~15 मिनट",
    token_monsoon_prot_label: "बारिश से सुरक्षा",
    token_monsoon_prot_val: "☔ तिरपाल से ढका गया",
    token_view_qr_btn: "📱 गेट एंट्री QR पास देखें",

    passbook_title: "मेरी खरीद पासबुक एवं पिछला विक्रय",
    passbook_sub: "आधिकारिक e-J-Form रसीदें एवं बैंक डीबीटी विवरण",
    passbook_verified_badge: "सरकारी सत्यापित बहीखाता",
    th_date: "दिनांक",
    th_crop: "फसल / अनाज",
    th_weight: "शुद्ध वजन",
    th_rate: "एमएसपी दर",
    th_total: "कुल भुगतान",
    th_status: "भुगतान स्थिति",
    th_cert: "प्रमाण पत्र",
    status_credited: "● डीबीटी जमा (DBT)",
    btn_ejform: "📥 e-J-Form",

    verified_farmer: "आधार सत्यापित किसान",
    land_quota_title: "भूलेख राजस्व भूमि कोटा (सत्यापित)",
    precheck_passed: "🟢 ग्राम पंचायत गुणवत्ता प्रमाण पत्र पास",
    survey_no: "खसरा / सर्वे नंबर",
    verified_acreage: "सत्यापित रकबा",
    rem_quota: "शेष कोटा सीमा",
    quota_util_label: "मौसमी कोटा उपयोग:",
    quota_pct_label: "24% कोटा उपयोग किया गया",
    quota_formula_text: "सूत्र: 2.5 एकड़ × 25 क्विंटल/एकड़ = 62.5 क्विंटल अधिकतम",

    active_booking_title: "सक्रिय स्लॉट बुकिंग",
    your_token: "आपका कतार टोकन",
    now_serving: "वर्तमान टोकन",
    time_window: "समय विंडो",
    vehicle_no: "वाहन क्रमांक",
    est_wait: "अनुमानित प्रतीक्षा",
    rain_prot: "बारिश सुरक्षा",
    show_qr_pass: "📱 गेट क्यूआर पास देखें",
    listen_status: "🔊 आवाज सुनें",
    rain_alert_msg: "बारिश चेतावनी: मंडी यार्ड में आपके ट्रैक्टर पर तिरपाल ढक दिया गया है",
    rain_covered_badge: "☔ तिरपाल से सुरक्षित",
    rain_normal_badge: "सामान्य",

    qr_modal_badge: "आधिकारिक गेट प्रवेश पास",
    qr_modal_title: "मंडी खरीद QR पास",
    qr_modal_tip: "तुरंत टोकन एक्टिवेशन हेतु मंडी गेट कैमरा पर यह क्यूआर कोड स्कैन कराएं।",
    qr_modal_done: "संपन्न",
    ejform_gov_title: "भारत सरकार • उपभोक्ता मामले मंत्रालय",
    ejform_sub_title: "खाद्य एवं सार्वजनिक वितरण विभाग • डिजिटल e-J-Form",
    ejform_print: "🖨️ रसीद प्रिंट करें",
    ejform_close: "बंद करें"
  },

  english: {
    voice_lang: "en-IN",
    welcome: "Welcome to KisanDwar Farmer Portal",
    nav_home: "🏠 Summary & Overview",
    nav_analytics: "📈 Visits & Sales Graph",
    nav_book: "📅 Book Procurement Slot",
    nav_token: "🎟️ Live Queue Tracker",
    nav_passbook: "📜 Procurement Passbook",
    nav_profile: "👤 Profile & Land Quota",
    btn_voice_readout: "🔊 Voice Readout",
    btn_book_slot: "➕ Book Procurement Slot",

    summary_sold_title: "Total Sold to Govt",
    summary_sold_sub: "110 Gunny Bags Sold",
    summary_earn_title: "Total DBT Earnings",
    summary_earn_sub: "100% Direct Bank Transfer",
    summary_quota_title: "Land Quota Balance",
    summary_quota_sub: "Out of 62.5 Qtl Total",
    summary_quality_title: "Panchayat Quality",
    summary_quality_val: "PASSED 🟢",
    summary_quality_sub: "Moisture: 14.2% (FAQ OK)",

    analytics_box_title: "📢 Official Mandi Visit Summary",
    btn_listen_summary: "🔊 Listen Summary",
    visit_word_summary: "📊 Visit Summary: You visited the procurement mandi 1 time this month (October). In this harvest season, you completed 2 visits and sold 55 Quintals of grain at official MSP rates. ₹1,27,600 has been credited directly to your Aadhaar-linked bank account via Direct Benefit Transfer (DBT). Next slot booking is open!",
    chart_main_title: "🌾 Mandi Visits & Procurement Volume History",
    chart_sub_title: "Government MSP Grain Procurement Volumes per Harvest Season (Quintals)",
    chart_dataset_label: "Quantity Sold (Quintals)",
    chart_timeline_badge: "Harvest Timeline",
    chart_season_labels: ["Kharif 2024", "Rabi 2025", "Kharif 2025", "Rabi 2026", "Current Harvest (2026)"],

    wizard_step_title: "Step-by-Step Verification (5 Questions)",
    wizard_main_title: "🌾 Book a New Procurement Slot",
    listen_all_qs: "🔊 Listen All 5 Questions",
    listen_btn: "🔊 Listen",

    q1_title: "1. When was the crop harvested?",
    q1_opt1: "📅 Last 7 Days",
    q1_opt2: "📅 1–2 Weeks Ago",
    q1_opt3: "📅 1+ Month Ago",
    q1_audio: "Question one: When was the crop harvested? Last seven days, one to two weeks ago, or over a month ago?",

    q2_title: "2. How many days was it sun-dried?",
    q2_opt1: "☀️ 0 Days (Fresh)",
    q2_opt2: "☀️ 2–3 Days (Good)",
    q2_opt3: "☀️ 5+ Days",
    q2_audio: "Question two: How many days was it sun-dried? Zero days, two to three days, or more than five days?",

    q3_title: "3. Field Soil Color (Land Record Match):",
    q3_opt1: "🟫 Black Soil",
    q3_opt2: "🟥 Red Soil",
    q3_opt3: "🟨 Alluvial / Clay",
    q3_audio: "Question three: What is your field soil color? Black soil, red soil, or alluvial clay?",

    q4_title: "4. Grain Hardness & Moisture Level:",
    q4_opt1: "🌾 Crisp & Hard (<15% FAQ)",
    q4_opt2: "🌾 Moderate (16–17%)",
    q4_opt3: "🌾 Soft / Moisture (>18%)",
    q4_audio: "Question four: What is the grain hardness and moisture level? Crisp and hard, moderate, or soft with moisture?",

    q5_title: "5. Transport Vehicle Type:",
    q5_opt1: "🚜 Tractor-Trolley",
    q5_opt2: "🚚 Small Truck (Tata Ace)",
    q5_opt3: "🛺 Auto / Mini Loader",
    q5_audio: "Question five: What is your transport vehicle type? Tractor trolley, small truck, or auto mini loader?",

    wizard_mandi_label: "Select Procurement Centre (Mandi):",
    wizard_qty_label: "Quantity to Sell (Quintals):",
    wizard_time_label: "Arrival Time Window:",
    btn_cancel: "Cancel",
    btn_confirm_slot: "✅ Confirm & Generate Digital QR Pass",

    token_broadcaster_badge: "Live Mandi Queue Broadcaster",
    token_yard_pos_title: "Real-Time Yard Position",
    token_yard_pos_sub: "APMC Yard, Raichur • Main Scale Gate 1",
    token_assigned_label: "Your Assigned Token",
    token_serving_info: "Now Weighing at Scale: #40 • 2 Vehicles Ahead",
    token_wait_time_label: "Estimated Wait Time",
    token_wait_time_val: "~15 Minutes",
    token_monsoon_prot_label: "Monsoon Protection",
    token_monsoon_prot_val: "☔ Tarpaulin Secured",
    token_view_qr_btn: "📱 View Gate Entry QR Pass",

    passbook_title: "My Procurement Passbook & Past Sales",
    passbook_sub: "Official Legal Receipts & DBT Audit Logs",
    passbook_verified_badge: "Government Verified Ledger",
    th_date: "Date",
    th_crop: "Commodity",
    th_weight: "Net Weight",
    th_rate: "MSP Rate",
    th_total: "Total Amount",
    th_status: "Payment Status",
    th_cert: "Certificate",
    status_credited: "● Credited (DBT)",
    btn_ejform: "📥 e-J-Form",

    verified_farmer: "Aadhaar-Seeded Farmer",
    land_quota_title: "Land Registry Quota (Bhulekh Verified)",
    precheck_passed: "🟢 Gram Panchayat Pre-Check Passed",
    survey_no: "Survey Number",
    verified_acreage: "Total Land Acreage",
    rem_quota: "Remaining Seasonal Quota",
    quota_util_label: "Seasonal Quota Utilization:",
    quota_pct_label: "24% Quota Used",
    quota_formula_text: "Formula: 2.5 Acres × 25 Qtl/Acre = 62.5 Qtl Max",

    active_booking_title: "Active Slot Booking",
    your_token: "Your Queue Token",
    now_serving: "Now Serving",
    time_window: "Time Window",
    vehicle_no: "Vehicle Number",
    est_wait: "Estimated Wait",
    rain_prot: "Rain Protection",
    show_qr_pass: "📱 Show Gate QR Pass",
    listen_status: "🔊 Voice Readout",
    rain_alert_msg: "Rain Advisory: Rapid Squad has secured your vehicle with a heavy tarpaulin cover",
    rain_covered_badge: "☔ Covered with Tarp",
    rain_normal_badge: "Normal",

    qr_modal_badge: "Official Gate Entry Pass",
    qr_modal_title: "Mandi Procurement QR",
    qr_modal_tip: "Show this QR code to the mandi gate camera on arrival for instant token activation.",
    qr_modal_done: "Done",
    ejform_gov_title: "Government of India • Ministry of Consumer Affairs",
    ejform_sub_title: "Department of Food & Public Distribution • Digital e-J-Form",
    ejform_print: "🖨️ Print Receipt",
    ejform_close: "Close"
  }
};

// Web Speech API: Text-to-Speech Engine
function speakText(text, specificLang = null) {
  if (!('speechSynthesis' in window)) {
    showToast("Voice playback not supported on this browser.", "info");
    return;
  }
  window.speechSynthesis.cancel();
  const langKey = specificLang || currentLanguage;
  const voiceCode = fullTranslations[langKey]?.voice_lang || "en-IN";
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voiceCode;
  utterance.rate = 0.85;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

// Speak Individual Question with Options
function speakQuestion(qNum) {
  const t = fullTranslations[currentLanguage];
  const audioText = t[`q${qNum}_audio`] || t[`q${qNum}_title`];
  speakText(audioText);
}

// Speak All 5 Questions in Sequence
function speakAllQuestions() {
  const t = fullTranslations[currentLanguage];
  const fullScript = `${t.wizard_main_title}. ${t.q1_audio}. ${t.q2_audio}. ${t.q3_audio}. ${t.q4_audio}. ${t.q5_audio}`;
  speakText(fullScript);
}

// 100% Dynamic Multilingual Translation Engine
function setFarmerLanguage(lang) {
  currentLanguage = lang;
  const t = fullTranslations[lang];
  if (!t) return;

  // 1. Update language switch button styles
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const isCur = btn.dataset.lang === lang;
    btn.classList.toggle('bg-emerald-700', isCur);
    btn.classList.toggle('text-white', isCur);
    btn.classList.toggle('bg-white', !isCur);
    btn.classList.toggle('text-gray-700', !isCur);
  });

  // 2. Update all static elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.innerText = t[key];
    }
  });

  // 3. Update All 5 Question Wizard Titles & Radio Labels
  for (let i = 1; i <= 5; i++) {
    const qTitle = document.getElementById(`wizard-q${i}-title`);
    if (qTitle && t[`q${i}_title`]) qTitle.innerText = t[`q${i}_title`];

    const opt1 = document.getElementById(`wizard-q${i}-opt1`);
    if (opt1 && t[`q${i}_opt1`]) opt1.innerText = t[`q${i}_opt1`];

    const opt2 = document.getElementById(`wizard-q${i}-opt2`);
    if (opt2 && t[`q${i}_opt2`]) opt2.innerText = t[`q${i}_opt2`];

    const opt3 = document.getElementById(`wizard-q${i}-opt3`);
    if (opt3 && t[`q${i}_opt3`]) opt3.innerText = t[`q${i}_opt3`];
  }

  // 4. Update Word Summary Box
  const wordSummaryEl = document.getElementById('farmer-visit-word-summary');
  if (wordSummaryEl) {
    wordSummaryEl.innerText = t.visit_word_summary;
  }

  // 5. Re-render active cards & Charts in target language
  if (farmerProfileData) {
    renderActiveBooking(farmerProfileData.active_booking);
    renderPassbook(farmerProfileData.passbook);
  }
  loadFarmerSingleChart(currentFarmerId);

  showToast(`Language switched to: ${lang.toUpperCase()}`, "info");
  speakText(t.welcome);
}

// Load Farmer Profile
async function loadFarmerProfile(farmerId = 1) {
  currentFarmerId = farmerId;
  try {
    const res = await fetch(`/api/farmers/${farmerId}/profile`);
    const data = await res.json();
    farmerProfileData = data;

    const nameEl = document.getElementById('farmer-name-display');
    if (nameEl) nameEl.innerText = data.farmer.name;

    const villEl = document.getElementById('farmer-village-display');
    if (villEl) villEl.innerText = `${data.farmer.village}, ${data.farmer.district}`;

    const phEl = document.getElementById('farmer-phone-display');
    if (phEl) phEl.innerText = `+91 ${data.farmer.phone}`;

    const bkEl = document.getElementById('farmer-bank-display');
    if (bkEl) bkEl.innerText = `${data.farmer.bank_account} (${data.farmer.bank_ifsc})`;

    if (data.land_records && data.land_records.length > 0) {
      const lr = data.land_records[0];
      const survEl = document.getElementById('farmer-survey-display');
      if (survEl) survEl.innerText = lr.survey_number;

      const acrEl = document.getElementById('farmer-acreage-display');
      if (acrEl) acrEl.innerText = `${lr.land_acreage} Acres`;

      const qtaEl = document.getElementById('farmer-quota-display');
      if (qtaEl) qtaEl.innerText = `${lr.quota_remaining} Qtl / ${lr.total_quota} Qtl`;

      const sumQta = document.getElementById('summary-quota-rem');
      if (sumQta) sumQta.innerText = `${lr.quota_remaining} Qtl Left`;
      
      const pct = Math.round((lr.quota_used / lr.total_quota) * 100);
      const barEl = document.getElementById('farmer-quota-bar');
      if (barEl) barEl.style.width = `${pct}%`;
    }

    renderActiveBooking(data.active_booking);
    renderPassbook(data.passbook);
    loadFarmerSingleChart(farmerId);

  } catch (err) {
    console.error("Error loading farmer profile:", err);
  }
}

// Render the Single Clean Graphical Representation in the Farmer's chosen language
async function loadFarmerSingleChart(farmerId = 1) {
  try {
    const res = await fetch(`/api/farmers/${farmerId}/analytics`);
    const data = await res.json();
    const t = fullTranslations[currentLanguage] || fullTranslations['kannada'];

    const visitsCanvas = document.getElementById('farmer-single-visits-chart');
    if (!visitsCanvas) return;

    if (farmerVisitsChartInstance) {
      farmerVisitsChartInstance.destroy();
    }

    farmerVisitsChartInstance = new Chart(visitsCanvas, {
      type: 'bar',
      data: {
        labels: t.chart_season_labels,
        datasets: [{
          label: t.chart_dataset_label,
          data: data.quantity_qtl || [20, 25, 30, 35, 55],
          backgroundColor: [
            'rgba(16, 185, 129, 0.75)',
            'rgba(16, 185, 129, 0.75)',
            'rgba(16, 185, 129, 0.75)',
            'rgba(16, 185, 129, 0.75)',
            'rgba(5, 150, 105, 0.95)'
          ],
          borderColor: '#047857',
          borderWidth: 2,
          borderRadius: 10,
          barThickness: 36
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'top',
            labels: { font: { weight: 'bold', size: 12 } }
          },
          title: { 
            display: true, 
            text: t.chart_main_title,
            font: { size: 14, weight: 'bold' },
            color: '#064e3b',
            padding: { bottom: 16 }
          },
          tooltip: {
            backgroundColor: '#064e3b',
            titleFont: { weight: 'bold' },
            callbacks: {
              label: function(context) {
                return ` ${t.chart_dataset_label}: ${context.raw} Qtl`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { 
              display: true, 
              text: t.chart_dataset_label,
              font: { weight: 'bold' },
              color: '#065f46'
            },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          x: {
            grid: { display: false },
            ticks: { font: { weight: 'bold' } }
          }
        }
      }
    });

    const wordSummaryEl = document.getElementById('farmer-visit-word-summary');
    if (wordSummaryEl) {
      wordSummaryEl.innerText = t.visit_word_summary;
    }

  } catch (err) {
    console.error("Error loading farmer single chart:", err);
  }
}

// Alias for unified router navigation
function loadFarmerAnalyticsCharts(farmerId) {
  loadFarmerSingleChart(farmerId);
}

function renderActiveBooking(booking) {
  const container = document.getElementById('farmer-active-booking-container');
  const t = fullTranslations[currentLanguage];
  if (!container) return;

  if (!booking) {
    container.innerHTML = `
      <div class="bg-white rounded-2xl p-6 border border-gray-200 text-center shadow-sm">
        <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
          🌾
        </div>
        <h3 class="text-base font-bold text-gray-800">${t.welcome}</h3>
        <p class="text-xs text-gray-500 mt-1">Ready to sell your crop? Answer 5 quick questions and book your guaranteed mandi slot.</p>
        <button onclick="navigateTo('farmer-book')" class="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow transition">
          ${t.btn_book_slot}
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden border border-emerald-700">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-emerald-700/60 pb-4">
        <div>
          <span class="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            ● ${t.active_booking_title} (${booking.status})
          </span>
          <h3 class="text-lg font-bold mt-2">${booking.mandi_name}</h3>
          <p class="text-xs text-emerald-200">Ref: ${booking.booking_ref} • ${booking.crop_type} (${booking.quantity_quintals} Qtl)</p>
        </div>
        <div class="bg-emerald-950/80 border border-emerald-600/50 rounded-xl p-3 text-center min-w-[140px]">
          <span class="text-[10px] uppercase text-emerald-300 font-bold block">${t.your_token}</span>
          <span class="text-3xl font-extrabold text-amber-400">#${booking.token_number || 42}</span>
          <span class="text-[10px] text-emerald-200 block mt-0.5">${t.now_serving}: #40</span>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 my-4 text-xs">
        <div class="bg-emerald-800/60 p-2.5 rounded-xl border border-emerald-700/50">
          <span class="text-emerald-300 block text-[10px]">${t.time_window}</span>
          <strong class="text-white">${booking.time_slot}</strong>
        </div>
        <div class="bg-emerald-800/60 p-2.5 rounded-xl border border-emerald-700/50">
          <span class="text-emerald-300 block text-[10px]">${t.vehicle_no}</span>
          <strong class="text-white font-mono">${booking.vehicle_number}</strong>
        </div>
        <div class="bg-emerald-800/60 p-2.5 rounded-xl border border-emerald-700/50">
          <span class="text-emerald-300 block text-[10px]">${t.est_wait}</span>
          <strong class="text-amber-300">~15 Minutes</strong>
        </div>
        <div class="bg-emerald-800/60 p-2.5 rounded-xl border border-emerald-700/50">
          <span class="text-emerald-300 block text-[10px]">${t.rain_prot}</span>
          <strong class="${booking.is_tarpaulin_covered ? 'text-emerald-300 font-bold' : 'text-gray-300'}">
            ${booking.is_tarpaulin_covered ? t.rain_covered_badge : t.rain_normal_badge}
          </strong>
        </div>
      </div>

      ${booking.is_tarpaulin_covered ? `
        <div class="bg-amber-500/20 border border-amber-400/40 rounded-xl p-3 my-3 text-xs text-amber-200 flex items-center gap-3">
          <span class="text-xl">☔</span>
          <div>
            <strong>Mandi Weather Squad Alert:</strong>
            <p class="text-[11px] text-amber-100">${t.rain_alert_msg} [${booking.vehicle_number}]</p>
          </div>
        </div>
      ` : ''}

      <div class="flex flex-wrap gap-2 pt-2">
        <button onclick="showQrModal('${booking.qr_code_data}', '${booking.booking_ref}')" class="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs px-4 py-2 rounded-xl shadow flex items-center gap-2 transition">
          ${t.show_qr_pass}
        </button>
        <button onclick="speakText('${t.welcome}. ${t.your_token} #${booking.token_number || 42}')" class="bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs px-3 py-2 rounded-xl border border-emerald-500/40 flex items-center gap-1.5 transition">
          ${t.listen_status}
        </button>
      </div>
    </div>
  `;
}

function renderPassbook(passbook) {
  const tbody = document.getElementById('farmer-passbook-table');
  const t = fullTranslations[currentLanguage];
  if (!tbody) return;

  if (!passbook || passbook.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-gray-400 text-xs">No past sales records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = passbook.map(log => `
    <tr class="hover:bg-gray-50 border-b border-gray-100 transition">
      <td class="py-3 px-4 font-mono text-xs font-semibold text-gray-800">${log.date}</td>
      <td class="py-3 px-4 text-xs text-gray-700">${log.crop_type}</td>
      <td class="py-3 px-4 text-xs font-bold text-gray-900">${log.net_weight_qtl} Qtl</td>
      <td class="py-3 px-4 text-xs text-emerald-700 font-semibold">₹${log.msp_rate}/Qtl</td>
      <td class="py-3 px-4 text-xs font-bold text-gray-900">₹${log.total_amount.toLocaleString()}</td>
      <td class="py-3 px-4 text-xs">
        <span class="bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.5 rounded text-[10px]">
          ${t.status_credited}
        </span>
      </td>
      <td class="py-3 px-4 text-xs">
        <button onclick="showEJFormModal(${JSON.stringify(log).replace(/"/g, '&quot;')})" class="text-emerald-600 hover:text-emerald-800 font-semibold text-xs inline-flex items-center gap-1">
          ${t.btn_ejform}
        </button>
      </td>
    </tr>
  `).join('');
}

// Booking Wizard Submission (5 Questions Checked)
async function submitBooking() {
  const mandiId = document.getElementById('wizard-mandi-select').value;
  const quantity = parseFloat(document.getElementById('wizard-quantity-input').value);
  const vehicleType = document.querySelector('input[name="wizard-vehicle"]:checked')?.value || "Tractor-Trolley";
  const soilColor = document.querySelector('input[name="wizard-soil"]:checked')?.value || "Black Soil";
  const dryingDays = parseInt(document.querySelector('input[name="wizard-drying"]:checked')?.value || 3);
  const harvestDays = parseInt(document.querySelector('input[name="wizard-harvest"]:checked')?.value || 7);
  const hardness = document.querySelector('input[name="wizard-hardness"]:checked')?.value || "Crisp & Hard";
  const timeSlot = document.getElementById('wizard-time-slot').value;

  if (!quantity || quantity <= 0) {
    showToast("Please enter a valid crop quantity in Quintals.", "error");
    return;
  }

  try {
    const res = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmer_id: currentFarmerId,
        mandi_id: mandiId,
        crop_type: "Paddy (Grade A)",
        quantity_quintals: quantity,
        booking_date: "Tomorrow",
        time_slot: timeSlot,
        vehicle_type: vehicleType,
        vehicle_number: "KA-36-TR-4021",
        soil_color_answered: soilColor,
        drying_days_answered: dryingDays,
        harvest_days_answered: harvestDays,
        hardness_answered: hardness
      })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Booking failed", "error");
      speakText(data.error || "Booking failed");
      return;
    }

    const t = fullTranslations[currentLanguage];
    showToast("✅ Slot Booked Successfully! Digital QR Pass generated.", "success");
    speakText(t.welcome + " - " + t.active_booking_title);
    await loadFarmerProfile(currentFarmerId);
    navigateTo('farmer-summary');
    showQrModal(data.qr_code_data, data.booking_ref);

  } catch (err) {
    console.error("Booking submission error:", err);
    showToast("Failed to connect to server.", "error");
  }
}

// Show QR Modal
function showQrModal(qrData, ref) {
  const refEl = document.getElementById('qr-modal-ref');
  if (refEl) refEl.innerText = ref;

  const dataEl = document.getElementById('qr-modal-data');
  if (dataEl) dataEl.innerText = qrData;
  
  const qrCanvas = document.getElementById('qr-canvas');
  if (qrCanvas) {
    new QRious({
      element: qrCanvas,
      value: qrData,
      size: 200,
      level: 'H'
    });
  }

  const modal = document.getElementById('qr-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeQrModal() {
  const modal = document.getElementById('qr-modal');
  if (modal) modal.classList.add('hidden');
}

// e-J-Form Modal
function showEJFormModal(log) {
  document.getElementById('ejform-ref').innerText = log.booking_ref;
  document.getElementById('ejform-date').innerText = log.date;
  document.getElementById('ejform-crop').innerText = log.crop_type;
  document.getElementById('ejform-weight').innerText = `${log.net_weight_qtl} Quintals (${log.net_weight_qtl * 2} Bags)`;
  document.getElementById('ejform-rate').innerText = `₹${log.msp_rate} / Qtl`;
  document.getElementById('ejform-total').innerText = `₹${log.total_amount.toLocaleString()}`;
  document.getElementById('ejform-utr').innerText = log.dbt_utr;
  
  const modal = document.getElementById('ejform-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeEJFormModal() {
  const modal = document.getElementById('ejform-modal');
  if (modal) modal.classList.add('hidden');
}

