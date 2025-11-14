# backend/ai/openai_client.py

import os
from openai import OpenAI

def generate_with_openai(prompt, model="gpt-4", max_tokens=800):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise Exception("Missing OPENAI_API_KEY environment variable")

    client = OpenAI(api_key=api_key)  # ✅ moved inside the function

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are a personal trainer AI."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=max_tokens,
        temperature=0.7
    )
    return response.choices[0].message.content
