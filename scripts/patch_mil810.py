import json
import time
import re
from google import genai

print("正在連線至 CLIProxyAPI (Gemini 2.5 Flash)...")
client = genai.Client(
    api_key='sk-cliproxy',
    http_options={'base_url': 'http://127.0.0.1:8317'}
)

def load_data():
    with open("mil810_database.json", "r", encoding="utf-8") as f:
        old_db = json.load(f)
    with open("mil810_audit_report.md", "r", encoding="utf-8") as f:
        audit_report = f.read()
    return old_db, audit_report

def extract_audit_text(report, method_name, proc_name, config_name):
    # This is a simple regex extraction. The report uses headers like:
    # ## Method 501.7 - High Temperature
    # ### Procedure I - Storage - Basic Hot (A2)
    header = f"### {proc_name} - {config_name}"
    idx = report.find(header)
    if idx == -1: return ""
    end_idx = report.find("---", idx)
    if end_idx == -1: end_idx = len(report)
    return report[idx:end_idx].strip()

def patch():
    old_db, audit_report = load_data()
    methods = [k for k in old_db.keys() if k != "_meta"]
    
    total_patched = 0
    for method_name in methods:
        procedures = old_db[method_name]
        for proc_name, configurations in procedures.items():
            if proc_name in ["parameters", "tests"]: continue
                
            for config_name, details in configurations.items():
                if config_name in ["parameters", "tests"]:
                    details = configurations
                    config_name = "General"
                    if "parameters" not in details: break
                
                audit_text = extract_audit_text(audit_report, method_name, proc_name, config_name)
                if not audit_text or "❌" not in audit_text and "⚠️" not in audit_text:
                    continue # Skip if no errors or missing items found
                
                print(f"正在修補: {method_name} -> {proc_name} -> {config_name}")
                json_data = json.dumps(details, ensure_ascii=False, indent=2)
                
                prompt = f"""你是一個資深的資料庫工程師。
這是一份不完整的舊版測試參數 JSON：
```json
{json_data}
```

這是一份針對它的稽核報告，指出了裡面的數值錯誤與遺漏的參數：
{audit_text}

請你根據稽核報告的建議，直接「修正」與「補充」這份 JSON。
要求：
1. 若有遺漏參數 (例如 Rate of Change, Humidity, Duration 等)，請新增至 `parameters` 字典中。
2. 若有遺漏測試步驟 (例如 Stabilization, Post-Test Examination 等)，請新增至 `tests` 陣列中。
3. 若有數值錯誤，請直接覆蓋為正確數值。
4. 回傳格式「必須」是純 JSON，包含 `parameters` 和 `tests` 兩個 key，**不要**包含 Markdown 標籤 (例如 ```json )，只需回傳合法的 JSON 字串。
"""
                
                success = False
                for attempt in range(3):
                    try:
                        response = client.models.generate_content(
                            model='gemini-2.5-flash',
                            contents=prompt
                        )
                        raw_json = response.text.strip()
                        if raw_json.startswith("```json"):
                            raw_json = raw_json[7:]
                        if raw_json.endswith("```"):
                            raw_json = raw_json[:-3]
                            
                        patched_data = json.loads(raw_json)
                        
                        # Apply patch
                        if config_name == "General":
                            old_db[method_name][proc_name] = patched_data
                        else:
                            old_db[method_name][proc_name][config_name] = patched_data
                        
                        success = True
                        total_patched += 1
                        break
                    except Exception as e:
                        print(f"  [API或解析異常] {e}，重試中...")
                        time.sleep(2)
                
                if not success:
                    print(f"  [跳過] {proc_name} - {config_name} 修補失敗。")
                time.sleep(0.5)

    print(f"\n自動修補完成！共修補了 {total_patched} 個配置。")
    with open("mil810_database_patched.json", "w", encoding="utf-8") as f:
        json.dump(old_db, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    patch()
