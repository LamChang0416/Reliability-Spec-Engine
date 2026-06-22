import os
import time
import io
import fitz  # PyMuPDF
from PIL import Image
from google import genai

print("[SUCCESS] 成功連線至本機 CLIProxyAPI 伺服器，將使用您的 Gemini Pro 付費配額進行高速解析！")

# 指向本機的 Proxy 伺服器
client = genai.Client(
    api_key='sk-cliproxy',
    http_options={'base_url': 'http://127.0.0.1:8317'}
)

PDF_PATH = "standard/mil-std-810h .pdf"
OUTPUT_DIR = "data_output/parsed_pages"
os.makedirs(OUTPUT_DIR, exist_ok=True)

PROMPT = """
You are an expert military engineering document parser.
Extract the entire text from this page of MIL-STD-810H.
Please strictly follow these rules:
1. Preserve all structural headers (e.g., #, ##, ###).
2. If there is a table, output it perfectly formatted as a Markdown table.
3. Extract any mathematical formulas or variables correctly.
4. Do NOT add any conversational filler. ONLY output the extracted Markdown content.
"""

def process_pdf():
    print(f"正在讀取 PDF: {PDF_PATH}")
    try:
        doc = fitz.open(PDF_PATH)
    except Exception as e:
        print(f"無法開啟 PDF: {e}")
        return

    total_pages = len(doc)
    print(f"共計 {total_pages} 頁。開始進行解析...")

    for page_num in range(total_pages):
        page_str = f"page_{page_num + 1:04d}"
        output_filepath = os.path.join(OUTPUT_DIR, f"{page_str}.md")

        if os.path.exists(output_filepath):
            print(f"[{page_num + 1}/{total_pages}] {page_str}.md 已存在，跳過。")
            continue

        print(f"[{page_num + 1}/{total_pages}] 正在解析 {page_str}...")

        try:
            page = doc.load_page(page_num)
            pix = page.get_pixmap(dpi=150)
            img_bytes = pix.tobytes("png")
            pil_img = Image.open(io.BytesIO(img_bytes))

            # 直接呼叫 API，因為走的是付費配額，我們只需要一個簡單的容錯機制
            success = False
            for attempt in range(3):
                try:
                    response = client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=[PROMPT, pil_img]
                    )
                    success = True
                    break
                except Exception as api_e:
                    print(f"  [API 暫時異常] {api_e}，2秒後重試...")
                    time.sleep(2)
            
            if not success:
                print("連續 3 次失敗，暫停執行。")
                break

            with open(output_filepath, "w", encoding="utf-8") as f:
                f.write(response.text)
                
            print(f"  成功儲存: {output_filepath}")
            # 由於我們現在是付費專屬配額，大幅縮減等待時間，加速轉檔
            time.sleep(0.5)

        except Exception as e:
            print(f"  處理第 {page_num + 1} 頁時發生未預期錯誤：{e}")
            break

if __name__ == "__main__":
    process_pdf()
