import json
import time
from playwright.sync_api import sync_playwright

def run_exhaustive_qa():
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
            if msg.type in ("error", "warning"):
                errors.append(f"[{msg.type.upper()}] {msg.text}")
        
        page.on("console", handle_console)
        page.on("pageerror", lambda err: errors.append(f"[PAGE_ERROR] {str(err)}"))

        print("Navigating to app...")
        page.goto("http://localhost:8000")
        page.wait_for_load_state("networkidle")
        time.sleep(2) # wait for all DBs to load
        
        print("Starting EXHAUSTIVE iterations...")
        total_tested = 0

        for std, tab_sel in standards:
            print(f"--- Scanning Standard: {std.upper()} ---")
            try:
                page.click(tab_sel)
                time.sleep(0.5)
                
                l1_sel = f"#{std}-l1"
                page.wait_for_selector(l1_sel)
                l1_options = page.locator(f"{l1_sel} option").all_inner_texts()
                valid_l1 = [o for o in l1_options if "-- Select --" not in o and o.strip() != ""]
                
                for choice_l1 in valid_l1:
                    page.select_option(l1_sel, label=choice_l1)
                    time.sleep(0.2)
                    
                    l2_sel = f"#{std}-l2"
                    page.wait_for_selector(l2_sel)
                    l2_options = page.locator(f"{l2_sel} option").all_inner_texts()
                    valid_l2 = [o for o in l2_options if "-- Select --" not in o and o.strip() != ""]
                    
                    for choice_l2 in valid_l2:
                        page.select_option(l2_sel, label=choice_l2)
                        time.sleep(0.2)
                        
                        l3_sel = f"#{std}-l3"
                        page.wait_for_selector(l3_sel)
                        l3_options = page.locator(f"{l3_sel} option").all_inner_texts()
                        valid_l3 = [o for o in l3_options if "-- Select --" not in o and o.strip() != ""]
                        
                        for choice_l3 in valid_l3:
                            errors.clear()
                            
                            try:
                                page.select_option(l3_sel, label=choice_l3)
                                time.sleep(0.2) # wait for result render
                                
                                result_sel = f"#{std}-result"
                                result_html = page.inner_html(result_sel)
                                
                                has_error = len([e for e in errors if "[ERROR]" in e or "[PAGE_ERROR]" in e]) > 0
                                is_empty = "class=\"empty\"" in result_html
                                
                                status = "error" if (has_error or is_empty) else "success"
                                total_tested += 1
                                
                                results.append({
                                    "iter": total_tested,
                                    "std": std,
                                    "combo": f"{choice_l1} > {choice_l2} > {choice_l3}",
                                    "status": status,
                                    "errors": list(errors),
                                    "is_empty": is_empty
                                })
                                
                                if status == "error":
                                    print(f"  [X] {choice_l1[:15]} > {choice_l2[:15]} > {choice_l3[:15]} -> ERROR!")
                                else:
                                    # print success only sparingly or just a dot
                                    pass
                            except Exception as e:
                                results.append({
                                    "iter": total_tested,
                                    "std": std,
                                    "combo": f"{choice_l1} > {choice_l2} > {choice_l3}",
                                    "status": "exception",
                                    "error": str(e)
                                })
                                print(f"  [!] Exception at {choice_l3[:15]}: {e}")

            except Exception as std_e:
                print(f"Error scanning standard {std}: {std_e}")
                
        browser.close()
        
    with open("docs/spec_reports/exhaustive_qa_report.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\nExhaustive QA finished. Total combinations tested: {total_tested}")
    print("Saved QA report to docs/spec_reports/exhaustive_qa_report.json")
    
    error_count = sum(1 for r in results if r["status"] != "success")
    print(f"Found {error_count} errors across {total_tested} combinations.")

if __name__ == "__main__":
    run_exhaustive_qa()
