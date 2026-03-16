import streamlit as st
import pandas as pd
import json
import os

# ==========================================
# 1. Page Config & Global CSS
# ==========================================
st.set_page_config(
    page_title="Reliability Spec Engine",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* ---- Global Reset ---- */
.stApp {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(135deg, #0a0f2c 0%, #0d1b3e 50%, #0f2050 100%);
    color: #e2e8f0;
}

/* ---- Sidebar ---- */
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0d1b3e 0%, #0a1628 100%);
    border-right: 1px solid rgba(99, 179, 237, 0.15);
}
[data-testid="stSidebar"] .stMarkdown {
    color: #94a3b8;
}

/* ---- Main Title ---- */
h1 { 
    background: linear-gradient(90deg, #63b3ed, #90cdf4, #bee3f8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
    font-size: 2rem !important;
    letter-spacing: -0.02em;
}
h2, h3 {
    color: #90cdf4 !important;
    font-weight: 600;
}
h4 { color: #bee3f8 !important; }

/* ---- Tabs ---- */
.stTabs [data-baseweb="tab-list"] {
    gap: 4px;
    background: rgba(13, 27, 62, 0.8);
    border-radius: 12px;
    padding: 6px;
    border: 1px solid rgba(99, 179, 237, 0.15);
}
.stTabs [data-baseweb="tab"] {
    border-radius: 8px;
    padding: 8px 20px;
    font-weight: 600;
    font-size: 14px;
    color: #94a3b8;
    background: transparent;
    border: none;
    transition: all 0.2s ease;
}
.stTabs [aria-selected="true"] {
    background: linear-gradient(135deg, #1a3a6b 0%, #1e4080 100%) !important;
    color: #90cdf4 !important;
    box-shadow: 0 2px 8px rgba(99, 179, 237, 0.2);
}
.stTabs [data-baseweb="tab"]:hover {
    color: #bee3f8 !important;
}

/* ---- Version Badge ---- */
.version-badge {
    display: inline-block;
    background: linear-gradient(135deg, #1a3a6b, #1e4080);
    color: #63b3ed;
    border: 1px solid rgba(99, 179, 237, 0.3);
    border-radius: 20px;
    padding: 3px 12px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-left: 8px;
}
.new-badge {
    display: inline-block;
    background: linear-gradient(135deg, #22543d, #276749);
    color: #68d391;
    border: 1px solid rgba(104, 211, 145, 0.3);
    border-radius: 20px;
    padding: 3px 10px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

/* ---- Search Results Card ---- */
.search-card {
    background: linear-gradient(135deg, rgba(26, 58, 107, 0.4), rgba(30, 64, 128, 0.3));
    border: 1px solid rgba(99, 179, 237, 0.2);
    border-left: 3px solid #63b3ed;
    border-radius: 10px;
    padding: 14px 18px;
    margin-bottom: 10px;
}
.search-card-title { color: #90cdf4; font-weight: 600; font-size: 14px; }
.search-card-std { color: #63b3ed; font-size: 11px; font-weight: 500; text-transform: uppercase; }
.search-card-body { color: #cbd5e0; font-size: 13px; margin-top: 6px; }

/* ---- Parameter Cards ---- */
.param-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
    margin: 12px 0;
}
.param-card {
    background: linear-gradient(135deg, rgba(13, 27, 62, 0.8), rgba(10, 20, 50, 0.9));
    border: 1px solid rgba(99, 179, 237, 0.15);
    border-radius: 10px;
    padding: 14px 16px;
    transition: border-color 0.2s;
}
.param-card:hover { border-color: rgba(99, 179, 237, 0.4); }
.param-label { color: #718096; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }
.param-value { color: #bee3f8; font-size: 15px; font-weight: 600; margin-top: 4px; word-break: break-word; }

/* ---- Result Banner ---- */
.result-banner {
    background: linear-gradient(135deg, rgba(26, 58, 107, 0.6), rgba(30, 64, 128, 0.5));
    border: 1px solid rgba(99, 179, 237, 0.25);
    border-top: 3px solid #63b3ed;
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 16px;
}
.result-banner h3 { color: #90cdf4 !important; margin: 0; font-size: 1.1rem; }
.result-subtitle { color: #718096; font-size: 13px; margin-top: 4px; }

/* ---- Selectbox ---- */
.stSelectbox > div > div {
    background: rgba(13, 27, 62, 0.8) !important;
    border: 1px solid rgba(99, 179, 237, 0.25) !important;
    border-radius: 8px !important;
    color: #e2e8f0 !important;
}
.stSelectbox label { color: #94a3b8 !important; font-weight: 500; }

/* ---- Text Input ---- */
.stTextInput > div > div > input {
    background: rgba(13, 27, 62, 0.8) !important;
    border: 1px solid rgba(99, 179, 237, 0.25) !important;
    border-radius: 8px !important;
    color: #e2e8f0 !important;
}
.stTextInput label { color: #94a3b8 !important; }

/* ---- Dataframe ---- */
.stDataFrame { border-radius: 10px; overflow: hidden; }
[data-testid="stDataFrame"] {
    border: 1px solid rgba(99, 179, 237, 0.15);
    border-radius: 10px;
}

/* ---- Buttons ---- */
.stDownloadButton > button {
    background: linear-gradient(135deg, #1a3a6b, #1e4080) !important;
    border: 1px solid rgba(99, 179, 237, 0.3) !important;
    color: #90cdf4 !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    transition: all 0.2s !important;
}
.stDownloadButton > button:hover {
    background: linear-gradient(135deg, #1e4080, #235090) !important;
    border-color: rgba(99, 179, 237, 0.6) !important;
    box-shadow: 0 0 12px rgba(99, 179, 237, 0.2) !important;
}

/* ---- Radio ---- */
.stRadio label { color: #94a3b8 !important; }
.stRadio [data-baseweb="radio"] { background: transparent !important; }

/* ---- Divider ---- */
hr { border-color: rgba(99, 179, 237, 0.12) !important; }

/* ---- Expander ---- */
.streamlit-expanderHeader {
    background: rgba(13, 27, 62, 0.6) !important;
    border-radius: 8px !important;
    color: #90cdf4 !important;
}

/* ---- Success/Warning/Error ---- */
.stAlert { border-radius: 10px !important; }

/* ---- Metric Cards ---- */
[data-testid="stMetric"] {
    background: rgba(13, 27, 62, 0.6);
    border: 1px solid rgba(99, 179, 237, 0.15);
    border-radius: 10px;
    padding: 12px 16px !important;
}
[data-testid="stMetricLabel"] { color: #718096 !important; }
[data-testid="stMetricValue"] { color: #90cdf4 !important; font-weight: 700; }
</style>
""", unsafe_allow_html=True)


# ==========================================
# 2. Database Loader
# ==========================================
@st.cache_data
def load_db(filename: str):
    path = os.path.join(os.path.dirname(__file__), filename)
    if not os.path.exists(path):
        path = filename
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


# ==========================================
# 3. Language & Header
# ==========================================
# Sidebar – Language selector
with st.sidebar:
    st.markdown("### ⚙️ Settings")
    lang = st.radio("Language / 語言", ["ZH 中文", "EN English"], label_visibility="collapsed")
    lang = "ZH" if lang.startswith("ZH") else "EN"
    st.markdown("---")

    # Sidebar – Global Search
    st.markdown("### 🔍 " + ("全文搜尋" if lang == "ZH" else "Global Search"))
    search_query = st.text_input(
        "搜尋規範關鍵字 / Search specs" if lang == "ZH" else "Search across all standards",
        placeholder="e.g. vibration, -40°C, salt fog",
        label_visibility="collapsed"
    )
    st.markdown("---")
    st.markdown(f"""
<div style="color:#4a5568; font-size:12px; line-height:1.8;">
{'📘 資料庫版本' if lang == 'ZH' else '📘 Database Versions'}:<br>
• MIL-STD-<b style="color:#63b3ed">810H</b> (2019)<br>
• GR-63-CORE Issue <b style="color:#63b3ed">5</b> (2022)<br>
• ASTM D4169-<b style="color:#63b3ed">22</b> (2022)<br>
• IEC 60721-3 (2019)<br><br>
<span style="color:#68d391">●</span> {'最新版資料庫' if lang == 'ZH' else 'Latest standard revisions'}
</div>
""", unsafe_allow_html=True)

# Main title
st.markdown(
    f"# 🛡️ {'Reliability Spec Engine 四合一旗艦版' if lang == 'ZH' else 'Reliability Spec Engine'}"
)
st.caption(
    "MIL-STD-810H | GR-63-CORE Issue 5 | ASTM D4169-22 | IEC 60721-3" 
)


# ==========================================
# 4. Global Search Mode
# ==========================================
def search_all_dbs(query: str) -> list:
    """Search across all four databases for a keyword."""
    query_lower = query.lower()
    results = []
    
    db_map = {
        "🎖️ MIL-STD-810H": load_db("mil810_database.json"),
        "🏢 GR-63-CORE Issue 5": load_db("gr63_database.json"),
        "📦 ASTM D4169-22": load_db("astm4169_database.json"),
        "🛡️ IEC 60721-3": load_db("iec_database.json"),
    }
    
    for std_name, db in db_map.items():
        if not db:
            continue
        for l1, l1v in db.items():
            if not isinstance(l1v, dict):
                continue
            for l2, l2v in l1v.items():
                if not isinstance(l2v, dict):
                    continue
                for l3, entry in l2v.items():
                    if not isinstance(entry, dict):
                        continue
                    # Convert entire entry to string for search
                    haystack = json.dumps(entry, ensure_ascii=False).lower()
                    if query_lower in haystack or query_lower in l1.lower() or query_lower in l2.lower() or query_lower in l3.lower():
                        desc_zh = entry.get("parameters", {}).get("Description_ZH", 
                               entry.get("parameters", {}).get("Description", ""))
                        desc_en = entry.get("parameters", {}).get("Description_EN",
                               entry.get("parameters", {}).get("Description", ""))
                        results.append({
                            "standard": std_name,
                            "path": f"{l1} › {l2} › {l3}",
                            "desc_zh": desc_zh,
                            "desc_en": desc_en,
                            "entry": entry
                        })
    return results


if search_query and len(search_query) >= 2:
    st.markdown("---")
    results = search_all_dbs(search_query)
    count_label = f"找到 **{len(results)}** 條符合結果" if lang == "ZH" else f"Found **{len(results)}** matching results"
    st.markdown(f"### 🔍 搜尋結果 / Search Results — {count_label}")
    
    if not results:
        st.info("⚠️ " + ("找不到符合的條目，請嘗試其他關鍵字" if lang == "ZH" else "No results found. Try different keywords."))
    else:
        for r in results[:30]:  # Show max 30 results
            desc = r["desc_zh"] if lang == "ZH" else r["desc_en"]
            st.markdown(f"""
<div class="search-card">
    <div class="search-card-std">{r['standard']}</div>
    <div class="search-card-title">📌 {r['path']}</div>
    <div class="search-card-body">{desc}</div>
</div>
""", unsafe_allow_html=True)
    st.markdown("---")


# ==========================================
# 5. Tab Layout
# ==========================================
if lang == "EN":
    tab_iec, tab_mil, tab_astm, tab_gr63 = st.tabs([
        "🛡️ IEC 60721-3",
        "🎖️ MIL-STD-810H",
        "📦 ASTM D4169-22",
        "🏢 GR-63 Issue 5"
    ])
else:
    tab_iec, tab_mil, tab_astm, tab_gr63 = st.tabs([
        "🛡️ IEC 60721-3 環境分類",
        "🎖️ MIL-STD-810H 軍規測試",
        "📦 ASTM D4169-22 運輸包裝",
        "🏢 GR-63 Issue 5 電信機房"
    ])


# ==========================================
# Helper: Render Parameters as Grid Cards
# ==========================================
def render_params(params: dict, lang: str):
    """Render parameters as a grid of metric-style cards."""
    skip_keys = {"Standard", "Description_ZH", "Description_EN", "Description"}
    filtered = {k: v for k, v in params.items() if k not in skip_keys}
    
    if not filtered:
        return
    
    # Split into rows of 3
    items = list(filtered.items())
    cols_per_row = 3
    for i in range(0, len(items), cols_per_row):
        row_items = items[i:i+cols_per_row]
        cols = st.columns(len(row_items))
        for col, (k, v) in zip(cols, row_items):
            col.metric(label=k, value=str(v))


def render_result_banner(title: str, subtitle: str = ""):
    """Render a result banner."""
    st.markdown(f"""
<div class="result-banner">
    <h3>🎯 {title}</h3>
    {'<div class="result-subtitle">' + subtitle + '</div>' if subtitle else ''}
</div>
""", unsafe_allow_html=True)


def render_download_buttons(entry: dict, prefix: str, key_suffix: str, lang: str):
    """Render unified JSON + CSV download buttons."""
    tests = entry.get("tests", [])
    c1, c2 = st.columns(2)
    c1.download_button(
        "📥 JSON" if lang == "EN" else "📥 下載 JSON",
        json.dumps(entry, indent=2, ensure_ascii=False),
        f"{prefix}.json",
        "application/json",
        use_container_width=True,
        key=f"dl_json_{key_suffix}"
    )
    if tests:
        df = pd.DataFrame(tests)
        c2.download_button(
            "📥 CSV" if lang == "EN" else "📥 下載 CSV",
            df.to_csv(index=False).encode("utf-8-sig"),
            f"{prefix}.csv",
            "text/csv",
            use_container_width=True,
            key=f"dl_csv_{key_suffix}"
        )


# ==========================================
# 6. Engine A — IEC 60721-3
# ==========================================
with tab_iec:
    st.markdown(
        '<span class="version-badge">IEC 60721-3 · 2019</span>' if lang == "EN"
        else '<span class="version-badge">IEC 60721-3 · 2019</span>',
        unsafe_allow_html=True
    )
    st.caption("Reliability Engineering Environmental Classification" if lang == "EN" else "可靠度工程環境分類與測試轉換矩陣")
    
    IEC_DB = load_db("iec_database.json")
    
    CLASS_NAMES = {
        "1": {"ZH": "📦 儲存 [1-X]", "EN": "📦 Storage [1-X]"},
        "2": {"ZH": "🚚 運輸 [2-X]", "EN": "🚚 Transportation [2-X]"},
        "3": {"ZH": "🏢 室內定點 [3-X]", "EN": "🏢 Stationary Indoor [3-X]"},
        "4": {"ZH": "🌦️ 戶外定點 [4-X]", "EN": "🌦️ Outdoor Stationary [4-X]"},
        "5": {"ZH": "🚙 車載裝備 [5-X]", "EN": "🚙 Ground Vehicle [5-X]"},
        "6": {"ZH": "🚢 船舶環境 [6-X]", "EN": "🚢 Ship Environment [6-X]"},
        "7": {"ZH": "🎒 攜帶與行動 [7-X]", "EN": "🎒 Portable & Non-stationary [7-X]"},
        "9": {"ZH": "⚙️ 內部微氣候 [9-X]", "EN": "⚙️ Microclimates Inside Products [9-X]"}
    }
    FACTOR_NAMES = {
        "K": ("🌪️ Climatic (K)" if lang == "EN" else "🌪️ 氣候環境 (K)"),
        "M": ("💥 Mechanical (M)" if lang == "EN" else "💥 機械環境 (M)"),
        "C": ("🧪 Chemical (C)" if lang == "EN" else "🧪 化學環境 (C)"),
        "S": ("🏜️ Sand & Dust (S)" if lang == "EN" else "🏜️ 沙塵活性物質 (S)")
    }

    col_i1, col_i2 = st.columns([1, 1.5], gap="large")
    
    with col_i1:
        st.subheader("① " + ("Input Criteria" if lang == "EN" else "規格選擇"))
        if not IEC_DB:
            st.warning("⚠️ iec_database.json 無法載入")
        else:
            loc_options = ["-- Select --"] + [
                f"{k} — {CLASS_NAMES.get(k, {}).get(lang, k)}"
                for k in sorted(IEC_DB.keys())
            ]
            loc = st.selectbox(
                "📍 " + ("Location Class" if lang == "EN" else "位置分類"),
                loc_options, key="iec_loc"
            )
            
            if loc != "-- Select --":
                loc_id = loc.split(" — ")[0]
                factor_options = [
                    f"{f} — {FACTOR_NAMES.get(f, f)}"
                    for f in sorted(IEC_DB[loc_id].keys())
                ]
                factor_display = st.selectbox(
                    "🌪️ " + ("Environmental Factor" if lang == "EN" else "環境因子"),
                    factor_options, key="iec_factor"
                )
                factor_id = factor_display.split(" — ")[0]
                target_code = st.selectbox(
                    "📊 " + ("Severity Class" if lang == "EN" else "嚴苛等級"),
                    sorted(IEC_DB[loc_id][factor_id].keys()), key="iec_level"
                )

    with col_i2:
        if loc != "-- Select --":
            st.subheader("② " + ("Results" if lang == "EN" else "查詢結果"))
            render_result_banner(f"IEC {target_code}", f"Class {loc_id} · Factor {factor_id}")
            data = IEC_DB[loc_id][factor_id][target_code]
            if data:
                render_params(data.get("parameters", {}), lang)
                df_tests = pd.DataFrame(data.get("tests", []))
                if not df_tests.empty:
                    st.markdown("#### 📊 " + ("Test Conversion Table" if lang == "EN" else "測試轉換對照表"))
                    st.dataframe(df_tests, use_container_width=True, hide_index=True)
                render_download_buttons(data, f"IEC_{target_code}", f"iec_{target_code}", lang)


# ==========================================
# 7. Engine B — MIL-STD-810H
# ==========================================
with tab_mil:
    st.markdown(
        '<span class="version-badge">MIL-STD-810H · 2019</span> <span class="new-badge">Updated from 810G</span>',
        unsafe_allow_html=True
    )
    st.caption("Environmental Engineering Considerations and Laboratory Tests" if lang == "EN" else "軍規環境工程考量與實驗室測試裁適 (810G → 810H 全面升版)")
    
    MIL_DB = load_db("mil810_database.json")
    
    if not MIL_DB:
        st.error("⚠️ mil810_database.json 無法載入")
    else:
        col_m1, col_m2 = st.columns([1, 1.5], gap="large")
        with col_m1:
            st.subheader("① " + ("Tailoring Selection" if lang == "EN" else "測試裁適選擇"))
            method = st.selectbox(
                "🛠️ " + ("Test Method" if lang == "EN" else "測試方法"),
                ["-- Select --"] + list(MIL_DB.keys()), key="mil_method"
            )
            if method != "-- Select --":
                proc = st.selectbox(
                    "📋 " + ("Procedure" if lang == "EN" else "程序"),
                    ["-- Select --"] + list(MIL_DB[method].keys()), key="mil_proc"
                )
                if proc != "-- Select --":
                    cat = st.selectbox(
                        "🏷️ " + ("Category / Condition" if lang == "EN" else "類別 / 條件"),
                        ["-- Select --"] + list(MIL_DB[method][proc].keys()), key="mil_cat"
                    )
        
        with col_m2:
            if method != "-- Select --" and proc != "-- Select --" and cat != "-- Select --":
                st.subheader("② " + ("Test Specification" if lang == "EN" else "測試規範輸出"))
                target_data = MIL_DB[method][proc][cat]
                params = target_data.get("parameters", {})
                
                # Description
                desc = params.get("Description_ZH", "") if lang == "ZH" else params.get("Description_EN", params.get("Description_ZH", ""))
                render_result_banner(method.split(" - ")[0], desc)
                
                # Parameter Cards
                render_params(params, lang)
                
                # Test profile table
                tests = target_data.get("tests", [])
                if tests:
                    st.markdown("#### 📊 " + ("Test Profile" if lang == "EN" else "測試剖面"))
                    df_tests = pd.DataFrame(tests)
                    st.dataframe(df_tests, use_container_width=True, hide_index=True)
                
                render_download_buttons(
                    target_data,
                    f"MIL810H_{method.split(' ')[1][:6]}",
                    f"mil_{method[:20]}_{cat[:10]}",
                    lang
                )


# ==========================================
# 8. Engine C — ASTM D4169-22
# ==========================================
with tab_astm:
    st.markdown(
        '<span class="version-badge">ASTM D4169-22 · 2022</span> <span class="new-badge">Updated from D4169-09</span>',
        unsafe_allow_html=True
    )
    st.caption("Performance Testing of Shipping Containers and Systems" if lang == "EN" else "包裝與運輸系統性能測試規範 (D4169-09 → D4169-22 升版)")
    
    ASTM_DB = load_db("astm4169_database.json")
    
    if not ASTM_DB:
        st.error("⚠️ astm4169_database.json 無法載入")
    else:
        col_a1, col_a2 = st.columns([1, 1.5], gap="large")
        with col_a1:
            st.subheader("① " + ("Test Selection" if lang == "EN" else "測試排程選擇"))
            astm_cat = st.selectbox(
                "📂 " + ("Schedule / Cycle" if lang == "EN" else "排程 / 循環"),
                ["-- Select --"] + list(ASTM_DB.keys()), key="astm_cat"
            )
            if astm_cat != "-- Select --":
                astm_sub = st.selectbox(
                    "📋 " + ("Test Type" if lang == "EN" else "測試類型"),
                    ["-- Select --"] + list(ASTM_DB[astm_cat].keys()), key="astm_sub"
                )
                if astm_sub != "-- Select --":
                    astm_item = st.selectbox(
                        "🏷️ " + ("Specific Condition" if lang == "EN" else "特定條件"),
                        ["-- Select --"] + list(ASTM_DB[astm_cat][astm_sub].keys()), key="astm_item"
                    )
        
        with col_a2:
            if astm_cat != "-- Select --" and astm_sub != "-- Select --" and astm_item != "-- Select --":
                st.subheader("② " + ("Test Specification" if lang == "EN" else "測試規範輸出"))
                target_data = ASTM_DB[astm_cat][astm_sub][astm_item]
                params = target_data.get("parameters", {})
                
                desc = params.get("Description_ZH", "") if lang == "ZH" else params.get("Description_EN", params.get("Description_ZH", ""))
                render_result_banner(astm_item, desc)
                
                render_params(params, lang)
                
                tests = target_data.get("tests", [])
                if tests:
                    st.markdown("#### 📊 " + ("Test Profile" if lang == "EN" else "測試剖面"))
                    df_tests = pd.DataFrame(tests)
                    st.dataframe(df_tests, use_container_width=True, hide_index=True)
                
                render_download_buttons(
                    target_data,
                    f"ASTM_D4169-22_{astm_sub[:15]}",
                    f"astm_{astm_cat[:10]}_{astm_item[:15]}",
                    lang
                )


# ==========================================
# 9. Engine D — GR-63-CORE Issue 5
# ==========================================
with tab_gr63:
    st.markdown(
        '<span class="version-badge">GR-63-CORE Issue 5 · 2022</span> <span class="new-badge">Updated from Issue 4</span>',
        unsafe_allow_html=True
    )
    st.caption("NEBS Requirements: Physical Protection" if lang == "EN" else "NEBS 物理保護與環境測試規範 – 電信機房 (Issue 4 → Issue 5 升版)")
    
    GR63_DB = load_db("gr63_database.json")
    
    if not GR63_DB:
        st.error("⚠️ gr63_database.json 無法載入")
    else:
        col_g1, col_g2 = st.columns([1, 1.5], gap="large")
        with col_g1:
            st.subheader("① " + ("Section Selection" if lang == "EN" else "測試章節選擇"))
            gr_sec = st.selectbox(
                "📂 " + ("Section" if lang == "EN" else "章節"),
                ["-- Select --"] + list(GR63_DB.keys()), key="gr_sec"
            )
            if gr_sec != "-- Select --":
                gr_cat = st.selectbox(
                    "📋 " + ("Category" if lang == "EN" else "類別"),
                    ["-- Select --"] + list(GR63_DB[gr_sec].keys()), key="gr_cat"
                )
                if gr_cat != "-- Select --":
                    gr_item = st.selectbox(
                        "🏷️ " + ("Condition" if lang == "EN" else "條件"),
                        ["-- Select --"] + list(GR63_DB[gr_sec][gr_cat].keys()), key="gr_item"
                    )
        
        with col_g2:
            if gr_sec != "-- Select --" and gr_cat != "-- Select --" and gr_item != "-- Select --":
                st.subheader("② " + ("Test Specification" if lang == "EN" else "測試規範輸出"))
                target_data = GR63_DB[gr_sec][gr_cat][gr_item]
                params = target_data.get("parameters", {})
                
                desc = params.get("Description_ZH", "") if lang == "ZH" else params.get("Description_EN", params.get("Description_ZH", ""))
                render_result_banner(gr_item, desc)
                
                render_params(params, lang)
                
                tests = target_data.get("tests", [])
                if tests:
                    st.markdown("#### 📊 " + ("Evaluation Steps" if lang == "EN" else "評估步驟"))
                    df_tests = pd.DataFrame(tests)
                    st.dataframe(df_tests, use_container_width=True, hide_index=True)
                
                render_download_buttons(
                    target_data,
                    f"GR63_Issue5_{gr_sec[:12]}",
                    f"gr_{gr_sec[:10]}_{gr_item[:12]}",
                    lang
                )