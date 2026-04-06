# backend/chats/routes.py
import os
import requests

from flask import Blueprint, request, jsonify
from better_profanity import profanity

from extensions import db
from .datetime_context import get_time_context
from utils.ai_responder import generate_reply
from utils.decorators import token_required, token_required_optional
from utils.toxicity_filter import analyze_text
from utils.sentiment_filter import detect_mood

from .models import Chat

chats_bp = Blueprint("chats", __name__, url_prefix="/api/chats")

HF_KEY = os.getenv("HUGGINGFACE_API_KEY")
HF_HEADERS = {"Authorization": f"Bearer {HF_KEY}"} if HF_KEY else {}
HF_MODEL = "unitary/toxic-bert"
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"

profanity.load_censor_words()


def is_toxic_message(text: str) -> bool:
    try:
        response = requests.post(
            HF_API_URL,
            headers=HF_HEADERS,
            json={"inputs": text},
            timeout=10,
        )
        data = response.json()
        if isinstance(data, list) and len(data) > 0:
            score = data[0][0].get("score", 0)
            return score > 0.7
    except Exception as e:
        print(f"[HF] Toxicity check failed: {e}")
    return False


def detect_spam_or_prompt_injection(text: str) -> bool:
    spam_keywords = [
        "buy now",
        "click here",
        "free money",
        "subscribe",
        "lottery",
        "credit card",
        "http",
        "bit.ly",
        "promo",
        "winner",
    ]
    injections = [
        "ignore previous instructions",
        "system prompt",
        "jailbreak",
        "bypass",
        "disregard the rules",
        "prompt injection",
        "act as",
    ]
    lower = text.lower()
    return any(kw in lower for kw in spam_keywords + injections)


def build_lena_context(current_user=None, guest_name: str | None = None) -> dict:
    time_ctx = get_time_context()

    if current_user:
        plan_name = current_user.plan_name if hasattr(current_user, "plan_name") else "Free"
        return {
            "is_guest": False,
            "user_name": current_user.full_name,
            "first_name": (current_user.full_name or "").split(" ")[0] if current_user.full_name else "there",
            "email": current_user.email,
            "fitness_goal": current_user.fitness_goal,
            "activity_level": current_user.activity_level,
            "experience_level": current_user.experience_level,
            "medical_conditions": current_user.medical_conditions,
            "plan_name": plan_name,
            "time_of_day": time_ctx.get("time_of_day"),
            "day_name": time_ctx.get("day_name"),
            "full_time": time_ctx.get("full_time"),
            "is_weekend": time_ctx.get("is_weekend"),
        }

    display_name = (guest_name or "Guest").strip() or "Guest"
    first_name = display_name.split(" ")[0]

    return {
        "is_guest": True,
        "user_name": display_name,
        "first_name": first_name,
        "email": None,
        "fitness_goal": None,
        "activity_level": None,
        "experience_level": None,
        "medical_conditions": None,
        "plan_name": "Guest",
        "time_of_day": time_ctx.get("time_of_day"),
        "day_name": time_ctx.get("day_name"),
        "full_time": time_ctx.get("full_time"),
        "is_weekend": time_ctx.get("is_weekend"),
    }


def generate_lena_reply(message_text: str, lena_context: dict) -> str:
    try:
        return generate_reply(
            user_message=message_text,
            user_name=lena_context.get("user_name"),
            first_name=lena_context.get("first_name"),
            is_guest=lena_context.get("is_guest"),
            time_of_day=lena_context.get("time_of_day"),
            day_name=lena_context.get("day_name"),
            full_time=lena_context.get("full_time"),
            is_weekend=lena_context.get("is_weekend"),
            fitness_goal=lena_context.get("fitness_goal"),
            activity_level=lena_context.get("activity_level"),
            experience_level=lena_context.get("experience_level"),
            medical_conditions=lena_context.get("medical_conditions"),
            plan_name=lena_context.get("plan_name"),
        )
    except TypeError:
        return generate_reply(user_message=message_text)


@chats_bp.route("/", methods=["POST", "OPTIONS"])
@token_required_optional
def create_chat(current_user):
    data = request.get_json() or {}
    message_text = (data.get("message") or "").strip()

    guest_name = (data.get("name") or "Guest").strip()
    guest_email = data.get("email") or None

    if not message_text:
        return jsonify({"error": "Message is required."}), 400

    if profanity.contains_profanity(message_text):
        return jsonify({"error": "Message rejected for inappropriate content."}), 400

    toxic_local, tox_score = analyze_text(message_text)

    if not toxic_local:
        toxic_local = is_toxic_message(message_text)

    if toxic_local:
        msg = Chat(
            user_id=current_user.id if current_user else None,
            is_guest=False if current_user else True,
            name=current_user.full_name if current_user else guest_name,
            email=current_user.email if current_user else guest_email,
            message=message_text,
            is_toxic=True,
            toxicity_score=tox_score,
            status="rejected",
        )
        db.session.add(msg)
        db.session.commit()
        return jsonify(
            {
                "error": "Message rejected for toxicity.",
                "toxicity_score": tox_score,
            }
        ), 422

    if detect_spam_or_prompt_injection(message_text):
        msg = Chat(
            user_id=current_user.id if current_user else None,
            is_guest=False if current_user else True,
            name=current_user.full_name if current_user else guest_name,
            email=current_user.email if current_user else guest_email,
            message=message_text,
            status="rejected",
        )
        db.session.add(msg)
        db.session.commit()
        return jsonify({"error": "Message flagged as spam or injection."}), 400

    mood_label, mood_score = detect_mood(message_text)
    lena_context = build_lena_context(current_user, guest_name=guest_name)

    chat = Chat(
        user_id=current_user.id if current_user else None,
        is_guest=False if current_user else True,
        name=current_user.full_name if current_user else guest_name,
        email=current_user.email if current_user else guest_email,
        message=message_text,
        is_toxic=False,
        toxicity_score=tox_score,
        sentiment=mood_label,
        sentiment_score=mood_score,
        status="new",
    )
    db.session.add(chat)
    db.session.commit()

    try:
        reply_text = generate_lena_reply(
            message_text=message_text,
            lena_context=lena_context,
        )
        chat.response = reply_text
        chat.status = "responded"
        db.session.commit()
    except Exception as e:
        print(f"[LENA] Error: {e}")
        fallback_name = lena_context.get("first_name") or "there"
        greeting = lena_context.get("time_of_day") or "day"

        if current_user:
            chat.response = (
                f"Good {greeting}, {fallback_name} — something went wrong on my end, "
                f"but I’m still here for you. Try sending that again and I’ll help however I can 💪"
            )
        else:
            chat.response = (
                f"Good {greeting}! Something went wrong on my end, "
                f"but I’m still cheering for you. Please try again 💜"
            )

        chat.status = "responded"
        db.session.commit()

    return jsonify({"chat": chat.to_dict()}), 201


@chats_bp.route("/me", methods=["GET", "OPTIONS"])
@token_required
def get_my_chats(current_user):
    chats = (
        Chat.query.filter_by(user_id=current_user.id)
        .order_by(Chat.created_at.desc())
        .all()
    )
    return jsonify({"chats": [c.to_dict() for c in chats]}), 200


@chats_bp.route("/", methods=["GET"])
def get_chats():
    chats = Chat.query.order_by(Chat.created_at.desc()).all()
    return jsonify({"chats": [c.to_dict() for c in chats]}), 200


@chats_bp.route("/<string:chat_id>", methods=["GET"])
def get_chat(chat_id):
    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404
    return jsonify({"chat": chat.to_dict()}), 200


@chats_bp.route("/<string:chat_id>", methods=["PATCH"])
def update_chat(chat_id):
    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404

    data = request.get_json() or {}
    chat.status = data.get("status", chat.status)
    db.session.commit()

    return jsonify({"message": "Chat updated", "chat": chat.to_dict()}), 200


@chats_bp.route("/<string:chat_id>", methods=["DELETE"])
def delete_chat(chat_id):
    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404

    db.session.delete(chat)
    db.session.commit()

    return jsonify({"message": "Chat deleted", "chat_id": chat_id}), 200


@chats_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({"ok": True, "message": "Lena chat API active"}), 200