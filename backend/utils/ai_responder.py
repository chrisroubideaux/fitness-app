# backend/utils/ai_responder.py

from openai import OpenAI
import os

from users.models import User
from utils.sentiment_filter import detect_mood

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ---------- LENA IDENTITY ----------
LENA_IDENTITY = """
You are Lena, an empathetic, confident, and encouraging AI fitness coach
inside the FitByLena platform.

Personality:
- Supportive, warm, and realistic — like a personal trainer who genuinely cares.
- Use friendly, conversational language with short sentences.
- Be motivational when users struggle, factual when discussing plans or pricing.
- Use emojis naturally (💪, ❤️, ☀️, ✨) but never overdo it.
- Never sound robotic, stiff, or overly formal.
- When giving fitness tips, speak like a knowledgeable trainer, not a scientist.

Goals:
- Help users stay consistent with training, nutrition, and recovery.
- Explain membership options clearly and recommend the right plan for their goals.
- Encourage people to start small if they’re new or level up if they’re advanced.
- Never hard-sell — guide with empathy and confidence.
- If you know the user's real name, you may greet them naturally by name.
- If the user is a guest with no real name, do not call them "Guest" in the reply.
- If you know the time of day, greet them naturally when appropriate.
- Do not keep repeating greetings on every follow-up message.
- If the user is a guest, keep recommendations general and welcoming.
- If the user is a member, make replies feel more personal and relevant to their goals.
"""


# ---------- FITBYLENA MEMBERSHIP INFO ----------
FITBYLENA_PLANS = """
Available FitByLena Membership Plans:

1. Basic (Free)
   - Perfect for beginners exploring the platform.
   - Includes: a small selection of beginner workouts, motivational clips, podcasts.
   - No trainer interaction or custom plans.

2. Pro ($29.99/mo)
   - For fitness enthusiasts ready to commit weekly.
   - Includes: full workout library, weekly training plan, progress tracking,
     meal plans, goal setting, yoga/meditations, and chat Q&A once a week.

3. Elite ($59.99/mo)
   - For athletes who want hands-on coaching and faster results.
   - Includes: everything in Pro plus bi-weekly check-ins, form video reviews,
     custom macro guidance, live group classes, habit coaching,
     injury-safe substitutions, and priority 24h chat support.

4. Custom Coaching ($99.99/mo)
   - Fully personalized plan built by a trainer just for you.
   - Includes: everything in Elite plus weekly live 1-on-1 check-ins,
     wearable sync, AI-driven adjustments, and injury-specific modifications.

Guidance:
- If someone is unsure or brand new, Basic or Pro are usually the best starting points.
- If they mention athlete goals, advanced performance, injuries, or needing more customization,
  Elite or Custom Coaching are stronger fits.
- When users ask about pricing or plan differences, explain clearly and naturally.
"""


def get_user_context_from_user(user: User | None) -> str:
    if not user:
        return "The user is a guest browsing fitness plans."

    parts = [f"The user is named {user.full_name or 'a registered member'}."]
    if user.email:
        parts.append(f"Their email is {user.email}.")
    if getattr(user, "plan_name", None):
        parts.append(f"They are currently on the {user.plan_name} plan.")
    if user.fitness_goal:
        parts.append(f"Their fitness goal is '{user.fitness_goal}'.")
    if user.activity_level:
        parts.append(f"Their activity level is '{user.activity_level}'.")
    if user.experience_level:
        parts.append(f"They are at the '{user.experience_level}' experience level.")
    if user.medical_conditions:
        parts.append(
            "They mentioned medical considerations, so recommendations should stay supportive and cautious."
        )
    return " ".join(parts)


def is_brief_followup_message(user_message: str) -> bool:
    """
    Detects short follow-up or acknowledgment style messages where
    repeating 'Good morning/afternoon/evening' feels unnatural.
    """
    text = (user_message or "").strip().lower()

    brief_phrases = {
        "thanks",
        "thank you",
        "thx",
        "ty",
        "ok",
        "okay",
        "kk",
        "cool",
        "nice",
        "sounds good",
        "got it",
        "perfect",
        "awesome",
        "great",
        "that helps",
        "helpful",
        "appreciate it",
        "thank you lena",
        "thanks lena",
        "alright",
        "i see",
        "makes sense",
        "understood",
        "good to know",
        "gotcha",
        "yep",
        "yes",
    }

    if text in brief_phrases:
        return True

    if len(text.split()) <= 5 and any(
        phrase in text
        for phrase in [
            "thank",
            "thanks",
            "got it",
            "sounds good",
            "makes sense",
            "appreciate",
            "helpful",
            "perfect",
            "awesome",
            "great",
        ]
    ):
        return True

    return False


# ---------- MAIN FUNCTION ----------
def generate_reply(
    user_message: str,
    conversation_id: str = None,   # legacy-compatible
    user_role: str = "guest",      # legacy-compatible
    user_name: str | None = None,
    first_name: str | None = None,
    is_guest: bool = True,
    time_of_day: str | None = None,
    day_name: str | None = None,
    full_time: str | None = None,
    is_weekend: bool | None = None,
    fitness_goal: str | None = None,
    activity_level: str | None = None,
    experience_level: str | None = None,
    medical_conditions: str | None = None,
    plan_name: str | None = None,
) -> str:
    try:
        mood_label, mood_score = detect_mood(user_message)
        mood_context = f"User mood detected as {mood_label} (confidence {mood_score:.2f})."

        resolved_is_guest = is_guest
        if user_role and user_role.lower() != "guest":
            resolved_is_guest = False

        raw_name = (user_name or "").strip()
        raw_first_name = (first_name or "").strip()

        has_real_name = bool(
            raw_first_name
            and raw_first_name.lower() not in {"guest", "there"}
        )

        resolved_name = raw_name if raw_name else "there"
        resolved_first_name = raw_first_name if raw_first_name else "there"
        resolved_plan_name = plan_name or ("Guest" if resolved_is_guest else "Free")

        is_followup = is_brief_followup_message(user_message)

        greeting_parts = []

        if not is_followup:
            if time_of_day and has_real_name:
                greeting_parts.append(
                    f"It is currently {time_of_day}. You may open naturally with a greeting like 'Good {time_of_day}, {resolved_first_name}'."
                )
            elif time_of_day:
                greeting_parts.append(
                    f"It is currently {time_of_day}. If you greet the user, use only 'Good {time_of_day}' and do not add a name."
                )
        else:
            greeting_parts.append(
                "This message reads like a short follow-up or acknowledgment. Do not start the reply with a time-of-day greeting."
            )

        if day_name and full_time:
            greeting_parts.append(f"Today is {day_name} and the local time is {full_time}.")

        if is_weekend is True:
            greeting_parts.append("It is the weekend.")
        elif is_weekend is False:
            greeting_parts.append("It is a weekday.")

        greeting_context = " ".join(greeting_parts).strip()

        if resolved_is_guest:
            user_context = f"""
The user is a guest visitor.
Their display label is '{resolved_name}'.
Do not call them "Guest" in the reply.
Do not pretend to know account-specific details.
Be welcoming, helpful, and lightly encourage them to explore plans if relevant.
"""
        else:
            user_context = f"""
The user is a logged-in member.
Their name is '{resolved_name}'.
Their first name is '{resolved_first_name}'.
Their current plan is '{resolved_plan_name}'.
"""

            if fitness_goal:
                user_context += f"\nTheir fitness goal is '{fitness_goal}'."
            if activity_level:
                user_context += f"\nTheir activity level is '{activity_level}'."
            if experience_level:
                user_context += f"\nTheir experience level is '{experience_level}'."
            if medical_conditions:
                user_context += (
                    "\nThey mentioned medical conditions or limitations. "
                    "Be supportive and cautious. Avoid sounding clinical or giving risky instructions."
                )

        legacy_context = ""
        if conversation_id:
            legacy_context = (
                f"This request included legacy conversation_id '{conversation_id}'. "
                "If no other personalization exists, respond helpfully as Lena."
            )

        system_prompt = f"""
{LENA_IDENTITY}

{FITBYLENA_PLANS}

{mood_context}

{greeting_context}

{user_context}

{legacy_context}

The user says:
{user_message}

Instructions for your reply:
- Respond as Lena, the FitByLena AI coach.
- Keep it short, natural, personal, and emotionally appropriate.
- Usually keep replies to 2-5 sentences unless the user asks for more detail.
- If relevant, mention a plan recommendation naturally.
- If the user is logged in, make the reply feel more personalized.
- If the user is a guest, keep things general and welcoming.
- If you do not know the user's real name, do not use a placeholder name.
- For unnamed guests, prefer greetings like 'Good morning', 'Good afternoon', 'Good evening', or 'Good night' only when greeting actually makes sense.
- Never say 'Good morning, Guest' or similar placeholder greetings.
- Do not repeat time-of-day greetings on short follow-up replies.
- Do not invent account data you were not given.
- Do not sound like customer support reading a script.
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

        fallback_name = (first_name or "").strip()
        has_real_name = bool(
            fallback_name and fallback_name.lower() not in {"guest", "there"}
        )

        if time_of_day and has_real_name:
            return (
                f"Good {time_of_day}, {fallback_name} — something went wrong on my end, "
                f"but I’m still here for you. Try that again and I’ll do my best to help 💪"
            )

        if time_of_day:
            return (
                f"Good {time_of_day}! Something went wrong on my end, "
                f"but I’m still rooting for you. Try again and I’ll help however I can 💪"
            )

        return "Hey! Something went wrong on my end — but I’m still rooting for you! 💪"