import streamlit as st
import pandas as pd
import json
import os
from typing import Dict, Any, Tuple

# ==========================================
# 1. 頁面初始化與 CSS 注入 (工程師暗黑風格)
# ==========================================
st.set_page_config(page_title="IEC 60721 AutoSpec", page_icon="🛡️", layout="wide")

st.markdown("""
    <style>
    .stApp { font-family: 'Courier New', Courier, monospace; }
    h1, h2, h3 { color: #00FF41 !important; }
    .risk-high { color: #FF3333; font-weight: bold; }
    .risk-med { color: #FFD700; font-weight: bold; }
    .risk-low { color: #00FF41; font-weight: bold; }
    </style>
    """, unsafe_allow_html=True)

# ==========================================
# 2. IEC 60721 骨架矩陣 (Data Schema)
# ==========================================
FULL_SCHEMA: Dict[str, Dict[str, Any]] = {
    "1": {"name_zh": "📦 儲存 [1-X]", "name_en": "📦 Storage [1-X]", "factors": {"K": 11, "M": 18, "C": 3, "S": 4, "B": 2, "Z": 4}},
    "2": {"name_zh": "🚚 運輸 [2-X]", "name_en": "🚚 Transportation [2-X]", "factors": {"K": 12, "M": 3, "C": 3, "S": 3, "B": 3}},
    "3": {"name_zh": "🏢 室內定點 [3-X]", "name_en": "🏢 Stationary [3-X]", "factors": {"K": 8, "M": 8, "C": 6, "S": 4, "B": 3, "Z": 11}},
    "4": {"name_zh": "🏕️ 戶外定點 [4-X]", "name_en": "🏕️ Outdoor [4-X]", "factors": {"K": 4, "M": 3, "C": 3, "S": 3, "B": 2, "Z": 11}},
    "5": {"name_zh": "🚙 車輛安裝 [5-X]", "name_en": "🚙 Ground Vehicle [5-X]", "factors": {"K": 6, "M": 3, "C": 3, "S": 3, "B": 3}},
    "6": {"name_zh": "🚢 船舶環境 [6-X]", "name_en": "🚢 Ship Environment [6-X]", "factors": {"K": 5, "M": 4, "C": 3, "S": 3, "B": 2}},
    "7": {"name_zh": "📱 攜帶設備 [7-X]", "name_en": "📱 Portable [7-X]", "factors": {"K": 4, "M": 3, "C": 3, "S": 2, "B": 2}},
    "9": {"name_zh": "🔬 產品內微氣候 [9-X]", "name_en": "🔬 Microclimates [9-X]", "factors": {"K": 2}}
}

FACTOR_NAMES: Dict[str, Dict[str, str]] = {
    "K": {"ZH": "氣候條件 (Climatic)", "EN": "Climatic"},
    "M": {"ZH": "機械條件 (Mechanical)", "EN": "Mechanical"},
    "C": {"ZH": "化學物質 (Chemically Active)", "EN": "Chemically Active"},
    "S": {"ZH": "機械活性物質 (Mechanically Active)", "EN": "Mechanically Active"},
    "B": {"ZH": "生物條件 (Biological)", "EN": "Biological"},
    "Z": {"ZH": "特殊條件 (Special)", "EN": "Special Conditions"}
}

# ==========================================
# 3. 核心功能函數 (Type Hinting 強化)
# ==========================================
@st.cache_data
def load_database() -> Dict[str, Any]:
    """載入 IEC 資料庫，具備錯誤處理機制"""
    db_path = "iec_database.json"
    if os.path.exists(db_path):
        try:
            with open(db_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            st.error("❌ JSON 格式錯誤，請檢查 iec_database.json")
    return {}

def assess_risk_level(severity: int, lang: str) -> Tuple[str, str]:
    """風險視覺化評估邏輯"""
    if severity <= 2:
        return ("🟢 Low Risk (Standard Design)" if lang == "EN" else "🟢 低風險 (標準商用設計即可)", "risk-low")
    elif severity <= 4:
        return ("🟡 Medium Risk (Robust Design Req.)" if lang == "EN" else "🟡 中高風險 (需強化機構與散熱設計)", "risk-med")
    else:
        return ("🔴 High Risk (Extreme/Ruggedized)" if lang == "EN" else "🔴 極端風險 (軍工規強固設計，成本極高)", "risk-high")

DB = load_database()

# ==========================================
# 4. 前端 UI 與操作邏輯 (響應式設計)
# ==========================================
col_title, col_lang = st.columns([4, 1])
with col_lang:
    lang = st.radio("Lang", ["ZH", "EN"], horizontal=True, label_visibility="collapsed")

st.title("🛡️ IEC 60721 AutoSpec Engine")
st.caption("Reliability Engineering Decision Matrix" if lang == "EN" else "可靠度工程決策與測試轉換矩陣")
st.divider()

# 切分左右欄位，手機端會自動轉換為上下堆疊
col_input, col_output = st.columns([1, 1.2], gap="large")

with col_input:
    st.subheader("1. Parameters Input" if lang == "EN" else "1. 規範參數輸入")
    
    loc_options = ["-- Select --"] + [f"{k} - {v[f'name_{lang.lower()}']}" for k, v in FULL_SCHEMA.items()]
    selected_loc = st.selectbox("📍 Location Class" if lang == "EN" else "📍 場景類別 (Location)", loc_options)

    if selected_loc != "-- Select --":
        loc_id = selected_loc.split(" - ")[0]
        schema_factors = FULL_SCHEMA[loc_id]["factors"]
        
        factor_options = ["-- Select --"] + [f"{f} - {FACTOR_NAMES[f][lang]}" for f in schema_factors.keys()]
        selected_factor = st.selectbox("🌪️ Environmental Factor" if lang == "EN" else "🌪️ 應力因子 (Factor)", factor_options)
        
        if selected_factor != "-- Select --":
            factor_id = selected_factor.split(" - ")[0]
            max_level = schema_factors[factor_id]
            
            level_options = ["-- Select --"]
            for i in range(1, max_level + 1):
                code = f"{loc_id}{factor_id}{i}"
                desc = DB.get(loc_id, {}).get(factor_id, {}).get(code, {}).get("parameters", {}).get("Description", "")
                display_text = f"{code} - {desc}" if desc else f"{code} - (Pending)"
                level_options.append(display_text)
                
            selected_level_text = st.selectbox("📊 Severity Level" if lang == "EN" else "📊 嚴苛等級 (Severity)", level_options)

with col_output:
    if selected_loc != "-- Select --" and selected_factor != "-- Select --" and selected_level_text != "-- Select --":
        target_code = selected_level_text.split(" - ")[0]
        severity_num = int(target_code[-1])
        
        st.subheader("2. Specification Output" if lang == "EN" else "2. 規範轉換輸出")
        st.success(f"### 🎯 Target: IEC 60721-3 -> **{target_code}**")
        
        # 插入風險視覺化評估
        risk_msg, risk_css = assess_risk_level(severity_num, lang)
        st.markdown(f"<span class='{risk_css}'>⚠️ Risk Assessment: {risk_msg}</span>", unsafe_allow_html=True)
        
        level_data = DB.get(loc_id, {}).get(factor_id, {}).get(target_code, {})
        
        if level_data:
            with st.expander(f"🔍 {'Physical Parameters' if lang == 'EN' else '環境物理參數'}", expanded=True):
                for pk, pv in level_data.get("parameters", {}).items():
                    st.markdown(f"- **{pk}**: `{pv}`")
                    
            tests = level_data.get("tests", [])
            if tests:
                st.markdown(f"#### 🛠️ {'Test Mapping to IEC 60068' if lang == 'EN' else '測試轉換矩陣 (IEC 60068)'}")
                df_tests = pd.DataFrame(tests)
                
                # 行動端最佳化：使用自適應 dataframe 取代固定 table，避免手機畫面水平溢出
                st.dataframe(df_tests, use_container_width=True, hide_index=True)
                
                # 提供多種匯出格式
                col_dl1, col_dl2 = st.columns(2)
                with col_dl1:
                    st.download_button(
                        label="📥 JSON 規格檔",
                        data=json.dumps(level_data, indent=2, ensure_ascii=False),
                        file_name=f"IEC_{target_code}.json",
                        mime="application/json",
                        use_container_width=True
                    )
                with col_dl2:
                    st.download_button(
                        label="📥 CSV 測試表",
                        data=df_tests.to_csv(index=False).encode('utf-8-sig'),
                        file_name=f"IEC_Test_Matrix_{target_code}.csv",
                        mime="text/csv",
                        use_container_width=True
                    )
        else:
            st.warning("⚠️ " + ("Data mapping is currently pending." if lang == "EN" else "資料庫暫缺此代碼，請工程師手動擴充 JSON。"))