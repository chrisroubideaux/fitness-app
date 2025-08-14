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
# Create dummy workout sessions (fills new exercise fields)
@workout_sessions_bp.route('/generate-dummy', methods=['POST', 'GET'])
@token_required
def generate_dummy_data(current_user):
    """
    Generate random workout sessions for testing.

    Accepts EITHER JSON body OR query params (both optional):
      Body JSON:
        { "days": 14, "min_minutes": 20, "max_minutes": 60, "per_day": 1, "pct_planned": 0.7 }
      OR Query params:
        /generate-dummy?days=14&min_minutes=20&max_minutes=60&per_day=1&pct_planned=0.7

    - days: how many past days to generate (starting from today)
    - per_day: number of sessions per day (default 1)
    - pct_planned: fraction [0..1] tagged as 'planned' vs 'extra' (default 0.7)
    """
    import random

    data = request.get_json(silent=True) or {}

    # Inputs (with query param fallbacks)
    days        = int(data.get("days",        request.args.get("days",        14)))
    min_minutes = int(data.get("min_minutes", request.args.get("min_minutes", 20)))
    max_minutes = int(data.get("max_minutes", request.args.get("max_minutes", 60)))
    per_day     = int(data.get("per_day",     request.args.get("per_day",     1)))
    pct_planned = float(data.get("pct_planned", request.args.get("pct_planned", 0.7)))
    pct_planned = max(0.0, min(1.0, pct_planned))

    # Catalog of exercises by category with rough ranges for weights (lbs)
    exercise_catalog = {
        "Strength": [
            {"name": "Deadlift",           "w_min": 155, "w_max": 315, "reps_low": 5, "reps_high": 10},
            {"name": "Squat",              "w_min": 135, "w_max": 275, "reps_low": 6, "reps_high": 12},
            {"name": "Flat Bench Press",   "w_min": 95,  "w_max": 225, "reps_low": 6, "reps_high": 12},
            {"name": "Overhead Press",     "w_min": 65,  "w_max": 135, "reps_low": 6, "reps_high": 12},
            {"name": "Incline DB Press",   "w_min": 40,  "w_max": 80,  "reps_low": 8, "reps_high": 12},
            {"name": "Bicep Curls",        "w_min": 20,  "w_max": 50,  "reps_low": 8, "reps_high": 15},
            {"name": "Lat Pulldown",       "w_min": 80,  "w_max": 160, "reps_low": 8, "reps_high": 12},
            {"name": "Leg Press",          "w_min": 180, "w_max": 400, "reps_low": 10,"reps_high": 15},
        ],
        "Cardio": [
            {"name": "Running"},
            {"name": "Cycling"},
            {"name": "Rowing"},
            {"name": "Elliptical"},
            {"name": "Stair Climber"},
        ],
        "Yoga": [
            {"name": "Vinyasa Flow"},
            {"name": "Hatha Sequence"},
            {"name": "Sun Salutations"},
            {"name": "Power Yoga"},
        ],
        "HIIT": [
            {"name": "Burpees"},
            {"name": "Kettlebell Swings"},
            {"name": "Mountain Climbers"},
            {"name": "Jump Squats"},
        ],
    }

    now = datetime.now(ZoneInfo("America/Chicago"))
    created = 0

    for day_offset in range(days):
        # Generate sessions for each day (today, yesterday, ...)
        workout_date_local = now - timedelta(days=day_offset)

        for _ in range(per_day):
            # Pick a top-level category
            workout_type = random.choice(list(exercise_catalog.keys()))
            # Pick a specific exercise in that category
            ex = random.choice(exercise_catalog[workout_type])

            # Duration and calories
            duration_minutes = random.randint(min_minutes, max_minutes)
            calories_burned = random.randint(180, 650)

            # Strength fields vs non-strength
            if workout_type == "Strength":
                sets = random.randint(3, 5)
                reps = random.randint(ex.get("reps_low", 6), ex.get("reps_high", 12))
                weight_lbs = round(random.uniform(ex["w_min"], ex["w_max"]), 1)
            else:
                # For non-strength sessions, sets/reps/weight may be None or lighter defaults
                sets = random.randint(2, 4) if workout_type == "HIIT" else None
                reps = random.randint(10, 20) if workout_type == "HIIT" else None
                weight_lbs = None

            # Mark if this was 'planned' vs 'extra'
            source = "planned" if random.random() < pct_planned else "extra"

            session = WorkoutSession(
                user_id=current_user.id,
                workout_type=workout_type,
                exercise_name=ex["name"],
                sets=sets,
                reps=reps,
                weight_lbs=weight_lbs,
                source=source,
                duration_minutes=duration_minutes,
                calories_burned=calories_burned,
                workout_date=workout_date_local.astimezone(ZoneInfo("UTC")),
            )
            db.session.add(session)
            created += 1

    db.session.commit()
    return jsonify({"message": f"Generated {created} dummy workout sessions across {days} day(s)."}), 201

# Get weekly progress points 
@workout_sessions_bp.route('/weekly', methods=['GET'])
@token_required
def weekly_points(current_user):
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

    # NEW: per-day exercise tracking
    from collections import defaultdict
    day_ex_detail = [defaultdict(lambda: {"sessions": 0, "minutes": 0}) for _ in range(7)]
    day_ex_seen_order = [[] for _ in range(7)]  # keep insertion order per day

    def _uniq_preserve(seq):
        seen = set()
        out = []
        for x in seq:
            if x not in seen:
                out.append(x); seen.add(x)
        return out

    for s in sessions:
        local_dt = s.workout_date.astimezone(ZoneInfo(tz))
        i = local_dt.weekday()
        dur = int(s.duration_minutes or 0)
        minutes[i] += dur
        sess_ct[i] += 1

        ex_name = (s.exercise_name or s.workout_type or "Unknown").strip() or "Unknown"
        day_ex_detail[i][ex_name]["sessions"] += 1
        day_ex_detail[i][ex_name]["minutes"] += dur
        day_ex_seen_order[i].append(ex_name)

    points = []
    for i in range(7):
        # unique list of exercises in order of first appearance that day
        workouts_list = _uniq_preserve(day_ex_seen_order[i])
        exercises_detail = [
            {"name": name,
             "sessions": day_ex_detail[i][name]["sessions"],
             "minutes": day_ex_detail[i][name]["minutes"]}
            for name in workouts_list
        ]
        points.append({
            "label": labels[i],
            "minutes": minutes[i],
            "sessions": sess_ct[i],
            "workouts": workouts_list,        
            "exercises": exercises_detail 
        })

    return jsonify({
        "user_id": str(current_user.id),
        "week_start": local_start.date().isoformat(),
        "points": points
    }), 200
    
# Histogram of workout types

@workout_sessions_bp.route('/history/weeks', methods=['GET'])
@token_required
def weeks_history(current_user):
    tz = request.args.get('tz') or "America/Chicago"
    n = request.args.get('n', default=8, type=int)  

    now_local = datetime.now(ZoneInfo(tz))
    start_monday = now_local.date() - timedelta(days=now_local.weekday())
    first_monday = start_monday - timedelta(days=7*(n-1))

    first_local = datetime(first_monday.year, first_monday.month, first_monday.day, 0, 0, 0, tzinfo=ZoneInfo(tz))
    last_local = datetime(start_monday.year, start_monday.month, start_monday.day, 0, 0, 0, tzinfo=ZoneInfo(tz)) + timedelta(days=7)
    start_utc = first_local.astimezone(ZoneInfo("UTC"))
    end_utc = last_local.astimezone(ZoneInfo("UTC"))

    sessions = (WorkoutSession.query
                .filter(WorkoutSession.user_id == current_user.id)
                .filter(WorkoutSession.workout_date >= start_utc)
                .filter(WorkoutSession.workout_date < end_utc)
                .all())

    labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

    # Week buckets -> day buckets -> exercise aggregates
    from collections import defaultdict
    weeks = {}  # key = monday iso -> structure

    def _ensure_week(key):
        if key not in weeks:
            weeks[key] = {
                "week_start": key,
                "points": [{
                    "label": labels[i],
                    "minutes": 0,
                    "sessions": 0,
                    "workouts": [],
                    "exercises": []  # will fill later
                } for i in range(7)],
                "_per_day_ex": [defaultdict(lambda: {"sessions": 0, "minutes": 0}) for _ in range(7)],
                "_per_day_seen": [[] for _ in range(7)]
            }

    for s in sessions:
        local_dt = s.workout_date.astimezone(ZoneInfo(tz))
        monday = local_dt.date() - timedelta(days=local_dt.weekday())
        key = monday.isoformat()
        _ensure_week(key)

        i = local_dt.weekday()
        dur = int(s.duration_minutes or 0)
        weeks[key]["points"][i]["minutes"] += dur
        weeks[key]["points"][i]["sessions"] += 1

        ex_name = (s.exercise_name or s.workout_type or "Unknown").strip() or "Unknown"
        weeks[key]["_per_day_ex"][i][ex_name]["sessions"] += 1
        weeks[key]["_per_day_ex"][i][ex_name]["minutes"] += dur
        weeks[key]["_per_day_seen"][i].append(ex_name)

    # finalize workouts/exercises lists and fill empty weeks
    def _uniq_preserve(seq):
        seen = set()
        out = []
        for x in seq:
            if x not in seen:
                out.append(x); seen.add(x)
        return out

    ordered = []
    for k in range(n):
        monday = (start_monday - timedelta(days=7*(n-1-k))).isoformat()
        if monday not in weeks:
            # empty week
            ordered.append({
                "week_start": monday,
                "points": [{
                    "label": labels[i],
                    "minutes": 0,
                    "sessions": 0,
                    "workouts": [],
                    "exercises": []
                } for i in range(7)]
            })
        else:
            wk = weeks[monday]
            for i in range(7):
                workouts_list = _uniq_preserve(wk["_per_day_seen"][i])
                wk["points"][i]["workouts"] = workouts_list
                wk["points"][i]["exercises"] = [
                    {"name": name,
                     "sessions": wk["_per_day_ex"][i][name]["sessions"],
                     "minutes": wk["_per_day_ex"][i][name]["minutes"]}
                    for name in workouts_list
                ]
            # strip internal helpers
            wk.pop("_per_day_ex", None)
            wk.pop("_per_day_seen", None)
            ordered.append(wk)

    return jsonify({"weeks": ordered}), 200
    
    

# Monthly summary of workout sessions
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


# Generate a week of random workout sessions
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

# # Distinct exercise names for the logged-in user
@workout_sessions_bp.route('/exercise/names', methods=['GET'])
@token_required
def list_exercise_names(current_user):
    """
    Returns distinct exercise names for the logged-in user.
    Response: { "exercises": ["Bench Press", "Deadlift", ...] }
    """
    rows = (
        db.session.query(WorkoutSession.exercise_name)
        .filter(WorkoutSession.user_id == current_user.id)
        .filter(WorkoutSession.exercise_name.isnot(None))
        .distinct()
        .order_by(WorkoutSession.exercise_name.asc())
        .all()
    )
    names = [r[0] for r in rows if (r and r[0])]
    return jsonify({"exercises": names}), 200


# Exercise trend time series
@workout_sessions_bp.route('/exercise/trend', methods=['GET'])
@token_required
def exercise_trend(current_user):
    """
    Query params:
      - exercise: string (required)  e.g. "Flat Bench Press"
      - metric: one of [1rm, max_weight, avg_weight, total_volume, total_reps] (default: 1rm)
      - group_by: one of [day, week, month] (default: day)
      - tz: IANA timezone (default: America/Chicago)
      - from: ISO date/datetime (optional, default: now-90d)  e.g. 2025-05-01 or 2025-05-01T00:00:00-05:00
      - to:   ISO date/datetime (optional, default: now)

    Response:
    {
      "exercise": "Flat Bench Press",
      "metric": "1rm",
      "group_by": "day",
      "points": [
        {"bucket": "2025-08-01", "value": 185.5, "max_weight": 185.0, "total_reps": 24, "total_volume": 8880.0},
        ...
      ]
    }
    """
    from collections import defaultdict

    exercise = (request.args.get("exercise") or "").strip()
    if not exercise:
        return jsonify({"error": "Missing ?exercise"}), 400

    metric = (request.args.get("metric") or "1rm").lower()
    if metric not in {"1rm", "max_weight", "avg_weight", "total_volume", "total_reps"}:
        return jsonify({"error": "Invalid metric"}), 400

    group_by = (request.args.get("group_by") or "day").lower()
    if group_by not in {"day", "week", "month"}:
        return jsonify({"error": "Invalid group_by"}), 400

    tz = request.args.get("tz") or "America/Chicago"

    # Parse range (defaults to last 90 days)
    to_q = request.args.get("to")
    from_q = request.args.get("from")

    to_utc = _parse_iso_dt_to_utc(to_q) if to_q else datetime.utcnow().replace(tzinfo=ZoneInfo("UTC"))
    from_utc = _parse_iso_dt_to_utc(from_q) if from_q else (to_utc - timedelta(days=90))

    # Pull sessions for this exercise & user in range
    # NOTE: ilike (case-insensitive exact match) is fine here; you can switch to == for strict case-sensitive match.
    q = (
        WorkoutSession.query
        .filter(WorkoutSession.user_id == current_user.id)
        .filter(WorkoutSession.workout_date >= from_utc)
        .filter(WorkoutSession.workout_date <= to_utc)
        .filter(WorkoutSession.exercise_name.isnot(None))
        .filter(WorkoutSession.exercise_name.ilike(exercise))
    )

    sessions = q.all()
    if not sessions:
        return jsonify({
            "exercise": exercise,
            "metric": metric,
            "group_by": group_by,
            "points": []
        }), 200

    tzinfo = ZoneInfo(tz)

    # Bucket helper
    def bucket_key(dt_utc):
        local = dt_utc.astimezone(tzinfo)
        if group_by == "day":
            return local.strftime("%Y-%m-%d")
        elif group_by == "week":
            monday = (local.date() - timedelta(days=local.weekday()))
            return monday.strftime("%Y-%m-%d")
        else:  # month
            return local.replace(day=1).strftime("%Y-%m-01")

    # Aggregate per bucket
    buckets = defaultdict(list)

    for s in sessions:
        # Session-level fields; strength sessions have sets/reps/weight_lbs
        reps = int(s.reps or 0)
        sets = int(s.sets or 0)
        weight = float(s.weight_lbs or 0.0)
        # Treat missing sets as 1 when reps/weight are present
        eff_sets = sets if sets > 0 else (1 if (reps > 0 or weight > 0) else 0)

        buckets[bucket_key(s.workout_date)].append({
            "reps": reps,
            "sets": eff_sets,
            "weight": weight
        })

    def epley_1rm(weight_lbs: float, reps: int) -> float:
        # Epley formula (lbs)
        if weight_lbs <= 0 or reps <= 0:
            return 0.0
        return weight_lbs * (1.0 + reps / 30.0)

    points = []
    for bkey in sorted(buckets.keys()):
        sets_list = buckets[bkey]

        total_reps = sum(item["reps"] * max(item["sets"], 1) for item in sets_list)
        total_volume = sum(item["reps"] * max(item["sets"], 1) * item["weight"] for item in sets_list)

        weights = [item["weight"] for item in sets_list if item["weight"] > 0]
        max_weight = max(weights) if weights else 0.0
        avg_weight = (sum(weights) / len(weights)) if weights else 0.0

        # Best single-set 1RM estimate across the bucket
        best_1rm = 0.0
        for item in sets_list:
            best_1rm = max(best_1rm, epley_1rm(item["weight"], item["reps"]))

        if metric == "1rm":
            value = round(best_1rm, 2)
        elif metric == "max_weight":
            value = round(max_weight, 2)
        elif metric == "avg_weight":
            value = round(avg_weight, 2)
        elif metric == "total_volume":
            value = round(total_volume, 2)
        else:  # total_reps
            value = int(total_reps)

        points.append({
            "bucket": bkey,
            "value": value,
            "max_weight": round(max_weight, 2),
            "total_reps": int(total_reps),
            "total_volume": round(total_volume, 2),
        })

    return jsonify({
        "exercise": exercise,
        "metric": metric,
        "group_by": group_by,
        "points": points
    }), 200

