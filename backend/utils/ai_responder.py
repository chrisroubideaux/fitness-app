# utils/ai_responder.py

from openai import OpenAI
import os
import threading
from extensions import db
from messages.models import Conversation, Message
from users.models import User
from utils.sentiment_filter import detect_mood

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Thread-safe client init
_lock = threading.Lock()

# ---------- LENA IDENTITY ----------
LENA_IDENTITY = """
You are **Lena**, an empathetic, confident, and encouraging AI fitness coach.

👩 Personality:
- Supportive and motivational, like a personal trainer who genuinely cares.
- Uses short, warm messages with a friendly, conversational tone.
- Can adapt tone: empathetic when users are sad, uplifting when they’re tired, and focused when discussing training or diet.
- Uses emojis naturally (💪, ❤️, ☀️, ✨) but not excessively.

🎯 Goals:
- Help users stay consistent with fitness, nutrition, and recovery.
- Offer simple, factual advice and positive reinforcement.
- Never sound robotic, never lecture.
"""

# ---------- MEMORY BUILDER ----------
def build_conversation_context(conversation_id: str, limit: int = 6) -> str:
    """Fetch last few messages in the conversation for short-term memory."""
    msgs = (
        Message.query
        .filter_by(conversation_id=conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
        .all()
    )
    if not msgs:
        return ""

    history = []
    for m in reversed(msgs):
        if m.sender_role == "user":
            history.append(f"User: {m.body}")
        else:
            history.append(f"Lena: {m.body}")
    return "\n".join(history)

# ---------- USER CONTEXT ----------
def get_user_context(conversation_id: str):
    """Get user info linked to this conversation for personalization."""
    conv = Conversation.query.get(conversation_id)
    if not conv:
        return "The current chat is with a guest visitor (no account yet)."

    user = User.query.get(conv.user_id)
    if not user:
        return "The user is not logged in (guest browsing fitness plans)."

    # Customize the context Lena receives
    parts = [f"The user is {user.email or 'a registered member'}."]
    if user.membership_plan_id:
        parts.append("They have an active fitness membership plan.")
    if user.fitness_goal:
        parts.append(f"Their current goal is '{user.fitness_goal}'.")
    if user.activity_level:
        parts.append(f"Their activity level is '{user.activity_level}'.")
    if user.experience_level:
        parts.append(f"They are '{user.experience_level}' experience level.")
    return " ".join(parts)

# ---------- MAIN FUNCTION ----------
def generate_reply(user_message: str, conversation_id: str = None, user_role: str = "guest") -> str:
    try:
        # Detect user mood sentimentally
        mood_label, mood_score = detect_mood(user_message)
        mood_context = f"User mood detected as {mood_label} (confidence {mood_score:.2f})."

        # Fetch conversation memory + user context
        conversation_context = build_conversation_context(conversation_id) if conversation_id else ""
        user_context = get_user_context(conversation_id) if conversation_id else "The user is a guest asking about your services."

        # Compose Lena’s final system message
        system_prompt = f"""{LENA_IDENTITY}

{mood_context}
{user_context}

Recent conversation:
{conversation_context}

Now the user says: {user_message}

Respond as Lena, staying true to her fitness-coach personality.
Keep it short, personal, and emotionally appropriate.
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": system_prompt}],
            temperature=0.7,
            max_tokens=220,
        )

        reply = response.choices[0].message.content.strip()
        print(f"[LENA] Reply generated: {reply}")
        return reply

    except Exception as e:
        print(f"[AI-RESPONDER] Error generating Lena reply: {e}")
        return "Hey! Something went wrong on my end — but I’m still rooting for you! 💪"
