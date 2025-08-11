# routes for workout sessions
# workout_session/routes.py

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from extensions import db
from utils.decorators import token_required
from .models import WorkoutSession
workout_sessions_bp = Blueprint('workout_session', __name__)

# ---------- helpers ----------

def _parse_iso_dt_to_utc(iso_str: str, assume_tz: str = "America/Chicago") -> datetime:
    """
    Parse an ISO-8601 datetime string into UTC.
    If no tzinfo, assume `assume_tz`.
    Accepts 'Z' suffix by converting to '+00:00'.
    """
    if not iso_str:
        return datetime.utcnow()
    s = iso_str.strip().replace('Z', '+00:00')
    try:
        dt = datetime.fromisoformat(s)
    except Exception:
        # fallback: just return now
        return datetime.utcnow()
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=ZoneInfo(assume_tz))
    return dt.astimezone(ZoneInfo("UTC"))

def _labels_mon_to_sun():
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

# ---------- routes ----------

# Create a workout session
@workout_sessions_bp.route('/generate-dummy', methods=['POST', 'GET'])
@token_required
def generate_dummy_data(current_user):
    """
    Generate random workout sessions for testing.

    Accepts EITHER JSON body OR query params, but both are optional:
      Body JSON (Content-Type: application/json):
        { "days": 14, "min_minutes": 20, "max_minutes": 60 }
      OR Query params:
        /generate-dummy?days=14&min_minutes=20&max_minutes=60
      If nothing is provided, sensible defaults are used.
    """
    import random

    # Accept missing/invalid JSON without throwing 400
    data = request.get_json(silent=True) or {}

    # Also accept query params for convenience
    days = int(data.get("days", request.args.get("days", 14)))
    min_minutes = int(data.get("min_minutes", request.args.get("min_minutes", 20)))
    max_minutes = int(data.get("max_minutes", request.args.get("max_minutes", 60)))

    now = datetime.now(ZoneInfo("America/Chicago"))

    for i in range(days):
        workout_date = now - timedelta(days=i)
        session = WorkoutSession(
            user_id=current_user.id,
            workout_type=random.choice(["Strength", "Cardio", "Yoga", "HIIT"]),
            duration_minutes=random.randint(min_minutes, max_minutes),
            calories_burned=random.randint(200, 600),
            workout_date=workout_date.astimezone(ZoneInfo("UTC")),
        )
        db.session.add(session)

    db.session.commit()
    return jsonify({"message": f"Generated {days} dummy workout sessions."}), 201


# Get weekly progress points
@workout_sessions_bp.route('/weekly', methods=['GET'])
@token_required
def weekly_points(current_user):
    from datetime import date

    tz = request.args.get('tz') or "America/Chicago"
    week_start_str = request.args.get('week_start')  # YYYY-MM-DD
    weeks_back = request.args.get('weeks_back', type=int)  # optional

    if week_start_str:
        try:
            y, m, d = [int(x) for x in week_start_str.split('-')]
            local_start = datetime(y, m, d, 0, 0, 0, tzinfo=ZoneInfo(tz))
        except Exception:
            return jsonify({"error": "Invalid week_start format. Use YYYY-MM-DD"}), 400
    else:
        now_local = datetime.now(ZoneInfo(tz))
        monday = now_local.date() - timedelta(days=now_local.weekday())
        if weeks_back and weeks_back > 0:
            monday = monday - timedelta(days=7 * weeks_back)
        local_start = datetime(monday.year, monday.month, monday.day, 0, 0, 0, tzinfo=ZoneInfo(tz))

    start_utc = local_start.astimezone(ZoneInfo("UTC"))
    end_utc = (local_start + timedelta(days=7)).astimezone(ZoneInfo("UTC"))

    sessions = (WorkoutSession.query
                .filter(WorkoutSession.user_id == current_user.id)
                .filter(WorkoutSession.workout_date >= start_utc)
                .filter(WorkoutSession.workout_date < end_utc)
                .all())

    labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    minutes = [0]*7
    sess_ct = [0]*7

    for s in sessions:
        local_dt = s.workout_date.astimezone(ZoneInfo(tz))
        i = local_dt.weekday()
        minutes[i] += int(s.duration_minutes or 0)
        sess_ct[i] += 1

    points = [{"label": labels[i], "minutes": minutes[i], "sessions": sess_ct[i]} for i in range(7)]
    return jsonify({
        "user_id": str(current_user.id),
        "week_start": local_start.date().isoformat(),
        "points": points
    }), 200

# history for lastweeks
@workout_sessions_bp.route('/history/weeks', methods=['GET'])
@token_required
def weeks_history(current_user):
    tz = request.args.get('tz') or "America/Chicago"
    n = request.args.get('n', default=8, type=int)  # last N weeks, default 8

    now_local = datetime.now(ZoneInfo(tz))
    # Monday of current week
    start_monday = now_local.date() - timedelta(days=now_local.weekday())
    # Earliest Monday we want
    first_monday = start_monday - timedelta(days=7*(n-1))

    # UTC bounds for the whole window
    first_local = datetime(first_monday.year, first_monday.month, first_monday.day, 0, 0, 0, tzinfo=ZoneInfo(tz))
    last_local = datetime(start_monday.year, start_monday.month, start_monday.day, 0, 0, 0, tzinfo=ZoneInfo(tz)) + timedelta(days=7)
    start_utc = first_local.astimezone(ZoneInfo("UTC"))
    end_utc = last_local.astimezone(ZoneInfo("UTC"))

    sessions = (WorkoutSession.query
                .filter(WorkoutSession.user_id == current_user.id)
                .filter(WorkoutSession.workout_date >= start_utc)
                .filter(WorkoutSession.workout_date < end_utc)
                .all())

    # bucket by ISO week start
    weeks = {}
    labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    for s in sessions:
        local_dt = s.workout_date.astimezone(ZoneInfo(tz))
        monday = local_dt.date() - timedelta(days=local_dt.weekday())
        key = monday.isoformat()
        if key not in weeks:
            weeks[key] = {"week_start": key,
                          "points": [{"label": l, "minutes": 0, "sessions": 0} for l in labels]}
        i = local_dt.weekday()
        weeks[key]["points"][i]["minutes"] += int(s.duration_minutes or 0)
        weeks[key]["points"][i]["sessions"] += 1

    # Fill empty weeks with zeros
    ordered = []
    for k in range(n):
        monday = (start_monday - timedelta(days=7*(n-1-k))).isoformat()
        ordered.append(weeks.get(monday, {"week_start": monday,
                                          "points": [{"label": l, "minutes": 0, "sessions": 0} for l in labels]}))

    return jsonify({"weeks": ordered}), 200

# 
@workout_sessions_bp.route('/summary/monthly', methods=['GET'])
@token_required
def monthly_summary(current_user):
    # last 6 months by default
    months = request.args.get('months', default=6, type=int)
    tz = request.args.get('tz') or "America/Chicago"

    now_local = datetime.now(ZoneInfo(tz))
    # earliest date = first day of (now - months + 1)
    first = (now_local.replace(day=1) - timedelta(days=1))
    for _ in range(months-1):
        first = (first.replace(day=1) - timedelta(days=1))
    first_local = first.replace(day=1, hour=0, minute=0, second=0, tzinfo=ZoneInfo(tz))

    start_utc = first_local.astimezone(ZoneInfo("UTC"))
    sessions = (WorkoutSession.query
                .filter(WorkoutSession.user_id == current_user.id)
                .filter(WorkoutSession.workout_date >= start_utc)
                .all())

    buckets = {}
    for s in sessions:
        local_dt = s.workout_date.astimezone(ZoneInfo(tz))
        key = local_dt.strftime("%Y-%m")
        b = buckets.setdefault(key, {"month": key, "minutes": 0, "sessions": 0})
        b["minutes"] += int(s.duration_minutes or 0)
        b["sessions"] += 1

    # order by month key
    ordered = [buckets[k] for k in sorted(buckets.keys())]
    return jsonify({"months": ordered}), 200
@workout_sessions_bp.route('/generate-week', methods=['POST', 'GET'])
@token_required
def generate_week(current_user):
    import random
    tz = request.args.get('tz') or "America/Chicago"
    week_start_str = request.args.get('week_start')  # YYYY-MM-DD, Monday
    if not week_start_str:
        return jsonify({"error": "week_start (YYYY-MM-DD) required"}), 400
    y, m, d = [int(x) for x in week_start_str.split('-')]
    local_start = datetime(y, m, d, 0, 0, 0, tzinfo=ZoneInfo(tz))

    min_minutes = int(request.args.get("min_minutes", 20))
    max_minutes = int(request.args.get("max_minutes", 60))

    for i in range(7):
        day = local_start + timedelta(days=i)
        # optional: random chance to skip a day
        if random.random() < 0.85:
            session = WorkoutSession(
                user_id=current_user.id,
                workout_type=random.choice(["Strength","Cardio","Yoga","HIIT"]),
                duration_minutes=random.randint(min_minutes, max_minutes),
                calories_burned=random.randint(200, 600),
                workout_date=day.astimezone(ZoneInfo("UTC")),
            )
            db.session.add(session)
    db.session.commit()
    return jsonify({"message": f"Generated data for week starting {week_start_str}"}), 201
