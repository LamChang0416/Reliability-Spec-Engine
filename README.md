# 🛡️ Reliability Spec Engine 2.0

> **九合一可靠度工程工作站 · Nine-in-One Reliability Engineering Workstation**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen?logo=github)](https://LamChang0416.github.io/Reliability-Spec-Engine/)
[![PWA](https://img.shields.io/badge/PWA-v2.1-blue?logo=pwa)](https://LamChang0416.github.io/Reliability-Spec-Engine/)
[![Standards](https://img.shields.io/badge/Standards-8%20Standards%20%2B%20Vib%20Calc-orange)](https://github.com/LamChang0416/Reliability-Spec-Engine)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

# [🚀 立即使用 Launch Spec Engine 2.0](https://LamChang0416.github.io/Reliability-Spec-Engine/)

---

## 📖 Overview · 專案簡介

**English** | A professional-grade PWA engineering workstation consolidating **8 major reliability and environmental test standards** plus a **dedicated Vibration Analysis Calculator** into a single, mobile-friendly interface. Features real-time Grms integration, PSD Log-Log frequency charts, thermal profile visualization, cross-standard search, and full offline support. Created by **Lam**.

**繁體中文** | 一套將 **8 大可靠度與環境測試規範** 整合於單一介面的專業 PWA 可靠度工程工作站，由 **Lam** 獨家開發。整合振動分析引擎（Grms 積分運算、PSD 頻譜圖）、熱分布視覺化、跨規範搜尋、雙語介面與完整離線支援。

---

## 📋 Standards Covered · 涵蓋規範

| 規範 | 版本 | 用途 | 官方連結 |
|------|------|------|----------|
| 🎖️ **MIL-STD-810H** | 2019 | 軍規環境工程測試 / Military environmental testing | [DLA QuickSearch](https://quicksearch.dla.mil/) |
| 🏢 **GR-63-CORE Issue 5** | 2022 | 電信機房 NEBS 規範 / Telecom CO physical protection | [Ericsson NEBS](https://telecom-info.njdepot.ericsson.se/) |
| 📦 **ASTM D4169-22** | 2022 | 包裝運輸性能測試 / Packaging & transport performance | [ASTM International](https://www.astm.org/d4169-22.html) |
| 📦 **ISTA** | 1A, 2A, 3A, 6-Amazon | 包裝與運輸模擬測試 / Safe Transit Association | [ISTA](https://ista.org) |
| 🛡️ **IEC 60721-3** | 2019 | 環境條件分類 / Environmental condition classification | [IEC](https://webstore.iec.ch/) |
| 🔬 **IEC 60068-2** | 2023–2025 | 環境測試方法 / Environmental testing methods | [IEC](https://webstore.iec.ch/) |
| 💧 **IEC 60529** | +AMD2:2013 | IP 防護等級 (含 IP69K) / Ingress Protection Code | [IEC](https://webstore.iec.ch/) |
| 📈 **Telcordia SR-332** | Issue 4 (2016) | 硬體可靠度預測 / Hardware Reliability Prediction | Telcordia |

---

## ✨ Features · 主要功能

### 🔍 Core Reference Engine · 規範查詢核心
- **Cross-Standard Search / 跨規範搜尋** — 單一關鍵字，同時搜尋全部八個資料庫
- **Metric Card Display / 參數卡片** — 溫度、g 值、時程等重要數值清晰卡片化展示
- **Export JSON & CSV / 資料匯出** — 一鍵匯出供測試計畫文件使用
- **Bilingual ZH/EN / 中英文切換** — 完整繁體中文與英文介面
- **Unit Toggle / 單位切換** — SI（公制）與 Imperial（英制）即時切換
- **Pinned Dashboard / 首頁釘選** — 常用規格釘選至個人工作區

### 〰️ Vibration Analysis Engine · 振動分析引擎
- **Auto-Feed PSD Detection / 振動自動連動** — 查閱含振動的規格時自動觸發分析引擎
- **Grms Integration / Grms 積分計算** — Log-Log 數值積分精確求取均方根加速度
- **3σ Peak / Peak Velocity / P-P Disp** — 一次計算四項衍生量值
- **Plotly Log-Log PSD Chart / 互動式頻譜圖** — 動態縮放頻譜特性圖

### 〰️ Standalone Vibration Calculator · 獨立振動計算器
- **Sine 正弦掃頻計算器**
  - 交接頻率（Crossover）自動計算：A = ω²X
  - 掃頻時間預估（依 Oct/min 與掃描次數）
  - 預設：IEC 60068-2-6 Class 1/2/3 + MIL-STD-810H Sine Basic
- **Random PSD 隨機振動計算器**
  - 即時 Grms / 3σ Peak / 峰值速度 / 峰對峰位移
  - dB/Oct 斜率自動換算
  - g²/Hz ↔ (m/s²)²/Hz 單位切換
  - 預設（10 個標準剖面）：
    - MIL-STD-810H Cat 4, Cat 20, Cat 24
    - GR-63-CORE Transportation
    - ISTA 3A, 6-Amazon OB
    - ASTM D4169 Schedule A, B
    - IEC 60068-2-64 Medium, High

### 📊 Data Visualization · 數據視覺化
- **Thermal Profiles (Chart.js)** — 溫度剖面多線動態折線圖
- **PSD Frequency Charts (Plotly)** — Log-Log 振動頻譜圖
- **Offline First / 離線優先** — Service Worker 快取所有資料庫與 CDN 函式庫

### 📱 PWA & Security · 安裝與安全
- **PWA Installable / 可安裝** — 支援 iOS / Android / Desktop 安裝至主畫面
- **Password-Protected Install / 密碼保護安裝** — 防止未授權下載桌面版

---

## 🚀 Quick Start · 快速啟動

### ▶️ 直接使用（推薦 / Recommended）
瀏覽器開啟，無需安裝：
```
https://LamChang0416.github.io/Reliability-Spec-Engine/
```
行動裝置：點選 **分享 → 加入主畫面** 以 App 方式使用。

### 💻 本地伺服器運行
```powershell
cd Reliability-Spec-Engine
python -m http.server 8080
# 開啟 http://localhost:8080
```

---

## 📂 Project Structure · 專案結構

```
Reliability-Spec-Engine/
├── index.html              # PWA 主程式（單一檔案架構）
├── manifest.json           # PWA 設定檔
├── sw.js                   # Service Worker（離線快取 v2.1）
├── icon-192.png            # App 圖示 192×192
├── icon-512.png            # App 圖示 512×512
├── mil810_database.json    # MIL-STD-810H 810H 全 Method 資料庫
├── gr63_database.json      # GR-63-CORE Issue 5 資料庫
├── astm4169_database.json  # ASTM D4169-22 資料庫
├── ista_database.json      # ISTA 1A/2A/3A/6-Amazon 資料庫
├── iec_database.json       # IEC 60721-3 資料庫
├── iec60068_database.json  # IEC 60068-2 資料庫
├── ip_code_database.json   # IEC 60529 IP Code / IP69K 資料庫
├── sr332_database.json     # Telcordia SR-332 Issue 4 資料庫
├── app.py                  # 舊版 Streamlit（已棄用，僅供參考）
└── requirements.txt        # Python 依賴（舊版 Streamlit 用）
```

---

## 📝 Version History · 版本記錄

| 版本 | 日期 | 更新內容 |
|------|------|---------|
| **v2.1** | 2026-03 | 🐛 修正 `showTab()` 無限遞迴 Bug（所有側邊欄按鈕失效修復） |
| **v2.0** | 2026-03 | ⭐ 獨立振動計算器面板（Sine/Random 雙標籤，10 個標準預設剖面） |
| **v1.9** | 2026-03 | 修正 Cat 20 Ground Vehicle PSD 剖面及振動偵測邏輯 |
| **v1.8** | 2026-03 | 振動偵測 Hotfix（空格欄位名稱 'G RMS' 比對修正） |
| **v1.7** | 2026-03 | 振動分析自動連動引擎（Plotly PSD 圖、Grms 積分、公式演算） |
| **v1.6** | 2026-03 | Pill 切換按鈕 UI、PWA 密碼保護安裝（密碼：Lam0416） |
| **v1.5** | 2026-03 | 多線熱分布 Chart.js 圖表；IEC 60068 全 Method 資料庫 |
| **v1.4** | 2026-03 | 儀表板釘選功能；左側導覽側邊欄；IP69K 8-in-1 PWA |
| **v1.3** | 2026-03 | IP Code (IEC 60529) 模組；IP 等級查詢與 IP69K 特殊支援 |
| **v1.2** | 2026-03 | IEC 60068-2 模組（7 合一）；Lam 作者標示 |
| **v1.1** | 2026-03 | ISTA 模組（1A/2A/3A/6-Amazon）；SR-332 Issue 4 |
| **v1.0** | 2026-03 | PWA 首版發布；MIL-810H、GR-63 Issue 5、ASTM D4169-22 |
| v0.9 | 2025 | 初始 Streamlit 原型（IEC 60721-3 AutoSpec） |

---

## 🛠️ Tech Stack · 技術選型

| 技術 | 用途 |
|------|------|
| HTML5 / Vanilla JS / CSS3 | 核心架構（零框架，最高相容性） |
| [Plotly.js 2.27](https://plotly.com/javascript/) | 振動 PSD Log-Log 互動頻譜圖 |
| [Chart.js](https://www.chartjs.org/) | 熱分布 / 溫度剖面折線圖 |
| Service Worker (Cache-First) | PWA 離線快取 |
| localStorage | 儀表板釘選記憶 |
| Google Fonts (Inter) | 字型 |

---

## 👨‍🔧 Author · 作者

**Lam** — Reliability Engineer  
[GitHub](https://github.com/LamChang0416)

---

> ⚠️ **Disclaimer / 免責聲明**: ASTM D4169-22、GR-63 Issue 5 等為商業規範，本工具資料庫內容依公開技術摘要整理。完整規範請向各發行單位購買正版文件。