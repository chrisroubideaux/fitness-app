# backend/chats/routes.py
# backend/chats/routes.py

import os
import requests
from flask import Blueprint, request, jsonify
from better_profanity import profanity
from extensions import db
from utils.ai_responder import generate_reply  # 🧠 Uses the new plan-aware Lena responder
from utils.toxicity_filter import get_toxicity_pipeline
from utils.sentiment_filter import detect_mood
from .models import Chat

chats_bp = Blueprint("chats", __name__, url_prefix="/api/chats")

# 🧩 Optional Hugging Face fallback
HF_KEY = os.getenv("HUGGINGFACE_API_KEY")
HF_HEADERS = {"Authorization": f"Bearer {HF_KEY}"} if HF_KEY else {}
HF_MODEL = "unitary/toxic-bert"
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"

# 🧩 Profanity filter
profanity.load_censor_words()


# ---------- Helper: Hugging Face Toxicity Detection ----------
def is_toxic_message(text: str) -> bool:
    """Call Hugging Face API to check if text is toxic."""
    try:
        response = requests.post(HF_API_URL, headers=HF_HEADERS, json={"inputs": text}, timeout=10)
        data = response.json()
        if isinstance(data, list) and len(data) > 0:
            score = data[0][0].get("score", 0)
            return score > 0.7
    except Exception as e:
        print(f"[HF] Toxicity check failed: {e}")
    return False


# ---------- Helper: Detect spam or prompt injections ----------
def detect_spam_or_prompt_injection(text: str) -> bool:
    """Simple spam and prompt injection detection."""
    spam_keywords = [
        "buy now", "click here", "free money", "subscribe", "lottery",
        "credit card", "http", "bit.ly", "promo", "winner"
    ]
    injections = [
        "ignore previous instructions", "system prompt", "jailbreak",
        "bypass", "disregard the rules", "prompt injection", "act as"
    ]
    lower = text.lower()
    return any(kw in lower for kw in spam_keywords + injections)


# ---------- 🟢 CREATE - New Chat with Lena ----------
@chats_bp.route("/", methods=["POST"])
def create_chat():
    """
    POST /api/chats
    Expected JSON:
    {
      "name": "Chris",
      "email": "test@example.com",
      "message": "Hi Lena, how can I improve recovery?"
    }
    """
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    message_text = (data.get("message") or "").strip()

    if not email or not message_text:
        return jsonify({"error": "Email and message are required."}), 400

    # 1️⃣ Profanity filter
    if profanity.contains_profanity(message_text):
        return jsonify({"error": "Message rejected for inappropriate content."}), 400

    # 2️⃣ Toxicity detection
    toxic_local = False
    tox_score = 0.0
    try:
        model = get_toxicity_pipeline()
        result = model(message_text[:512])
        scores = {r["label"]: r["score"] for r in result[0]}
        toxic_local = scores.get("toxic", 0.0) > 0.5
        tox_score = scores.get("toxic", 0.0)
    except Exception as e:
        print(f"[LOCAL TOXICITY] Failed: {e}")

    # fallback to HF API if local pipeline unavailable
    if not toxic_local:
        toxic_local = is_toxic_message(message_text)

    if toxic_local:
        msg = Chat(
            name=name,
            email=email,
            message=message_text,
            is_toxic=True,
            toxicity_score=tox_score,
            status="rejected"
        )
        db.session.add(msg)
        db.session.commit()
        return jsonify({
            "error": "Message rejected for toxicity.",
            "toxicity_score": tox_score
        }), 422

    # 3️⃣ Spam / prompt injection
    if detect_spam_or_prompt_injection(message_text):
        msg = Chat(name=name, email=email, message=message_text, status="rejected")
        db.session.add(msg)
        db.session.commit()
        return jsonify({"error": "Message flagged as spam or injection."}), 400

    # 4️⃣ Sentiment analysis
    mood_label, mood_score = detect_mood(message_text)

    # 5️⃣ Save chat entry (pending AI reply)
    chat = Chat(
        name=name,
        email=email,
        message=message_text,
        is_toxic=False,
        toxicity_score=tox_score,
        sentiment=mood_label,
        sentiment_score=mood_score,
        status="new",
    )
    db.session.add(chat)
    db.session.commit()

    # 6️⃣ Generate Lena's reply
    try:
        # The plan-aware version of generate_reply()
        reply_text = generate_reply(user_message=message_text)
        chat.response = reply_text
        chat.status = "responded"
        db.session.commit()
    except Exception as e:
        print(f"[LENA] Error: {e}")
        chat.response = (
            "Hey! Something went wrong on my end — "
            "but I’m still cheering for you! 💪"
        )
        db.session.commit()

    return jsonify({"chat": chat.to_dict()}), 201


# ---------- 🔵 READ - All chats ----------
@chats_bp.route("/", methods=["GET"])
def get_chats():
    chats = Chat.query.order_by(Chat.created_at.desc()).all()
    return jsonify({"chats": [c.to_dict() for c in chats]}), 200


# ---------- 🟣 READ - Single chat ----------
@chats_bp.route("/<string:chat_id>", methods=["GET"])
def get_chat(chat_id):
    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404
    return jsonify({"chat": chat.to_dict()}), 200


# ---------- 🟠 PATCH - Update chat status ----------
@chats_bp.route("/<string:chat_id>", methods=["PATCH"])
def update_chat(chat_id):
    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404
    data = request.get_json() or {}
    chat.status = data.get("status", chat.status)
    db.session.commit()
    return jsonify({"message": "Chat updated", "chat": chat.to_dict()}), 200


# ---------- 🔴 DELETE - Remove a chat ----------
@chats_bp.route("/<string:chat_id>", methods=["DELETE"])
def delete_chat(chat_id):
    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404
    db.session.delete(chat)
    db.session.commit()
    return jsonify({"message": "Chat deleted", "chat_id": chat_id}), 200


# ---------- 🧠 HEALTH CHECK ----------
@chats_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({"ok": True, "message": "Lena chat API active"}), 200


"""""""""
import os
import requests
from flask import Blueprint, request, jsonify
from better_profanity import profanity
from extensions import db
from utils.ai_responder import generate_reply
from utils.toxicity_filter import get_toxicity_pipeline
from utils.sentiment_filter import detect_mood
from .models import Chat

chats_bp = Blueprint("chats", __name__, url_prefix="/api/chats")

# 🧩 Optional Hugging Face fallback
HF_KEY = os.getenv("HUGGINGFACE_API_KEY")
HF_HEADERS = {"Authorization": f"Bearer {HF_KEY}"} if HF_KEY else {}
HF_MODEL = "unitary/toxic-bert"
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"

# 🧩 Profanity filter
profanity.load_censor_words()


# ---------- Helper: Hugging Face Toxicity Detection ----------
def is_toxic_message(text: str) -> bool:
   
    try:
        response = requests.post(HF_API_URL, headers=HF_HEADERS, json={"inputs": text}, timeout=10)
        data = response.json()
        if isinstance(data, list) and len(data) > 0:
            score = data[0][0].get("score", 0)
            return score > 0.7
    except Exception as e:
        print(f"[HF] Toxicity check failed: {e}")
    return False


# ---------- Helper: Detect spam or prompt injections ----------
def detect_spam_or_prompt_injection(text: str) -> bool:
    spam_keywords = [
        "buy now", "click here", "free money", "subscribe", "lottery",
        "credit card", "http", "bit.ly", "promo", "winner"
    ]
    injections = [
        "ignore previous instructions", "system prompt", "jailbreak",
        "bypass", "disregard the rules", "prompt injection", "act as"
    ]
    lower = text.lower()
    return any(kw in lower for kw in spam_keywords + injections)


# ---------- 🟢 CREATE - New Chat with Lena ----------
@chats_bp.route("/", methods=["POST"])
def create_chat():
    
    POST /api/chats
    Expected JSON:
    {
      "name": "Chris",
      "email": "test@example.com",
      "message": "Hi Lena, how can I improve recovery?"
    }
    
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    message_text = (data.get("message") or "").strip()

    if not email or not message_text:
        return jsonify({"error": "Email and message are required."}), 400

    # 1️⃣ Profanity filter
    if profanity.contains_profanity(message_text):
        return jsonify({"error": "Message rejected for inappropriate content."}), 400

    # 2️⃣ Toxicity detection
    toxic_local = False
    tox_score = 0.0
    try:
        model = get_toxicity_pipeline()
        result = model(message_text[:512])
        scores = {r["label"]: r["score"] for r in result[0]}
        toxic_local = scores.get("toxic", 0.0) > 0.5
        tox_score = scores.get("toxic", 0.0)
    except Exception as e:
        print(f"[LOCAL TOXICITY] Failed: {e}")

    # fallback to HF API if local pipeline unavailable
    if not toxic_local:
        toxic_local = is_toxic_message(message_text)

    if toxic_local:
        msg = Chat(name=name, email=email, message=message_text, is_toxic=True, toxicity_score=tox_score, status="rejected")
        db.session.add(msg)
        db.session.commit()
        return jsonify({
            "error": "Message rejected for toxicity.",
            "toxicity_score": tox_score
        }), 422

    # 3️⃣ Spam / prompt injection
    if detect_spam_or_prompt_injection(message_text):
        msg = Chat(name=name, email=email, message=message_text, status="rejected")
        db.session.add(msg)
        db.session.commit()
        return jsonify({"error": "Message flagged as spam or injection."}), 400

    # 4️⃣ Sentiment analysis
    mood_label, mood_score = detect_mood(message_text)

    # 5️⃣ Save chat entry (pending AI reply)
    chat = Chat(
        name=name,
        email=email,
        message=message_text,
        is_toxic=False,
        toxicity_score=tox_score,
        sentiment=mood_label,
        sentiment_score=mood_score,
        status="new",
    )
    db.session.add(chat)
    db.session.commit()

    # 6️⃣ Generate Lena's reply
    try:
        reply_text = generate_reply(user_message=message_text)
        chat.response = reply_text
        chat.status = "responded"
        db.session.commit()
    except Exception as e:
        print(f"[LENA] Error: {e}")
        chat.response = "Hey! Something went wrong on my end — but I’m still cheering for you! 💪"
        db.session.commit()

    return jsonify({"chat": chat.to_dict()}), 201


# ---------- 🔵 READ - All chats ----------
@chats_bp.route("/", methods=["GET"])
def get_chats():
    chats = Chat.query.order_by(Chat.created_at.desc()).all()
    return jsonify({"chats": [c.to_dict() for c in chats]}), 200


# ---------- 🟣 READ - Single chat ----------
@chats_bp.route("/<string:chat_id>", methods=["GET"])
def get_chat(chat_id):
    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404
    return jsonify({"chat": chat.to_dict()}), 200


# ---------- 🟠 PATCH - Update chat status ----------
@chats_bp.route("/<string:chat_id>", methods=["PATCH"])
def update_chat(chat_id):
    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404
    data = request.get_json() or {}
    chat.status = data.get("status", chat.status)
    db.session.commit()
    return jsonify({"message": "Chat updated", "chat": chat.to_dict()}), 200


# ---------- 🔴 DELETE - Remove a chat ----------
@chats_bp.route("/<string:chat_id>", methods=["DELETE"])
def delete_chat(chat_id):
    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404
    db.session.delete(chat)
    db.session.commit()
    return jsonify({"message": "Chat deleted", "chat_id": chat_id}), 200


# ---------- 🧠 HEALTH CHECK ----------
@chats_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({"ok": True, "message": "Lena chat API active"}), 200
    
"""""""""
