import os
import sys
from dotenv import load_dotenv
from google import genai

load_dotenv("ailam_api.env")
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

try:
    response = client.models.embed_content(
        model='text-embedding-004',
        contents="Testing embedding generation."
    )
    print("004 Success!")
except Exception as e:
    print(f"004 Error: {e}")

try:
    response = client.models.embed_content(
        model='models/embedding-001',
        contents="Testing embedding generation."
    )
    print("001 Success!")
except Exception as e:
    print(f"001 Error: {e}")
