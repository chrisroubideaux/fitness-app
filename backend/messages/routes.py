# messages/routes.py
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta, timezone
from uuid import UUID as UUIDType

from extensions import db
from messages.models import Conversation, Message
from admin.models import Admin
from users.models import User
from messages.auth import resolve_principal, AuthError

messages_bp = Blueprint("messages", __name__, url_prefix="/api/messages")

# ---------------------------------
# Helpers
# ---------------------------------

EDIT_GRACE = timedelta(minutes=15)

def _now_utc():
    return datetime.now(timezone.utc)

def _iso_z(dt):
    """Serialize any datetime to ISO8601 UTC with Z."""
    if not dt:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")

def _serialize_conversation(c: Conversation, viewer_kind: str):
    """Return a dict for a conversation depending on who is viewing (admin vs user)."""
    u = User.query.get(c.user_id)
    a = Admin.query.get(c.admin_id)

    if viewer_kind == "admin":
        peer = (u.full_name or u.email or "User") if u else "User"
        unread = c.admin_unread_count
    else:
        peer = (a.full_name or "Coach/Admin") if a else "Coach/Admin"
        unread = c.user_unread_count

    return {
        "id": str(c.id),
        "user_id": str(c.user_id),
        "admin_id": str(c.admin_id),
        "peer_display_name": peer,
        "unread_count": unread,
        "last_message_at": _iso_z(c.last_message_at),
        "created_at": _iso_z(c.created_at),

        # ✅ Added profile image URLs for frontend
        "user_profile_image_url": u.profile_image_url if u else None,
        "admin_profile_image_url": a.profile_image_url if a else None,
    }

def _serialize_message(m: Message):
    return {
        "id": str(m.id),
        "conversation_id": str(m.conversation_id),
        "sender_role": m.sender_role,
        "body": m.body,
        "created_at": _iso_z(m.created_at),
        "read_by_user_at": _iso_z(m.read_by_user_at),
        "read_by_admin_at": _iso_z(m.read_by_admin_at),
    }

def _ensure_uuid(v, name="id"):
    try:
        return UUIDType(str(v))
    except Exception:
        from werkzeug.exceptions import BadRequest
        raise BadRequest(f"Invalid {name}")

def _get_or_create_conversation(user_id, admin_id) -> Conversation:
    conv = Conversation.query.filter_by(user_id=user_id, admin_id=admin_id).one_or_none()
    if conv:
        return conv
    conv = Conversation(user_id=user_id, admin_id=admin_id, last_message_at=_now_utc())
    db.session.add(conv)
    db.session.commit()
    return conv

def _assert_member(conv: Conversation, kind: str, me) -> bool:
    if kind == "admin" and conv.admin_id != me.id:
        return False
    if kind == "user" and conv.user_id != me.id:
        return False
    return True

def _bump_unread_after_send(conv: Conversation, sender_kind: str):
    if sender_kind == "admin":
        conv.user_unread_count += 1
    else:
        conv.admin_unread_count += 1
    conv.last_message_at = _now_utc()

# ---------------------------------
# Conversation Routes
# ---------------------------------

@messages_bp.route("/conversations", methods=["GET"])
def list_conversations():
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    q = Conversation.query
    if kind == "admin":
        q = q.filter(Conversation.admin_id == me.id, Conversation.hidden_for_admin_at.is_(None))
    else:
        q = q.filter(Conversation.user_id == me.id, Conversation.hidden_for_user_at.is_(None))

    limit = max(1, min(int(request.args.get("limit", 20)), 100))
    offset = max(0, int(request.args.get("offset", 0)))

    items = q.order_by(Conversation.last_message_at.desc().nullslast()).offset(offset).limit(limit).all()
    return jsonify([_serialize_conversation(c, kind) for c in items]), 200


@messages_bp.route("/conversations", methods=["POST"])
def create_or_fetch_conversation():
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    data = request.get_json() or {}
    if kind == "admin":
        user_id = data.get("user_id")
        _ensure_uuid(user_id, "user_id")
        if not User.query.get(user_id):
            return jsonify({"error": "User not found"}), 404
        conv = _get_or_create_conversation(user_id=user_id, admin_id=me.id)
        conv.hidden_for_admin_at = None
    else:
        admin_id = data.get("admin_id")
        _ensure_uuid(admin_id, "admin_id")
        if not Admin.query.get(admin_id):
            return jsonify({"error": "Admin not found"}), 404
        conv = _get_or_create_conversation(user_id=me.id, admin_id=admin_id)
        conv.hidden_for_user_at = None

    db.session.commit()
    return jsonify(_serialize_conversation(conv, kind)), 200


@messages_bp.route("/conversations/<uuid:conversation_id>", methods=["GET"])
def get_conversation(conversation_id):
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    conv = Conversation.query.get_or_404(conversation_id)
    if not _assert_member(conv, kind, me):
        return jsonify({"error": "Forbidden"}), 403
    return jsonify(_serialize_conversation(conv, kind)), 200


@messages_bp.route("/conversations/<uuid:conversation_id>", methods=["DELETE"])
def delete_conversation(conversation_id):
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    conv = Conversation.query.get_or_404(conversation_id)
    if not _assert_member(conv, kind, me):
        return jsonify({"error": "Forbidden"}), 403

    now = _now_utc()
    mode = (request.args.get("for") or "me").lower()

    if mode == "everyone":
        if kind != "admin":
            return jsonify({"error": "Only admin can hide for everyone"}), 403
        conv.hidden_for_admin_at = now
        conv.hidden_for_user_at = now
    else:
        if kind == "admin":
            conv.hidden_for_admin_at = now
        else:
            conv.hidden_for_user_at = now

    db.session.commit()
    return jsonify({"ok": True}), 200

# ---------------------------------
# Message Routes
# ---------------------------------

@messages_bp.route("/conversations/<uuid:conversation_id>/messages", methods=["GET"])
def list_messages(conversation_id):
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    conv = Conversation.query.get_or_404(conversation_id)
    if not _assert_member(conv, kind, me):
        return jsonify({"error": "Forbidden"}), 403

    limit = max(1, min(int(request.args.get("limit", 30)), 100))
    before_iso = request.args.get("before")

    q = Message.query.filter(Message.conversation_id == conv.id, Message.moderation_deleted_at.is_(None))
    if kind == "admin":
        q = q.filter(Message.deleted_for_admin_at.is_(None))
    else:
        q = q.filter(Message.deleted_for_user_at.is_(None))

    if before_iso:
        try:
            parsed = before_iso.replace("Z", "+00:00") if before_iso.endswith("Z") else before_iso
            before_dt = datetime.fromisoformat(parsed)
            if before_dt.tzinfo is None:
                before_dt = before_dt.replace(tzinfo=timezone.utc)
            q = q.filter(Message.created_at < before_dt)
        except Exception:
            pass

    msgs = q.order_by(Message.created_at.desc()).limit(limit).all()
    msgs = list(reversed(msgs))  # ascending order
    return jsonify([_serialize_message(m) for m in msgs]), 200


@messages_bp.route("/send", methods=["POST"])
def send_message():
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    data = request.get_json() or {}
    body = (data.get("body") or "").strip()
    if not body:
        return jsonify({"error": "Message body is required"}), 400

    conv = None
    conv_id = data.get("conversation_id")
    if conv_id:
        _ensure_uuid(conv_id, "conversation_id")
        conv = Conversation.query.get(conv_id)
        if not conv:
            return jsonify({"error": "Conversation not found"}), 404
        if not _assert_member(conv, kind, me):
            return jsonify({"error": "Forbidden"}), 403
        if kind == "admin":
            conv.hidden_for_admin_at = None
        else:
            conv.hidden_for_user_at = None
    else:
        if kind == "admin":
            user_id = data.get("user_id")
            _ensure_uuid(user_id, "user_id")
            if not User.query.get(user_id):
                return jsonify({"error": "User not found"}), 404
            conv = _get_or_create_conversation(user_id=user_id, admin_id=me.id)
            conv.hidden_for_admin_at = None
        else:
            admin_id = data.get("admin_id")
            _ensure_uuid(admin_id, "admin_id")
            if not Admin.query.get(admin_id):
                return jsonify({"error": "Admin not found"}), 404
            conv = _get_or_create_conversation(user_id=me.id, admin_id=admin_id)
            conv.hidden_for_user_at = None

    msg = Message(
        conversation_id=conv.id,
        sender_role=kind,
        sender_user_id=me.id if kind == "user" else None,
        sender_admin_id=me.id if kind == "admin" else None,
        body=body,
    )
    db.session.add(msg)
    _bump_unread_after_send(conv, kind)
    db.session.commit()

    return jsonify(_serialize_message(msg)), 201


@messages_bp.route("/conversations/<uuid:conversation_id>/read", methods=["POST"])
def mark_read(conversation_id):
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    conv = Conversation.query.get_or_404(conversation_id)
    if not _assert_member(conv, kind, me):
        return jsonify({"error": "Forbidden"}), 403

    now = _now_utc()
    q = Message.query.filter(Message.conversation_id == conv.id, Message.moderation_deleted_at.is_(None))

    if kind == "admin":
        for m in q.filter(Message.read_by_admin_at.is_(None)).all():
            m.read_by_admin_at = now
        conv.admin_unread_count = 0
    else:
        for m in q.filter(Message.read_by_user_at.is_(None)).all():
            m.read_by_user_at = now
        conv.user_unread_count = 0

    db.session.commit()
    return jsonify({"ok": True, "read_at": _iso_z(now)}), 200



"""""
# messages/routes.py

# messages/routes.py
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta, timezone
from uuid import UUID as UUIDType

from extensions import db
from messages.models import Conversation, Message
from admin.models import Admin
from users.models import User
from messages.auth import resolve_principal, AuthError

messages_bp = Blueprint("messages", __name__, url_prefix="/api/messages")

# ---------------------------------
# Helpers
# ---------------------------------

EDIT_GRACE = timedelta(minutes=15)

def _now_utc():
    return datetime.now(timezone.utc)

def _iso_z(dt):
   
    if not dt:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")

def _serialize_conversation(c: Conversation, viewer_kind: str):
  
    if viewer_kind == "admin":
        u = User.query.get(c.user_id)
        peer = (u.full_name or u.email or "User") if u else "User"
        unread = c.admin_unread_count
    else:
        a = Admin.query.get(c.admin_id)
        peer = (a.full_name or "Coach/Admin") if a else "Coach/Admin"
        unread = c.user_unread_count

    return {
        "id": str(c.id),
        "user_id": str(c.user_id),
        "admin_id": str(c.admin_id),
        "peer_display_name": peer,
        "unread_count": unread,
        "last_message_at": _iso_z(c.last_message_at),
        "created_at": _iso_z(c.created_at),
    }

def _serialize_message(m: Message):
    return {
        "id": str(m.id),
        "conversation_id": str(m.conversation_id),
        "sender_role": m.sender_role,
        "body": m.body,
        "created_at": _iso_z(m.created_at),
        "read_by_user_at": _iso_z(m.read_by_user_at),
        "read_by_admin_at": _iso_z(m.read_by_admin_at),
    }

def _ensure_uuid(v, name="id"):
    try:
        return UUIDType(str(v))
    except Exception:
        from werkzeug.exceptions import BadRequest
        raise BadRequest(f"Invalid {name}")

def _get_or_create_conversation(user_id, admin_id) -> Conversation:
    conv = Conversation.query.filter_by(user_id=user_id, admin_id=admin_id).one_or_none()
    if conv:
        return conv
    conv = Conversation(user_id=user_id, admin_id=admin_id, last_message_at=_now_utc())
    db.session.add(conv)
    db.session.commit()
    return conv

def _assert_member(conv: Conversation, kind: str, me) -> bool:
    if kind == "admin" and conv.admin_id != me.id:
        return False
    if kind == "user" and conv.user_id != me.id:
        return False
    return True

def _bump_unread_after_send(conv: Conversation, sender_kind: str):
    if sender_kind == "admin":
        conv.user_unread_count += 1
    else:
        conv.admin_unread_count += 1
    conv.last_message_at = _now_utc()

# ---------------------------------
# Conversation Routes
# ---------------------------------

@messages_bp.route("/conversations", methods=["GET"])
def list_conversations():
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    q = Conversation.query
    if kind == "admin":
        q = q.filter(Conversation.admin_id == me.id, Conversation.hidden_for_admin_at.is_(None))
    else:
        q = q.filter(Conversation.user_id == me.id, Conversation.hidden_for_user_at.is_(None))

    limit = max(1, min(int(request.args.get("limit", 20)), 100))
    offset = max(0, int(request.args.get("offset", 0)))

    items = q.order_by(Conversation.last_message_at.desc().nullslast()).offset(offset).limit(limit).all()
    return jsonify([_serialize_conversation(c, kind) for c in items]), 200


@messages_bp.route("/conversations", methods=["POST"])
def create_or_fetch_conversation():
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    data = request.get_json() or {}
    if kind == "admin":
        user_id = data.get("user_id")
        _ensure_uuid(user_id, "user_id")
        if not User.query.get(user_id):
            return jsonify({"error": "User not found"}), 404
        conv = _get_or_create_conversation(user_id=user_id, admin_id=me.id)
        conv.hidden_for_admin_at = None
    else:
        admin_id = data.get("admin_id")
        _ensure_uuid(admin_id, "admin_id")
        if not Admin.query.get(admin_id):
            return jsonify({"error": "Admin not found"}), 404
        conv = _get_or_create_conversation(user_id=me.id, admin_id=admin_id)
        conv.hidden_for_user_at = None

    db.session.commit()
    return jsonify(_serialize_conversation(conv, kind)), 200


@messages_bp.route("/conversations/<uuid:conversation_id>", methods=["GET"])
def get_conversation(conversation_id):
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    conv = Conversation.query.get_or_404(conversation_id)
    if not _assert_member(conv, kind, me):
        return jsonify({"error": "Forbidden"}), 403
    return jsonify(_serialize_conversation(conv, kind)), 200


@messages_bp.route("/conversations/<uuid:conversation_id>", methods=["DELETE"])
def delete_conversation(conversation_id):
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    conv = Conversation.query.get_or_404(conversation_id)
    if not _assert_member(conv, kind, me):
        return jsonify({"error": "Forbidden"}), 403

    now = _now_utc()
    mode = (request.args.get("for") or "me").lower()

    if mode == "everyone":
        if kind != "admin":
            return jsonify({"error": "Only admin can hide for everyone"}), 403
        conv.hidden_for_admin_at = now
        conv.hidden_for_user_at = now
    else:
        if kind == "admin":
            conv.hidden_for_admin_at = now
        else:
            conv.hidden_for_user_at = now

    db.session.commit()
    return jsonify({"ok": True}), 200

# ---------------------------------
# Message Routes
# ---------------------------------

@messages_bp.route("/conversations/<uuid:conversation_id>/messages", methods=["GET"])
def list_messages(conversation_id):
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    conv = Conversation.query.get_or_404(conversation_id)
    if not _assert_member(conv, kind, me):
        return jsonify({"error": "Forbidden"}), 403

    limit = max(1, min(int(request.args.get("limit", 30)), 100))
    before_iso = request.args.get("before")

    q = Message.query.filter(Message.conversation_id == conv.id, Message.moderation_deleted_at.is_(None))
    if kind == "admin":
        q = q.filter(Message.deleted_for_admin_at.is_(None))
    else:
        q = q.filter(Message.deleted_for_user_at.is_(None))

    if before_iso:
        try:
            parsed = before_iso.replace("Z", "+00:00") if before_iso.endswith("Z") else before_iso
            before_dt = datetime.fromisoformat(parsed)
            if before_dt.tzinfo is None:
                before_dt = before_dt.replace(tzinfo=timezone.utc)
            q = q.filter(Message.created_at < before_dt)
        except Exception:
            pass

    msgs = q.order_by(Message.created_at.desc()).limit(limit).all()
    msgs = list(reversed(msgs))  # ascending order
    return jsonify([_serialize_message(m) for m in msgs]), 200


@messages_bp.route("/send", methods=["POST"])
def send_message():
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    data = request.get_json() or {}
    body = (data.get("body") or "").strip()
    if not body:
        return jsonify({"error": "Message body is required"}), 400

    conv = None
    conv_id = data.get("conversation_id")
    if conv_id:
        _ensure_uuid(conv_id, "conversation_id")
        conv = Conversation.query.get(conv_id)
        if not conv:
            return jsonify({"error": "Conversation not found"}), 404
        if not _assert_member(conv, kind, me):
            return jsonify({"error": "Forbidden"}), 403
        if kind == "admin":
            conv.hidden_for_admin_at = None
        else:
            conv.hidden_for_user_at = None
    else:
        if kind == "admin":
            user_id = data.get("user_id")
            _ensure_uuid(user_id, "user_id")
            if not User.query.get(user_id):
                return jsonify({"error": "User not found"}), 404
            conv = _get_or_create_conversation(user_id=user_id, admin_id=me.id)
            conv.hidden_for_admin_at = None
        else:
            admin_id = data.get("admin_id")
            _ensure_uuid(admin_id, "admin_id")
            if not Admin.query.get(admin_id):
                return jsonify({"error": "Admin not found"}), 404
            conv = _get_or_create_conversation(user_id=me.id, admin_id=admin_id)
            conv.hidden_for_user_at = None

    msg = Message(
        conversation_id=conv.id,
        sender_role=kind,
        sender_user_id=me.id if kind == "user" else None,
        sender_admin_id=me.id if kind == "admin" else None,
        body=body,
    )
    db.session.add(msg)
    _bump_unread_after_send(conv, kind)
    db.session.commit()

    return jsonify(_serialize_message(msg)), 201


@messages_bp.route("/conversations/<uuid:conversation_id>/read", methods=["POST"])
def mark_read(conversation_id):
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    conv = Conversation.query.get_or_404(conversation_id)
    if not _assert_member(conv, kind, me):
        return jsonify({"error": "Forbidden"}), 403

    now = _now_utc()
    q = Message.query.filter(Message.conversation_id == conv.id, Message.moderation_deleted_at.is_(None))

    if kind == "admin":
        for m in q.filter(Message.read_by_admin_at.is_(None)).all():
            m.read_by_admin_at = now
        conv.admin_unread_count = 0
    else:
        for m in q.filter(Message.read_by_user_at.is_(None)).all():
            m.read_by_user_at = now
        conv.user_unread_count = 0

    db.session.commit()
    return jsonify({"ok": True, "read_at": _iso_z(now)}), 200








"""""""""