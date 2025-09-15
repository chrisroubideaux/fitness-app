# backend/appointments/routes.py

from flask import Blueprint, request, jsonify
from datetime import datetime
from extensions import db
from appointments.models import CalendarEvent
from utils.decorators import token_required
from admin.decorators import admin_token_required
from appointments.email_utils import send_email

appointments_bp = Blueprint("appointments", __name__, url_prefix="/api/appointments")

# Allowed event types
VALID_EVENT_TYPES = {"workout", "in_person", "video_chat", "tour"}


# -------------------------
# USER ROUTES
# -------------------------
@appointments_bp.route("/my-events", methods=["GET"])
@token_required
def get_my_events(current_user):
    events = CalendarEvent.query.filter_by(user_id=current_user.id).all()
    return jsonify([e.serialize() for e in events]), 200

# book event (user)

@appointments_bp.route("/book", methods=["POST"])
@token_required
def book_event(current_user):
    data = request.get_json()

    required_fields = ["title", "event_type", "start_time", "end_time"]
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    if data["event_type"] not in VALID_EVENT_TYPES:
        return jsonify({"error": f"Invalid event_type. Must be one of {', '.join(VALID_EVENT_TYPES)}"}), 400

    try:
        start_time = datetime.fromisoformat(data["start_time"])
        end_time = datetime.fromisoformat(data["end_time"])
    except Exception:
        return jsonify({"error": "Invalid datetime format. Use ISO8601."}), 400

    event = CalendarEvent(
        title=data["title"],
        description=data.get("description"),
        event_type=data["event_type"],
        start_time=start_time,
        end_time=end_time,
        user_id=current_user.id,
        admin_id=data.get("admin_id"),
    )

    db.session.add(event)
    db.session.commit()

    return jsonify({"message": "Event booked", "event": event.serialize()}), 201


# -------------------------
# GUEST ROUTES
# -------------------------

@appointments_bp.route("/guest/book", methods=["POST"])
def guest_book_event():
    data = request.get_json()

    required_fields = ["title", "event_type", "start_time", "end_time", "guest_name", "guest_email", "guest_phone"]
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    if data["event_type"] not in VALID_EVENT_TYPES:
        return jsonify({"error": f"Invalid event_type. Must be one of {', '.join(VALID_EVENT_TYPES)}"}), 400

    try:
        start_time = datetime.fromisoformat(data["start_time"])
        end_time = datetime.fromisoformat(data["end_time"])
    except Exception:
        return jsonify({"error": "Invalid datetime format. Use ISO8601."}), 400

    event = CalendarEvent(
        title=data["title"],
        description=data.get("description"),
        event_type=data["event_type"],
        start_time=start_time,
        end_time=end_time,
        guest_name=data["guest_name"],
        guest_email=data["guest_email"],
        guest_phone=data["guest_phone"],
        admin_id=data.get("admin_id"),
    )

    db.session.add(event)
    db.session.commit()

    # ✅ Try sending confirmation email
    email_body = f"""
    Hi {event.guest_name},

    Your {event.event_type} has been scheduled:
    - Title: {event.title}
    - Date: {event.start_time}
    - Location: {"Gym" if event.event_type == "tour" else "Video Link will be sent"}

    Thank you for taking the time to check out our facility.
    © FitByLena 2025
    """

    email_sent = send_email(
        to_address=event.guest_email,
        subject="Your Tour/Meeting is Confirmed",
        body=email_body
    )

    return jsonify({
        "message": "Guest event booked",
        "event": event.serialize(),
        "email_sent": email_sent
    }), 201



# -------------------------
# UPDATE APPOINTMENT (User)
# -------------------------

@appointments_bp.route("/update/<event_id>", methods=["PUT"])
@token_required
def update_event(current_user, event_id):
    event = CalendarEvent.query.filter_by(id=event_id, user_id=current_user.id).first()
    if not event:
        return jsonify({"error": "Event not found or not authorized"}), 404

    data = request.get_json()

    if "title" in data:
        event.title = data["title"]
    if "description" in data:
        event.description = data["description"]
    if "event_type" in data:
        if data["event_type"] not in VALID_EVENT_TYPES:
            return jsonify({"error": f"Invalid event_type. Must be one of {', '.join(VALID_EVENT_TYPES)}"}), 400
        event.event_type = data["event_type"]

    if "start_time" in data:
        try:
            event.start_time = datetime.fromisoformat(data["start_time"])
        except Exception:
            return jsonify({"error": "Invalid start_time format. Use ISO8601."}), 400

    if "end_time" in data:
        try:
            event.end_time = datetime.fromisoformat(data["end_time"])
        except Exception:
            return jsonify({"error": "Invalid end_time format. Use ISO8601."}), 400

    db.session.commit()
    return jsonify({"message": "Event updated", "event": event.serialize()}), 200


# -------------------------
# DELETE APPOINTMENT (User)
# -------------------------

@appointments_bp.route("/delete/<event_id>", methods=["DELETE"])
@token_required
def delete_event(current_user, event_id):
    event = CalendarEvent.query.filter_by(id=event_id, user_id=current_user.id).first()
    if not event:
        return jsonify({"error": "Event not found or not authorized"}), 404

    db.session.delete(event)
    db.session.commit()
    return jsonify({"message": "Event deleted", "event_id": str(event.id)}), 200


# -------------------------
# ADMIN UPDATE / DELETE
# -------------------------

@appointments_bp.route("/admin/update/<event_id>", methods=["PUT"])
@admin_token_required
def admin_update_event(current_admin, event_id):
    event = CalendarEvent.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    data = request.get_json()

    if "title" in data:
        event.title = data["title"]
    if "description" in data:
        event.description = data["description"]
    if "event_type" in data:
        if data["event_type"] not in VALID_EVENT_TYPES:
            return jsonify({"error": f"Invalid event_type. Must be one of {', '.join(VALID_EVENT_TYPES)}"}), 400
        event.event_type = data["event_type"]

    if "start_time" in data:
        try:
            event.start_time = datetime.fromisoformat(data["start_time"])
        except Exception:
            return jsonify({"error": "Invalid start_time format. Use ISO8601."}), 400

    if "end_time" in data:
        try:
            event.end_time = datetime.fromisoformat(data["end_time"])
        except Exception:
            return jsonify({"error": "Invalid end_time format. Use ISO8601."}), 400

    db.session.commit()
    return jsonify({"message": "Event updated by admin", "event": event.serialize()}), 200


# --admin delete event

@appointments_bp.route("/admin/delete/<event_id>", methods=["DELETE"])
@admin_token_required
def admin_delete_event(current_admin, event_id):
    event = CalendarEvent.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    db.session.delete(event)
    db.session.commit()
    return jsonify({"message": "Event deleted by admin", "event_id": str(event.id)}), 200
