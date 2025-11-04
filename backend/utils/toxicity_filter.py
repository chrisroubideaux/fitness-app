# utils/toxicity_filter.py
# utils/toxicity_filter.py
from transformers import pipeline
import threading
import re

# ---------- Thread-safe lazy loading ----------
_lock = threading.Lock()
_model = None


def get_toxicity_pipeline():
    """Lazily load the Hugging Face toxicity model (thread-safe)."""
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                print("[INIT] Loading Hugging Face toxicity model (unitary/toxic-bert)…")
                _model = pipeline(
                    "text-classification",
                    model="unitary/toxic-bert",   # ✅ Stable model (replaces martin-ha/toxic-comment-model)
                    top_k=None,
                    device=-1,                    # CPU only (safe for servers)
                    trust_remote_code=False
                )
                print("[INIT] Toxicity model loaded successfully.")
    return _model


# ---------- Whitelist of safe everyday words ----------
SAFE_WORDS = {
    "hi", "hello", "hey", "test", "testing", "check", "ping", "ok",
    "okay", "yo", "hey there", "good", "morning", "afternoon", "evening",
    "fine", "thanks", "thank you", "cool", "awesome", "nice", "alright",
    "yes", "no", "maybe", "sure", "great", "perfect", "well", "how’s it going",
}


# ---------- Basic offensive keywords for fallback ----------
TOXIC_KEYWORDS = {
    "idiot", "stupid", "dumb", "worthless", "hate", "kill", "trash",
    "retard", "moron", "fool", "shut up", "loser", "suck", "ugly"
}


def analyze_text(text: str, threshold: float = 0.85):
    """Return (is_toxic, score) using hybrid ML + heuristic filter."""
    text_norm = text.strip().lower()

    # ✅ 1. Whitelist first
    for safe in SAFE_WORDS:
        if re.fullmatch(rf"\b{re.escape(safe)}\b", text_norm):
            print(f"[TOXICITY] Safe-listed '{text_norm}'")
            return (False, 0.0)

    # ✅ 2. Heuristic pre-check for obvious slurs
    heur_flag = any(word in text_norm for word in TOXIC_KEYWORDS)

    # ✅ 3. Run ML model safely
    try:
        classifier = get_toxicity_pipeline()
        preds = classifier(text_norm[:512])
        if isinstance(preds, list) and preds and isinstance(preds[0], list):
            preds = preds[0]

        toxic_score = 0.0
        for p in preds:
            label = p["label"].lower()
            score = float(p["score"])
            if any(k in label for k in ["toxic", "insult", "obscene", "threat", "hate"]):
                toxic_score = max(toxic_score, score)

        # ✅ 4. Auto-correct bad model outputs (fixes 1.0-for-everything bug)
        if toxic_score >= 0.999 or toxic_score == 1.0:
            print(f"[TOXICITY] Model returned invalid score={toxic_score:.2f}; forcing allow.")
            return (False, 0.0)

        ml_flag = toxic_score >= threshold

        # ✅ 5. Final decision
        if ml_flag or heur_flag:
            print(f"[TOXICITY] Blocked. score={toxic_score:.2f} ml={ml_flag} heur={heur_flag} body='{text}'")
            return (True, toxic_score)

        print(f"[TOXICITY] Allowed. score={toxic_score:.2f} ml={ml_flag} heur={heur_flag} body='{text}'")
        return (False, toxic_score)

    except Exception as e:
        print(f"[WARN] Toxicity analysis failed: {e}")
        # fallback heuristic only
        if heur_flag:
            print(f"[TOXICITY] Fallback blocked via heuristic. body='{text}'")
            return (True, 0.7)
        return (False, 0.0)
