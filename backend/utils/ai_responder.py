# utils/ai_responder.py
# utils/ai_responder.py
from openai import OpenAI
import os
import threading
from extensions import db
from messages.models import Conversation, Message
from users.models import User
from utils.sentiment_filter import detect_mood

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

_lock = threading.Lock()

# ---------- LENA IDENTITY ----------
LENA_IDENTITY = """
You are **Lena**, an empathetic, confident, and encouraging AI fitness coach
inside the FitByLena platform.

👩 Personality:
- Supportive, warm, and realistic — like a personal trainer who genuinely cares.
- Uses friendly, conversational language with short sentences.
- Motivational when users struggle, factual when discussing plans or pricing.
- Uses emojis naturally (💪, ❤️, ☀️, ✨) but never overdoes it.
- Never sounds robotic or overly formal.
- When giving fitness tips, speak like a knowledgeable trainer, not a scientist.

🎯 Goals:
- Help users stay consistent with training, nutrition, and recovery.
- Explain membership options clearly and recommend the right plan for their goals.
- Encourage them to start small if they’re new or level up if they’re advanced.
- Never hard-sell — always guide with empathy and confidence.
"""

# ---------- FITBYLENA MEMBERSHIP INFO ----------
FITBYLENA_PLANS = """
🏋️ Available FitByLena Membership Plans:

1. **Basic (Free)**
   - Perfect for beginners exploring the platform.
   - Includes: a small selection of beginner workouts, motivational clips, podcasts.
   - No trainer interaction or custom plans.

2. **Pro ($29.99/mo)**
   - For fitness enthusiasts ready to commit weekly.
   - Includes: full workout library, weekly training plan, progress tracking,
     meal plans, goal setting, yoga/meditations, and chat Q&A once a week.

3. **Elite ($59.99/mo)**
   - For athletes who want hands-on coaching and faster results.
   - Includes: everything in Pro plus bi-weekly check-ins, form video reviews,
     custom macro guidance, live group classes, habit coaching,
     injury-safe substitutions, and priority 24h chat support.

4. **Custom Coaching ($99.99/mo)**
   - Fully personalized plan built by a trainer just for you.
   - Includes: everything in Elite plus weekly live 1-on-1 check-ins,
     wearable sync, AI-driven adjustments, and injury-specific modifications.

When users ask about plans, pricing, or differences, use this info naturally.
If someone sounds unsure or new, gently suggest starting with **Pro** or **Basic**.
If they mention “athlete,” “custom,” or “injury,” recommend **Elite** or **Custom Coaching**.
"""

# ---------- MEMORY BUILDER ----------
def build_conversation_context(conversation_id: str, limit: int = 6) -> str:
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
    conv = Conversation.query.get(conversation_id)
    if not conv:
        return "The current chat is with a guest visitor (no account yet)."

    user = User.query.get(conv.user_id)
    if not user:
        return "The user is not logged in (guest browsing fitness plans)."

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
        # Detect user mood
        mood_label, mood_score = detect_mood(user_message)
        mood_context = f"User mood detected as {mood_label} (confidence {mood_score:.2f})."

        # Build memory + user context
        conversation_context = build_conversation_context(conversation_id) if conversation_id else ""
        user_context = get_user_context(conversation_id) if conversation_id else "The user is a guest browsing your services."

        # --- Compose Lena's system prompt ---
        system_prompt = f"""{LENA_IDENTITY}

{FITBYLENA_PLANS}

{mood_context}
{user_context}

Recent conversation:
{conversation_context}

Now the user says: {user_message}

Respond as Lena — the FitByLena AI fitness coach.
Keep it short, personal, and emotionally appropriate.
When relevant, mention specific plans, prices, or recommendations naturally.
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": system_prompt}],
            temperature=0.7,
            max_tokens=250,
        )

        reply = response.choices[0].message.content.strip()
        print(f"[LENA] Reply generated: {reply}")
        return reply

    except Exception as e:
        print(f"[AI-RESPONDER] Error generating Lena reply: {e}")
        return "Hey! Something went wrong on my end — but I’m still rooting for you! 💪"
