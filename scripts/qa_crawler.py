import json
import random
import time
from playwright.sync_api import sync_playwright

def run_qa():
    results = []
    standards = [
        ('iec', '#tabIEC'),
        ('mil', '#tabMIL'),
        ('astm', '#tabASTM'),
        ('gr63', '#tabGR63'),
        ('sr332', '#tabSR332'),
        ('ista', '#tabISTA'),
        ('iec60068', '#tabIEC60068'),
        ('ip', '#tabIP')
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        errors = []
        def handle_console(msg):
            if msg.type == "error":
                errors.append(msg.text)
        
        page.on("console", handle_console)
        page.on("pageerror", lambda err: errors.append(str(err)))

        print("Navigating to app...")
        page.goto("http://localhost:8000")
        page.wait_for_load_state("networkidle")
        
        # Wait a bit for DB to load
        time.sleep(2)
        
        print("Starting 50 iterations...")
        for i in range(50):
            std, tab_sel = random.choice(standards)
            errors.clear()
            
            try:
                # 1. Click Tab
                page.click(tab_sel)
                time.sleep(0.2)
                
                # 2. Select L1
                l1_sel = f"#{std}-l1"
                page.wait_for_selector(l1_sel)
                options_l1 = page.locator(f"{l1_sel} option").all_inner_texts()
                valid_l1 = [o for o in options_l1 if "-- Select --" not in o and o.strip() != ""]
                if not valid_l1:
                    results.append({"iter": i+1, "std": std, "status": "skipped", "reason": "No L1 options"})
                    continue
                
                choice_l1 = random.choice(valid_l1)
                page.select_option(l1_sel, label=choice_l1)
                time.sleep(0.2)
                
                # 3. Select L2
                l2_sel = f"#{std}-l2"
                page.wait_for_selector(l2_sel)
                options_l2 = page.locator(f"{l2_sel} option").all_inner_texts()
                valid_l2 = [o for o in options_l2 if "-- Select --" not in o and o.strip() != ""]
                if not valid_l2:
                    results.append({"iter": i+1, "std": std, "status": "skipped", "reason": "No L2 options"})
                    continue
                
                choice_l2 = random.choice(valid_l2)
                page.select_option(l2_sel, label=choice_l2)
                time.sleep(0.2)
                
                # 4. Select L3
                l3_sel = f"#{std}-l3"
                page.wait_for_selector(l3_sel)
                options_l3 = page.locator(f"{l3_sel} option").all_inner_texts()
                valid_l3 = [o for o in options_l3 if "-- Select --" not in o and o.strip() != ""]
                if not valid_l3:
                    results.append({"iter": i+1, "std": std, "status": "skipped", "reason": "No L3 options"})
                    continue
                
                choice_l3 = random.choice(valid_l3)
                page.select_option(l3_sel, label=choice_l3)
                
                # 5. Wait for result to render
                time.sleep(0.5)
                
                # Check if rendered successfully
                result_sel = f"#{std}-result"
                result_html = page.inner_html(result_sel)
                
                has_error = len(errors) > 0
                is_empty = "class=\"empty\"" in result_html
                
                if has_error or is_empty:
                    status = "error"
                else:
                    status = "success"
                
                results.append({
                    "iter": i+1,
                    "std": std,
                    "combo": f"{choice_l1} > {choice_l2} > {choice_l3}",
                    "status": status,
                    "errors": list(errors),
                    "is_empty": is_empty
                })
                
                print(f"[{i+1}/50] {std.upper()}: {choice_l1[:10]}... > {choice_l2[:10]}... > {choice_l3[:10]}... -> {status}")
                
            except Exception as e:
                results.append({
                    "iter": i+1,
                    "std": std,
                    "status": "exception",
                    "error": str(e)
                })
                print(f"[{i+1}/50] {std.upper()} -> EXCEPTION: {e}")

        browser.close()
        
    with open("docs/spec_reports/qa_50_iterations.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print("Saved QA report to docs/spec_reports/qa_50_iterations.json")

if __name__ == "__main__":
    run_qa()
