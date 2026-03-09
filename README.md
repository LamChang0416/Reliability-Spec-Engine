# 🛡️ IEC 60721 AutoSpec Engine

🌍 [English Version](#english-version) | 🇹🇼 [繁體中文版](#繁體中文版)

---

## English Version

### 📌 Overview
**IEC 60721 AutoSpec Engine** is an enterprise-grade reliability engineering tool built with Python and Streamlit. It seamlessly converts complex **IEC 60721-3** environmental conditions (Storage, Transportation, Stationary, Portable, etc.) into actionable **IEC 60068-2** test matrices.

Designed for Reliability Engineers, Hardware PMs, and Mechanical Engineers, this system acts as a "Specification Defense Shield"—preventing over-design and ensuring product resilience in edge computing, server infrastructure, and ruggedized applications.

### ✨ Core Features
* **🔄 Automated Standards Mapping**: Instantly maps 324 severity levels (e.g., 3K3, 5M2, 7M3) to specific test conditions (Vibration, Shock, Temperature, Humidity).
* **📊 Risk Assessment Dashboard**: Visually flags high-risk severity levels (Level 5+) to alert teams of potential extreme mechanical or climatic stress, mitigating unnecessary design costs.
* **📥 Engineering Data Export**: One-click export to **JSON** (for automated test equipment / ATE integration) and **CSV** (for lab scheduling and PM review).
* **📱 Mobile-Ready Cyberpunk UI**: Fully responsive, dark-mode-enforced interface for quick on-site or factory floor lookups.

### 💡 Why This Matters? (The Engineering Value)
A common pitfall in hardware development is misinterpreting environmental codes (e.g., assuming `3M3` and `2M3` imply the same mechanical stress). This tool bridges the gap between abstract standard codes and physical lab data, preventing:
1.  **Under-design**: Leading to high DOA (Dead on Arrival) rates during transportation.
2.  **Over-design**: Wasting budget on shock absorbers for benign environments.

### 🚀 Getting Started
```bash
# 1. Clone the repository
git clone [https://github.com/YourUsername/IEC60721-AutoSpec.git](https://github.com/YourUsername/IEC60721-AutoSpec.git)

# 2. Navigate to the directory
cd IEC60721-AutoSpec

# 3. Install requirements
pip install streamlit pandas

# 4. Run the engine
streamlit run app.py

繁體中文版
📌 專案簡介
IEC 60721 AutoSpec 決策引擎 是一套專為硬體開發與可靠度工程打造的企業級自動化工具。它能將艱澀的 IEC 60721-3 環境規範（涵蓋倉儲、運輸、室內機房、戶外車載等）一鍵轉換為實驗室可執行的 IEC 60068-2 物理測試矩陣。

本系統旨在成為可靠度工程師（Reliability Engineer）與機構團隊的「防禦盾牌」，協助伺服器、邊緣運算及強固型設備團隊精準定義產品規格，避免盲目開發。

✨ 核心功能
🔄 國際規範自動映射：內建 IEC 60721 骨架，將高達 324 種嚴苛等級（如 3K3, 5M2）直接轉譯為震動、衝擊、溫濕度等具體測試條件。

📊 風險防禦儀表板：透過視覺化警示機制，當使用者選擇高等級應力（Level 5 以上）時，系統會自動亮起紅燈，提醒 PM 與工程師該規格將帶來極高的開發與材料成本。

📥 多格式工程輸出：支援匯出 JSON（可與自動化測試機台 ATE 或 CI/CD 流程串接）以及 CSV（方便實驗室排程與跨部門報表）。

📱 RWD 戰術面板：底層強制注入工程師專屬暗黑主題，並具備完美響應式設計（RWD），確保在工廠產線使用手機查閱時依然流暢專業。

💡 專案價值與工程防禦
在硬體開發初期，最常發生的災難就是「規格誤判」。許多人誤以為代碼數字相同（例如 3M3 與 2M3）破壞力就一樣。本系統消除了代碼的模糊地帶，用絕對的物理數值說話，有效防止：

規格低估 (Under-design)：導致產品在運輸或震動環境中發生 DOA。

過度設計 (Over-design)：在安靜的機房環境中盲目堆疊避震材料，浪費專案預算。

🚀 快速啟動

# 1. 下載專案
git clone [https://github.com/YourUsername/IEC60721-AutoSpec.git](https://github.com/YourUsername/IEC60721-AutoSpec.git)

# 2. 進入專案目錄
cd IEC60721-AutoSpec

# 3. 安裝依賴套件
pip install streamlit pandas

# 4. 啟動決策引擎
streamlit run app.py
