import streamlit as st
import pandas as pd
import json
import os

# ==========================================
# 1. 頁面初始化與 CSS 注入
# ==========================================
st.set_page_config(page_title="Reliability Spec Engine", page_icon="🛡️", layout="wide")

st.markdown("""
    <style>
    .stApp { font-family: 'Courier New', Courier, monospace; }
    h1, h2, h3 { color: #00FF41 !important; }
    .risk-high { color: #FF3333; font-weight: bold; }
    .risk-med { color: #FFD700; font-weight: bold; }
    .risk-low { color: #00FF41; font-weight: bold; }
    /* 加大頁籤字體以提升辨識度 */
    .stTabs [data-baseweb="tab-list"] button { font-size: 16px; font-weight: bold; padding: 10px 20px; }
    </style>
    """, unsafe_allow_html=True)

# ==========================================
# 2. 資料庫讀取函數
# ==========================================
@st.cache_data
def load_db(filename: str):
    if os.path.exists(filename):
        try:
            with open(filename, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

# ==========================================
# 3. 主畫面標題與多國語系
# ==========================================
col_title, col_lang = st.columns([4, 1])

# 修正點：先執行右邊的欄位，把 lang 變數定義出來
with col_lang:
    lang = st.radio("Language", ["ZH", "EN"], horizontal=True, label_visibility="collapsed")

# 再執行左邊的欄位，這時候系統已經知道 lang 是什麼了，就不會報錯
with col_title:
    st.title("🛡️ Reliability Spec Engine" if lang == "EN" else "🛡️ Reliability Spec Engine (四合一旗艦版)")

# 根據語系動態切換頁籤名稱
if lang == "EN":
    tab_iec, tab_mil, tab_astm, tab_gr63 = st.tabs([
        "🛡️ IEC 60721-3", 
        "🎖️ MIL-STD-810G", 
        "📦 ASTM D4169-09",
        "🏢 GR-63-CORE"
    ])
else:
    tab_iec, tab_mil, tab_astm, tab_gr63 = st.tabs([
        "🛡️ IEC 60721-3 (環境分類)", 
        "🎖️ MIL-STD-810G (軍規測試)", 
        "📦 ASTM D4169-09 (運輸包裝)",
        "🏢 GR-63-CORE (電信機房)"
    ])
# 
# ==========================================
# 4. 引擎 A：IEC 60721 邏輯
# ==========================================
with tab_iec:
    st.caption("Reliability Engineering Decision Matrix" if lang == "EN" else "可靠度工程決策與測試轉換矩陣")
    IEC_DB = load_db("iec_database.json")
    
    CLASS_NAMES = {
        "1": {"zh": "📦 儲存 [1-X]", "en": "📦 Storage [1-X]"},
        "2": {"zh": "🚚 運輸 [2-X]", "en": "🚚 Transportation [2-X]"},
        "3": {"zh": "🏢 室內定點 [3-X]", "en": "🏢 Stationary [3-X]"},
        "4": {"zh": "🌦️ 戶外定點 [4-X]", "en": "🌦️ Outdoor Stationary [4-X]"},
        "5": {"zh": "🚙 車載裝備 [5-X]", "en": "🚙 Ground Vehicle [5-X]"},
        "6": {"zh": "🚢 船舶環境 [6-X]", "en": "🚢 Ship Environment [6-X]"},
        "7": {"zh": "🎒 攜帶與行動 [7-X]", "en": "🎒 Portable & Non-stationary [7-X]"},
        "9": {"zh": "⚙️ 內部微氣候 [9-X]", "en": "⚙️ Microclimates inside products [9-X]"}
    }
    FACTOR_NAMES = {
        "K": "🌪️ Climatic (K)" if lang == "EN" else "🌪️ 氣候環境 (K)",
        "M": "💥 Mechanical (M)" if lang == "EN" else "💥 機械環境 (M)",
        "C": "🧪 Chemical (C)" if lang == "EN" else "🧪 化學環境 (C)",
        "S": "🏜️ Sand & Dust (S)" if lang == "EN" else "🏜️ 沙塵等活性物質 (S)"
    }
    
    col_i1, col_i2 = st.columns([1, 1.2], gap="large")
    with col_i1:
        st.subheader("1. Input" if lang == "EN" else "1. 規格輸入")
        if not IEC_DB:
            st.warning("⚠️ 找不到或無法讀取 `iec_database.json`")
        else:
            available_classes = sorted(list(IEC_DB.keys()))
            loc_options = ["-- Select --"] + [f"{k} - {CLASS_NAMES.get(k, {}).get(lang.lower(), 'Unknown Class')}" for k in available_classes]
            loc = st.selectbox("📍 Location Class", loc_options, key="iec_loc")
            if loc != "-- Select --":
                loc_id = loc.split(" - ")[0]
                available_factors = sorted(list(IEC_DB[loc_id].keys()))
                factor_options = [f"{f} - {FACTOR_NAMES.get(f, f)}" for f in available_factors]
                factor_display = st.selectbox("🌪️ Environmental Factor", factor_options, key="iec_factor")
                factor_id = factor_display.split(" - ")[0]
                available_targets = sorted(list(IEC_DB[loc_id][factor_id].keys()))
                target_code = st.selectbox("📊 Severity Level", available_targets, key="iec_level")

    with col_i2:
        if loc != "-- Select --":
            st.subheader("2. Result" if lang == "EN" else "2. 轉換結果")
            st.success(f"### 🎯 Target: IEC {target_code}")
            data = IEC_DB[loc_id][factor_id][target_code]
            if data:
                with st.expander("🔍 Parameters", expanded=True):
                    for pk, pv in data.get("parameters", {}).items():
                        st.markdown(f"- **{pk}**: `{pv}`")
                df_tests = pd.DataFrame(data.get("tests", []))
                if not df_tests.empty:
                    st.dataframe(df_tests, use_container_width=True, hide_index=True)

# ==========================================
# 5. 引擎 B：MIL-STD-810G 邏輯
# ==========================================
with tab_mil:
    st.caption("Environmental Engineering Considerations and Laboratory Tests" if lang == "EN" else "軍規環境工程考量與實驗室測試裁適")
    MIL_DB = load_db("mil810_database.json")
    
    if not MIL_DB:
        st.error("⚠️ 找不到 `mil810_database.json`")
    else:
        col_m1, col_m2 = st.columns([1, 1.2], gap="large")
        with col_m1:
            st.subheader("1. Tailoring Selection" if lang == "EN" else "1. 測試裁適選擇")
            method = st.selectbox("🛠️ Test Method", ["-- Select --"] + list(MIL_DB.keys()), key="mil_method")
            if method != "-- Select --":
                proc = st.selectbox("📋 Procedure", ["-- Select --"] + list(MIL_DB[method].keys()), key="mil_proc")
                if proc != "-- Select --":
                    cat = st.selectbox("🏷️ Category / Condition", ["-- Select --"] + list(MIL_DB[method][proc].keys()), key="mil_cat")
        
        with col_m2:
            if method != "-- Select --" and proc != "-- Select --" and cat != "-- Select --":
                st.subheader("2. Test Specification" if lang == "EN" else "2. 測試規範輸出")
                st.success(f"### 🎯 {method.split(' - ')[0]}\n**{proc}**")
                target_data = MIL_DB[method][proc][cat]
                with st.expander("🔍 Condition Parameters", expanded=True):
                    for pk, pv in target_data.get("parameters", {}).items():
                        st.markdown(f"- **{pk}**: `{pv}`")
                tests = target_data.get("tests", [])
                if tests:
                    st.markdown("#### 📊 Test Profile")
                    df_tests = pd.DataFrame(tests)
                    st.dataframe(df_tests, use_container_width=True, hide_index=True)

# ==========================================
# 6. 引擎 C：ASTM D4169-09 邏輯
# ==========================================
with tab_astm:
    st.caption("Performance Testing of Shipping Containers and Systems" if lang == "EN" else "包裝與運輸系統性能測試規範")
    ASTM_DB = load_db("astm4169_database.json")
    
    if not ASTM_DB:
        st.error("⚠️ 找不到 `astm4169_database.json`")
    else:
        col_a1, col_a2 = st.columns([1, 1.2], gap="large")
        with col_a1:
            st.subheader("1. Test Selection" if lang == "EN" else "1. 測試排程選擇")
            astm_cat = st.selectbox("📂 Schedule / Cycle", ["-- Select --"] + list(ASTM_DB.keys()), key="astm_cat")
            if astm_cat != "-- Select --":
                astm_sub = st.selectbox("📋 Test Type", ["-- Select --"] + list(ASTM_DB[astm_cat].keys()), key="astm_sub")
                if astm_sub != "-- Select --":
                    astm_item = st.selectbox("🏷️ Specific Condition", ["-- Select --"] + list(ASTM_DB[astm_cat][astm_sub].keys()), key="astm_item")
        
        with col_a2:
            if astm_cat != "-- Select --" and astm_sub != "-- Select --" and astm_item != "-- Select --":
                st.subheader("2. Test Specification" if lang == "EN" else "2. 測試規範輸出")
                st.success(f"### 🎯 {astm_item}")
                target_data = ASTM_DB[astm_cat][astm_sub][astm_item]
                with st.expander("🔍 Parameters & Formulas", expanded=True):
                    for pk, pv in target_data.get("parameters", {}).items():
                        st.markdown(f"- **{pk}**: `{pv}`")
                tests = target_data.get("tests", [])
                if tests:
                    st.markdown("#### 📊 Test Profile")
                    df_tests = pd.DataFrame(tests)
                    st.dataframe(df_tests, use_container_width=True, hide_index=True)
                    
                    c1, c2 = st.columns(2)
                    c1.download_button("📥 JSON", json.dumps(target_data, indent=2, ensure_ascii=False), f"ASTM_{astm_cat[:10]}.json", "application/json", use_container_width=True, key=f"dl_json_{astm_item}")
                    c2.download_button("📥 CSV", df_tests.to_csv(index=False).encode('utf-8-sig'), f"ASTM_{astm_cat[:10]}.csv", "text/csv", use_container_width=True, key=f"dl_csv_{astm_item}")

# ==========================================
# 7. 引擎 D：GR-63-CORE 邏輯
# ==========================================
with tab_gr63:
    st.caption("NEBS Requirements: Physical Protection" if lang == "EN" else "NEBS 物理保護與環境測試規範 (電信機房)")
    GR63_DB = load_db("gr63_database.json")
    
    if not GR63_DB:
        st.error("⚠️ 找不到 `gr63_database.json` 資料庫檔案！請確認檔案位置。")
    else:
        col_g1, col_g2 = st.columns([1, 1.2], gap="large")
        with col_g1:
            st.subheader("1. Section Selection" if lang == "EN" else "1. 測試章節選擇")
            gr_sec = st.selectbox("📂 Section", ["-- Select --"] + list(GR63_DB.keys()), key="gr_sec")
            if gr_sec != "-- Select --":
                gr_cat = st.selectbox("📋 Category", ["-- Select --"] + list(GR63_DB[gr_sec].keys()), key="gr_cat")
                if gr_cat != "-- Select --":
                    gr_item = st.selectbox("🏷️ Condition", ["-- Select --"] + list(GR63_DB[gr_sec][gr_cat].keys()), key="gr_item")
        
        with col_g2:
            if gr_sec != "-- Select --" and gr_cat != "-- Select --" and gr_item != "-- Select --":
                st.subheader("2. Test Specification" if lang == "EN" else "2. 測試規範輸出")
                st.success(f"### 🎯 {gr_item}")
                
                target_data = GR63_DB[gr_sec][gr_cat][gr_item]
                
                with st.expander("🔍 Environmental Limits & Specs", expanded=True):
                    for pk, pv in target_data.get("parameters", {}).items():
                        st.markdown(f"- **{pk}**: `{pv}`")
                
                tests = target_data.get("tests", [])
                if tests:
                    st.markdown("#### 📊 Evaluation Steps")
                    df_tests = pd.DataFrame(tests)
                    st.dataframe(df_tests, use_container_width=True, hide_index=True)
                    
                    c1, c2 = st.columns(2)
                    c1.download_button("📥 JSON", json.dumps(target_data, indent=2, ensure_ascii=False), f"GR63_{gr_sec[:11]}.json", "application/json", use_container_width=True, key=f"dl_json_gr_{gr_item}")
                    c2.download_button("📥 CSV", df_tests.to_csv(index=False).encode('utf-8-sig'), f"GR63_{gr_sec[:11]}.csv", "text/csv", use_container_width=True, key=f"dl_csv_gr_{gr_item}")