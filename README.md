# 🛡️ Reliability Spec Engine

> **四合一可靠度規範查詢工具 · Four-in-One Reliability Standards Reference**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen?logo=github)](https://lamchang0416.github.io/Reliability-Spec-Engine/)
[![PWA](https://img.shields.io/badge/PWA-Installable-blue?logo=pwa)](https://lamchang0416.github.io/Reliability-Spec-Engine/)
[![Standards](https://img.shields.io/badge/Standards-4%20in%201-orange)](https://github.com/LamChang0416/Reliability-Spec-Engine)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📖 Overview · 專案簡介

**English** | A PWA-based engineering tool that consolidates four major reliability and environmental test standards into a single, mobile-friendly reference. Search across all standards, view test parameters, and export data for your test plans — all available **offline** after first load.

**繁體中文** | 一套將四大可靠度與環境測試規範整合於單一介面的 PWA 工具。支援跨規範關鍵字搜尋、測試參數查閱與資料匯出，首次載入後**完整支援離線使用**，可安裝至手機主畫面。

---

## 📋 Standards Covered · 涵蓋規範

| 規範 | 版本 | 用途 | 官方連結 |
|------|------|------|----------|
| 🎖️ **MIL-STD-810H** | 2019 (810G→H 升版) | 軍規環境工程測試 / Military environmental testing | [DLA QuickSearch](https://quicksearch.dla.mil/qsDocDetails.aspx?ident_number=36026) |
| 🏢 **GR-63-CORE Issue 5** | 2022 (Issue 4→5 升版) | 電信機房 NEBS 規範 / Telecom CO physical protection | [Ericsson NEBS](https://telecom-info.njdepot.ericsson.se/site-cgi/ido/docs.cgi?action=get&docno=GR-63-CORE) |
| 📦 **ASTM D4169-22** | 2022 (-09→-22 升版) | 包裝運輸性能測試 / Packaging & transport performance | [ASTM International](https://www.astm.org/d4169-22.html) |
| 🛡️ **IEC 60721-3** | 2019 | 環境條件分類 / Environmental condition classification | [IEC Webstore](https://webstore.iec.ch/publication/60947) |

---

## ✨ Features · 主要功能

- 🔍 **Cross-Standard Search / 跨規範搜尋** — Type once, search across all four databases simultaneously
- 📊 **Metric Card Display / 參數卡片展示** — Key values (temperature, g-level, duration) highlighted clearly
- 📥 **Export JSON & CSV / 資料匯出** — One-click export for test plan documentation
- 🌐 **Bilingual ZH/EN / 中英文切換** — Full interface in Traditional Chinese and English
- ✈️ **Offline Support / 離線查閱** — Service Worker caches all databases; works without internet
- 📱 **PWA Installable / 可安裝至主畫面** — Add to iOS/Android home screen for native app experience
- 🔖 **Source Links / 規範來源連結** — Direct links to official standard publishers

---

## 🚀 Quick Start · 快速啟動

### Option A — GitHub Pages (Recommended / 推薦)
Just open in any browser — no installation needed:
```
https://lamchang0416.github.io/Reliability-Spec-Engine/
```
On mobile: tap **Share → Add to Home Screen** to install as an app.

### Option B — Run Locally (Streamlit)
```powershell
cd Reliability-Spec-Engine
pip install -r requirements.txt
streamlit run app.py
```

### Option C — Serve PWA Locally
```powershell
cd Reliability-Spec-Engine
python -m http.server 8080
# Open http://localhost:8080
```

---

## 📂 Project Structure · 專案結構

```
Reliability-Spec-Engine/
├── index.html              # PWA main app (single-file)
├── manifest.json           # PWA configuration
├── sw.js                   # Service Worker (offline cache)
├── icon-192.png            # App icon 192×192
├── icon-512.png            # App icon 512×512
├── app.py                  # Streamlit version
├── requirements.txt        # Python dependencies
├── mil810_database.json    # MIL-STD-810H database
├── gr63_database.json      # GR-63 Issue 5 database
├── astm4169_database.json  # ASTM D4169-22 database
└── iec_database.json       # IEC 60721-3 database
```

---

## 📝 Version History · 版本記錄

| Date | Change |
|------|--------|
| 2026-03 | PWA 版本發布；MIL-STD-810H 升版（29 個 Method，新增 529.1）|
| 2026-03 | GR-63 Issue 5 升版（Zone 4 地震值 0.5g→1.0g；ASHRAE A3/A4）|
| 2026-03 | ASTM D4169-22 升版（新 Schedule C 電商場景）|
| 2026-03 | Streamlit 版 UI 現代化（深藍漸層、Metric Cards）|
| 2025   | 初始版本（IEC 60721 AutoSpec Engine）|

---

## 👨‍🔧 Author · 作者

**LamChang0416** — Reliability Engineer  
[GitHub](https://github.com/LamChang0416)

---

> ⚠️ **Disclaimer**: ASTM D4169-22 and GR-63 Issue 5 are commercial standards. Database entries are based on publicly available summaries. For complete specifications, please purchase from the respective publishers.