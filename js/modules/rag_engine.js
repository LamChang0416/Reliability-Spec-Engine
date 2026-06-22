import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';

// Configuration
env.allowLocalModels = false; // We use Hugging Face remote models in browser

let extractor = null;
let vectorDb = null;
let isInitializing = false;

// Helpers
function cos_sim(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for(let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function initRagEngine() {
    if(isInitializing) return;
    
    const apiKey = document.getElementById("ragApiKey").value.trim();
    if(!apiKey) {
        alert("請先輸入您的 Gemini API Key！");
        return;
    }
    
    isInitializing = true;
    const statusText = document.getElementById("ragStatusText");
    const initBtn = document.getElementById("ragInitBtn");
    
    try {
        statusText.innerText = "⏳ 正在載入 AI 向量庫 (約 20MB)...";
        statusText.style.color = "var(--blue)";
        initBtn.disabled = true;
        
        // Load Vector DB
        const res = await fetch("data_output/vector_db.json");
        if(!res.ok) throw new Error("找不到 vector_db.json，請確認本地已經生成完成！");
        vectorDb = await res.json();
        
        statusText.innerText = "⏳ 載入瀏覽器 AI 語意引擎...";
        
        // Load Transformers.js model
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
            progress_callback: (x) => {
                if(x.status === 'progress') {
                    statusText.innerText = `⏳ 下載模型權重... ${Math.round(x.progress)}%`;
                }
            }
        });
        
        statusText.innerText = "✅ 引擎啟動完成！(就緒)";
        statusText.style.color = "var(--green)";
        document.getElementById("ragQueryInput").disabled = false;
        document.getElementById("ragSendBtn").disabled = false;
        
        addChatMessage("system", "✅ AI 查規助理啟動成功！請輸入您想查詢的規範問題。");
        
    } catch(err) {
        console.error(err);
        statusText.innerText = "❌ 啟動失敗：" + err.message;
        statusText.style.color = "#fc8181";
    } finally {
        isInitializing = false;
        initBtn.disabled = false;
    }
}

export async function askQuestion() {
    const inputEl = document.getElementById("ragQueryInput");
    const query = inputEl.value.trim();
    if(!query || !vectorDb || !extractor) return;
    
    inputEl.value = "";
    addChatMessage("user", query);
    
    const namespace = document.getElementById("ragNamespace").value;
    const apiKey = document.getElementById("ragApiKey").value.trim();
    
    // Add loading message
    const msgId = "msg-" + Date.now();
    addChatMessage("system", "🔍 正在檢索軍規資料庫並計算向量...", msgId);
    
    try {
        // 1. Embed user query using Transformers.js
        const output = await extractor(query, { pooling: 'mean', normalize: true });
        const queryEmbedding = Array.from(output.data);
        
        // 2. Filter DB by namespace
        const filteredDb = namespace === "ALL" 
            ? vectorDb 
            : vectorDb.filter(item => item.metadata.document === namespace);
            
        // 3. Compute Cosine Similarity
        document.getElementById(msgId).innerHTML = "🧠 正在閱讀與分析相關條文...";
        
        let results = [];
        for(let item of filteredDb) {
            const score = cos_sim(queryEmbedding, item.embedding);
            results.push({ score, text: item.text, metadata: item.metadata });
        }
        
        // 4. Sort and get Top-5 chunks
        results.sort((a, b) => b.score - a.score);
        const topChunks = results.slice(0, 5);
        
        // Build prompt context
        let contextText = "以下是從軍規標準中擷取的相關條文：\n\n";
        topChunks.forEach((c, idx) => {
            contextText += `--- 引用來源: ${c.metadata.document} (${c.metadata.page}) [相似度: ${(c.score*100).toFixed(1)}%] ---\n`;
            contextText += c.text + "\n\n";
        });
        
        const prompt = `你是一個專業的可靠度工程師。請根據以下軍規標準條文回答問題。
如果給定的條文中找不到答案，請回答「在給定的規範片段中未提及」。不要自己捏造數字。
回覆請使用 Markdown 格式排版，並盡量用繁體中文回答。

${contextText}

使用者問題：${query}`;

        // 5. Call Gemini API
        document.getElementById(msgId).innerHTML = "✨ Gemini 正在撰寫最終解答...";
        
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const geminiRes = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.2 }
            })
        });
        
        const geminiData = await geminiRes.json();
        
        if(!geminiRes.ok) {
            throw new Error(geminiData.error?.message || "API 呼叫失敗");
        }
        
        const answerText = geminiData.candidates[0].content.parts[0].text;
        
        // Replace loading message with answer + citations
        let finalHtml = `<div>${parseMarkdown(answerText)}</div>`;
        finalHtml += `<div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(99,179,237,.2);font-size:11px;color:var(--dim);">`;
        finalHtml += `<b>🔍 參考資料來源：</b><br>`;
        topChunks.forEach(c => {
            finalHtml += `• ${c.metadata.document} (Page ${c.metadata.page.replace('page_','')})<br>`;
        });
        finalHtml += `</div>`;
        
        document.getElementById(msgId).innerHTML = finalHtml;
        
    } catch(err) {
        console.error(err);
        document.getElementById(msgId).innerHTML = "❌ 發生錯誤：" + err.message;
    }
}

function addChatMessage(role, text, id = null) {
    const area = document.getElementById("ragChatArea");
    const div = document.createElement("div");
    if(id) div.id = id;
    
    div.style.padding = "10px 14px";
    div.style.borderRadius = "8px";
    div.style.fontSize = "13px";
    div.style.lineHeight = "1.5";
    div.style.maxWidth = "85%";
    
    if(role === "user") {
        div.style.background = "rgba(99,179,237,.2)";
        div.style.border = "1px solid rgba(99,179,237,.4)";
        div.style.color = "var(--blue3)";
        div.style.alignSelf = "flex-end";
        div.innerText = text;
    } else {
        div.style.background = "rgba(13,27,62,.8)";
        div.style.border = "1px solid rgba(99,179,237,.15)";
        div.style.color = "var(--text)";
        div.style.alignSelf = "flex-start";
        div.innerHTML = text; // allow HTML for loading animation & markdown
    }
    
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
}

export function saveApiKey() {
    const key = document.getElementById("ragApiKey").value;
    localStorage.setItem("ragGeminiKey", key);
}

export function loadApiKey() {
    const key = localStorage.getItem("ragGeminiKey");
    if(key) {
        document.getElementById("ragApiKey").value = key;
    }
}

// Very simple markdown to HTML parser for the answer
function parseMarkdown(md) {
    let html = md.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
    html = html.replace(/\n\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');
    return html;
}
