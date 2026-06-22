import os
from dotenv import load_dotenv
from google import genai

load_dotenv("ailam_api.env")
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

for m in client.models.list_models():
    if 'embedContent' in m.supported_generation_methods:
        print(m.name)
