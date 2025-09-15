# backend/appointments/routes.py

from flask import Blueprint, request, jsonify
from extensions import db
from appointments.models import CalendarEvent, EmailLog
from utils.decorators import token_required
from admin.decorators import admin_token_required
from appointments.email_utils import send_email
from dateutil import parser  # ✅ robust ISO8601 parsing

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


@appointments_bp.route("/book", methods=["POST"])
@token_required
def book_event(current_user):
    data = request.get_json()
    required_fields = ["title", "event_type", "start_time", "end_time"]
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    if data["event_type"] not in VALID_EVENT_TYPES:
        return jsonify({
            "error": f"Invalid event_type. Must be one of {', '.join(VALID_EVENT_TYPES)}"
        }), 400

    try:
        start_time = parser.isoparse(data["start_time"])
        end_time = parser.isoparse(data["end_time"])
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
    required_fields = [
        "title", "event_type", "start_time", "end_time",
        "guest_name", "guest_email", "guest_phone"
    ]
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    if data["event_type"] not in VALID_EVENT_TYPES:
        return jsonify({
            "error": f"Invalid event_type. Must be one of {', '.join(VALID_EVENT_TYPES)}"
        }), 400

    try:
        start_time = parser.isoparse(data["start_time"])
        end_time = parser.isoparse(data["end_time"])
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

    email_body = f"""
    Hi {event.guest_name},

    Your {event.event_type} has been scheduled:
    - Title: {event.title}
    - Date: {event.start_time.strftime('%b %d, %Y %I:%M %p')} - {event.end_time.strftime('%I:%M %p')}
    - Location: {"Gym" if event.event_type == "tour" else "Video Link will be sent"}

    Thank you for taking the time to check out our facility.
    © FitByLena 2025
    """

    success, error_msg = send_email(
        to_address=event.guest_email,
        subject="Your Tour/Meeting is Confirmed",
        body=email_body
    )

    log = EmailLog(
        recipient=event.guest_email,
        subject="Your Tour/Meeting is Confirmed",
        body=email_body,
        status="sent" if success else "failed",
        error_message=error_msg
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({
        "message": "Guest event booked",
        "event": event.serialize(),
        "email_sent": success
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
            return jsonify({
                "error": f"Invalid event_type. Must be one of {', '.join(VALID_EVENT_TYPES)}"
            }), 400
        event.event_type = data["event_type"]

    if "start_time" in data:
        try:
            event.start_time = parser.isoparse(data["start_time"])
        except Exception:
            return jsonify({"error": "Invalid start_time format. Use ISO8601."}), 400

    if "end_time" in data:
        try:
            event.end_time = parser.isoparse(data["end_time"])
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
            return jsonify({
                "error": f"Invalid event_type. Must be one of {', '.join(VALID_EVENT_TYPES)}"
            }), 400
        event.event_type = data["event_type"]

    if "start_time" in data:
        try:
            event.start_time = parser.isoparse(data["start_time"])
        except Exception:
            return jsonify({"error": "Invalid start_time format. Use ISO8601."}), 400

    if "end_time" in data:
        try:
            event.end_time = parser.isoparse(data["end_time"])
        except Exception:
            return jsonify({"error": "Invalid end_time format. Use ISO8601."}), 400

    db.session.commit()
    return jsonify({"message": "Event updated by admin", "event": event.serialize()}), 200


@appointments_bp.route("/admin/delete/<event_id>", methods=["DELETE"])
@admin_token_required
def admin_delete_event(current_admin, event_id):
    event = CalendarEvent.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    db.session.delete(event)
    db.session.commit()
    return jsonify({"message": "Event deleted by admin", "event_id": str(event.id)}), 200


# -------------------------
# ADMIN: VIEW EMAIL LOGS
# -------------------------
@appointments_bp.route("/admin/email-logs", methods=["GET"])
@admin_token_required
def get_email_logs(current_admin):
    query = EmailLog.query

    status = request.args.get("status")
    if status:
        query = query.filter_by(status=status)

    recipient = request.args.get("recipient")
    if recipient:
        query = query.filter_by(recipient=recipient)

    logs = query.order_by(EmailLog.created_at.desc()).all()

    results = []
    for log in logs:
        results.append({
            "id": str(log.id),
            "recipient": log.recipient,
            "subject": log.subject,
            "status": log.status,
            "error_message": log.error_message,
            "created_at_display": log.created_at.strftime("%b %d, %Y %I:%M %p"),
            "created_at_iso": log.created_at.isoformat()
        })

    return jsonify(results), 200


# -------------------------
# ADMIN RESPOND TO APPOINTMENT
# -------------------------
@appointments_bp.route("/admin/respond/<event_id>", methods=["POST"])
@admin_token_required
def admin_respond_to_event(current_admin, event_id):
    event = CalendarEvent.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    data = request.get_json()
    action = data.get("action")  # "approve", "decline", "reschedule"
    note = data.get("note", "")

    if action not in ["approve", "decline", "reschedule"]:
        return jsonify({"error": "Invalid action. Must be approve, decline, or reschedule"}), 400

    if action == "approve":
        event.status = "approved"
    elif action == "decline":
        event.status = "declined"
    elif action == "reschedule":
        event.status = "rescheduled"
        if "start_time" in data and "end_time" in data:
            try:
                event.start_time = parser.isoparse(data["start_time"])
                event.end_time = parser.isoparse(data["end_time"])
            except Exception:
                return jsonify({"error": "Invalid datetime format. Use ISO8601."}), 400

    db.session.commit()

    recipient = event.guest_email or (event.user.email if event.user else None)
    if recipient:
        email_body = f"""
        Hi {event.guest_name or event.user.email},

        Your appointment "{event.title}" ({event.event_type}) has been {event.status}.
        
        {f"Note from admin: {note}" if note else ""}

        Date: {event.start_time.strftime('%b %d, %Y %I:%M %p')} - {event.end_time.strftime('%I:%M %p')}

        Thank you,
        FitByLena Team
        """

        send_email(
            to_address=recipient,
            subject=f"Your Appointment has been {event.status.capitalize()}",
            body=email_body
        )

    return jsonify({
        "message": f"Event {event.status}",
        "event": event.serialize()
    }), 200
    
    # -------------------------
# ADMIN: VIEW ALL EVENTS
# -------------------------
@appointments_bp.route("/admin/all-events", methods=["GET"])
@admin_token_required
def admin_get_all_events(current_admin):
    events = CalendarEvent.query.order_by(CalendarEvent.start_time.asc()).all()

    results = []
    for e in events:
        results.append({
            "id": str(e.id),
            "title": e.title,
            "description": e.description,
            "start_time": e.start_time.isoformat(),
            "end_time": e.end_time.isoformat(),
            "status": e.status,
            "event_type": e.event_type,
            # ✅ Unified naming
            "userName": e.user.full_name if e.user else e.guest_name,
            "userEmail": e.user.email if e.user else e.guest_email,
        })

    return jsonify(results), 200

