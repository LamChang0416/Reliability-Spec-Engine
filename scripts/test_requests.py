import os
import requests
from dotenv import load_dotenv

load_dotenv("ailam_api.env")
api_key = os.getenv("GEMINI_API_KEY")

url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={api_key}"
data = {
    "model": "models/text-embedding-004",
    "content": {
        "parts": [{"text": "Hello world"}]
    }
}
response = requests.post(url, json=data)
print("Status:", response.status_code)
print("Response:", response.json())
