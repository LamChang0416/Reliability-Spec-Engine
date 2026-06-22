import os
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from google import genai
import time

print("正在載入本地 Embedding 模型 (all-MiniLM-L6-v2)...")
embed_model = SentenceTransformer('all-MiniLM-L6-v2')

print("正在連線至 CLIProxyAPI (Gemini 2.5 Flash)...")
client = genai.Client(
    api_key='sk-cliproxy',
    http_options={'base_url': 'http://127.0.0.1:8317'}
)

def cos_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def load_data():
    with open("mil810_database.json", "r", encoding="utf-8") as f:
        old_db = json.load(f)
        
    print("正在讀取 vector_db.json...")
    with open("data_output/vector_db.json", "r", encoding="utf-8") as f:
        vector_db = json.load(f)
        
    return old_db, vector_db

def audit():
    old_db, vector_db = load_data()
    
    report_path = "mil810_audit_report.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# MIL-STD-810H 自動化規格稽核報告\n\n")
        f.write("> 這是由 AI 自動透過 RAG 交叉比對舊版 JSON 與官方 Markdown 原文產生的稽核報告。\n\n")

    # Filter vector DB for MIL-STD-810H
    mil810_chunks = [item for item in vector_db if item["metadata"].get("document") == "MIL-STD-810H"]

    methods = [k for k in old_db.keys() if k != "_meta"]
    
    for method_name in methods:
        print(f"\n--- 正在稽核: {method_name} ---")
        procedures = old_db[method_name]
        
        for proc_name, configurations in procedures.items():
            if proc_name in ["parameters", "tests"]: 
                continue # Edge case for un-nested items
                
            for config_name, details in configurations.items():
                if config_name in ["parameters", "tests"]:
                    details = configurations
                    config_name = "General"
                    if "parameters" not in details: break
                
                print(f"  > 比對項目: {proc_name} - {config_name}")
                
                query = f"{method_name} {proc_name} {config_name}"
                query_vec = embed_model.encode(query)
                
                # 尋找最相關的 10 個 chunk
                scores = []
                for chunk in mil810_chunks:
                    score = cos_sim(query_vec, chunk["embedding"])
                    scores.append((score, chunk))
                
                scores.sort(key=lambda x: x[0], reverse=True)
                top_chunks = [x[1] for x in scores[:10]]
                
                context_text = "\n\n".join([f"[來自 {c['metadata']['page']}]:\n{c['text']}" for c in top_chunks])
                
                json_data = json.dumps(details, ensure_ascii=False, indent=2)
                
                prompt = f"""你是一位嚴謹的軍用規格稽核員。
我們手上有兩個資料：
1. 這是我們手動整理好的 JSON 參數 (舊版資料)：
```json
{json_data}
```

2. 這是我們剛從最新版官方文件 MIL-STD-810H 解析出來的原始條文 (Top 10 最相關片段)：
```markdown
{context_text}
```

請你詳細交叉比對這兩份資料：
1. **檢查數值與參數**：JSON 裡面寫的溫度、時間、壓力、濕度等數值，跟官方原文是否吻合？
2. **檢查遺漏**：官方原文中是否有提到重要的必測參數或條件，卻沒有被寫進我們的 JSON 中？

請產出一小段報告，若一切吻合請回報「✅ 無遺漏或錯誤」。若有發現差異或遺漏，請明確列出 (例如: "❌ 溫度應該是 71°C，但 JSON 寫 70°C" 或是 "⚠️ 遺漏了濕度要求 95% RH")。
請用繁體中文回答，不需要說廢話，直接給結論清單。
"""

                success = False
                for attempt in range(3):
                    try:
                        response = client.models.generate_content(
                            model='gemini-2.5-flash',
                            contents=prompt
                        )
                        success = True
                        break
                    except Exception as e:
                        print(f"  [API 暫時異常] {e}，重試中...")
                        time.sleep(2)

                if success:
                    with open(report_path, "a", encoding="utf-8") as f:
                        f.write(f"## {method_name}\n")
                        f.write(f"### {proc_name} - {config_name}\n")
                        f.write(response.text + "\n\n---\n\n")
                else:
                    print(f"  [跳過] {proc_name} - {config_name} API 持續失敗。")
                    
                time.sleep(0.5)

    print(f"稽核完成！報告已儲存至 {report_path}")

if __name__ == "__main__":
    audit()
