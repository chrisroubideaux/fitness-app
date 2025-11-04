# utils/sentiment_filter.py
from transformers import pipeline
import threading

_lock = threading.Lock()
_model = None

def get_sentiment_pipeline():
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                print("[INIT] Loading Hugging Face sentiment model…")
                _model = pipeline("sentiment-analysis")
    return _model

def detect_mood(text: str):
    try:
        model = get_sentiment_pipeline()
        result = model(text[:512])[0]
        label, score = result["label"], result["score"]
        return label.lower(), float(score)
    except Exception as e:
        print(f"[MOOD-DETECT] Failed: {e}")
        return "neutral", 0.0
