import os
import glob
import json
from sentence_transformers import SentenceTransformer

def chunk_text(text, max_chars=800):
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        if len(current_chunk) + len(p) > max_chars:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = p + "\n\n"
        else:
            current_chunk += p + "\n\n"
    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks

def build_vector_db():
    print("載入本地 embedding 模型 (all-MiniLM-L6-v2)...")
    # This model outputs 384-dimensional vectors, perfect for browser JS
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    parsed_dir = "data_output/parsed_pages"
    md_files = sorted(glob.glob(os.path.join(parsed_dir, "*.md")))
    
    print(f"找到 {len(md_files)} 個 Markdown 檔案。")
    
    db_data = []
    
    for filepath in md_files:
        filename = os.path.basename(filepath)
        page_id = filename.replace(".md", "")
        
        with open(filepath, "r", encoding="utf-8") as f:
            text = f.read()
            
        chunks = chunk_text(text)
        
        for i, chunk in enumerate(chunks):
            # Skip very short useless chunks
            if len(chunk) < 20:
                continue
                
            chunk_id = f"{page_id}_{i:03d}"
            
            db_data.append({
                "id": chunk_id,
                "text": chunk,
                "metadata": {
                    "document": "MIL-STD-810H",
                    "page": page_id
                },
                # We will compute embeddings in batch for speed
            })
            
        print(f"處理完成: {page_id} ({len(chunks)} 個 chunks)")
    
    print(f"總共產生了 {len(db_data)} 個 chunks。開始計算 Embeddings...")
    
    # Compute embeddings in batch
    texts = [item["text"] for item in db_data]
    embeddings = model.encode(texts, batch_size=32, show_progress_bar=True)
    
    # Convert numpy arrays to lists for JSON serialization
    for i in range(len(db_data)):
        # Round to 5 decimal places to save JSON size
        db_data[i]["embedding"] = [round(float(x), 5) for x in embeddings[i]]
        
    output_file = "data_output/vector_db.json"
    print(f"寫入 {output_file} ...")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(db_data, f, ensure_ascii=False, separators=(',', ':'))
        
    # Check file size
    size_mb = os.path.getsize(output_file) / (1024 * 1024)
    print(f"完成！資料庫大小: {size_mb:.2f} MB")

if __name__ == "__main__":
    build_vector_db()
