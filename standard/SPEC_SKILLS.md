---
name: SPEC_SKILLS
description: Standard operating procedure for updating, optimizing, or extracting standards into the JSON databases for the Reliability Spec Engine project.
---

# Reliability Spec Engine - Database Update Workflow

When the USER requests an update, optimization, or check of a testing standard (e.g., MIL-STD-810H, GR-63-CORE, etc.) for this project, you MUST strictly follow this multi-stage workflow to ensure accuracy, maintain project cleanliness, and guarantee UI updates.

## 1. Preparation & Staging
- **Locate the PDF Standard**: The reference documents are typically placed in the `standard/` directory (e.g., `standard/mil-std-810h .pdf`).
- **Divide and Conquer (Max 50 Pages)**: Never try to parse or verify the entire standard in one go. Divide the requested sections into manageable "Stages", with a STRICT limit of maximum 50 pages per stage. This is mandatory to prevent the AI from losing focus and guaranteeing 100% accuracy on fine details.
- **Target JSON Database**: Identify the corresponding JSON database in the root folder (e.g., `mil810_database.json`).

## 2. Stage Execution Loop
For each stage, execute the following steps completely before moving to the next:
1. **Extraction Script**: Write a temporary Python script (using `fitz` / `PyMuPDF`) to extract the exact text for the current stage's methods from the PDF. Run these scripts from a temporary/scratch directory.
2. **AI Internal Memory Scratchpad**: After reading the extracted text, immediately create or update a temporary Markdown file (e.g., `ai_memory_scratchpad.md`). Use this file to record and structure the fine details, procedures, conditions, and tables you just read. This acts as your own cognitive memory bank to query against, ensuring accuracy is always prioritized over speed.
3. **Analysis**: Analyze the existing JSON database and compare it against your internal memory scratchpad and extracted text to identify missing "Procedures", "Categories", or "Conditions".
4. **Checklist Generation**: Create a Markdown checklist (as an Artifact or temporary file) detailing what is currently covered and what missing items were identified.
5. **Patch Script**: Write a temporary Python script to cleanly inject the missing data into the target JSON database. Do not use string replacement or manual editing for large JSONs.
6. **Continuous Execution**: Proceed directly to the next stage automatically after patching, unless the user explicitly asks to review each stage.

## 3. PWA Service Worker Cache Bump (CRITICAL)
- This project is a Progressive Web App (PWA). If you update ANY `.json` database file, you **MUST** update `sw.js`.
- Open `sw.js` and increment the `CACHE_NAME` version string (e.g., change `reliability-spec-v3.1` to `reliability-spec-v3.2`).
- **Why?** Failure to do this will result in the user's browser continuing to load the old cached database, leading to discrepancies and confusion.

## 4. Cleanup & Version Control
- **No Stray Files**: Temporary extraction scripts (e.g., `temp_parse.py`) and raw intermediate logs should be cleaned up.
- **Retain Detailed Parsed Markdown Files Permanently (CRITICAL)**: As per USER's mandate, every specification must be parsed in full detail (page-by-page or section-by-section) into `.md` files. **These parsed `.md` files MUST be permanently saved in the workspace** (e.g., in a `data_output/parsed_pages/` folder). Do NOT delete them. They serve as the definitive source of truth and eliminate the need to re-parse the heavy PDFs.
- **Vector DB RAG Integration**: After parsing a new specification into `.md` files, you must build or update the local `vector_db.json` using `sentence-transformers` to enable AI RAG search for the frontend.
- **Git Commit**: Stage the parsed `.md` files, `vector_db.json`, `.json` databases, `sw.js`, and `README.md`. Commit the changes and push them to the `main` branch. (Note: The original raw `.pdf` files should NOT be committed).

## 5. Multi-File Standards Handling (e.g., IEC 60721)
When dealing with a standard that is split across multiple PDF files (e.g., `60721-3-1.pdf`, `60721-3-2.pdf`), you must apply the following strategies:
1. **Master Index Generation**: Before extraction, scan the `standard/` directory, identify all related PDFs, and create a temporary `master_index.md`. Read the intro of each PDF to map what environmental section it covers (e.g., Storage, Transportation).
2. **Volume-Based Staging**: Treat each PDF as a separate volume. You MUST still strictly apply the 50-page maximum limit per stage *within* each PDF.
3. **Hierarchical Memory Scratchpad**: Consolidate your memory across multiple PDFs into a single, unified `ai_memory_scratchpad.md` using hierarchical markdown headers (e.g., `## Part 3-1: Storage`, `## Part 3-2: Transportation`). This maintains a global context for the final JSON structure.


