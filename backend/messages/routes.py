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

# ---- helpers ----

EDIT_GRACE = timedelta(minutes=15)

def _now_utc():
    return datetime.now(timezone.utc)

def _iso_z(dt):
    """Serialize any datetime as UTC ISO8601 with 'Z'. Handles naive values by assuming UTC."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")

def _serialize_conversation(c: Conversation, viewer_kind: str):
    """
    Serialize a conversation including a nice peer label and the correct side's unread counter.
    """
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

def _ensure_uuid(v, name: str = "id"):
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

# ---- conversations ----

@messages_bp.route("/conversations", methods=["GET"])
def list_conversations():
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    q = Conversation.query
    if kind == "admin":
        q = q.filter(
            Conversation.admin_id == me.id,
            Conversation.hidden_for_admin_at.is_(None),   # hide conversations the admin hid
        )
    else:
        q = q.filter(
            Conversation.user_id == me.id,
            Conversation.hidden_for_user_at.is_(None),    # hide conversations the user hid
        )

    limit = max(1, min(int(request.args.get("limit", 20)), 100))
    offset = max(0, int(request.args.get("offset", 0)))

    items = (
        q.order_by(Conversation.last_message_at.desc().nullslast())
         .offset(offset).limit(limit).all()
    )
    return jsonify([_serialize_conversation(c, kind) for c in items]), 200


@messages_bp.route("/conversations", methods=["POST"])
def create_or_fetch_conversation():
    """Admin supplies user_id; user supplies admin_id. Returns the conversation."""
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
        # If previously hidden by admin, unhide on explicit create/fetch
        conv.hidden_for_admin_at = None
    else:
        admin_id = data.get("admin_id")
        _ensure_uuid(admin_id, "admin_id")
        if not Admin.query.get(admin_id):
            return jsonify({"error": "Admin not found"}), 404
        conv = _get_or_create_conversation(user_id=me.id, admin_id=admin_id)
        # If previously hidden by user, unhide
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
    """
    Soft-delete conversation:
      - default (?for=me): hide only for the caller
      - ?for=everyone: admin-only, hide for both
    """
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    conv = Conversation.query.get_or_404(conversation_id)
    if not _assert_member(conv, kind, me):
        return jsonify({"error": "Forbidden"}), 403

    mode = (request.args.get("for") or "me").lower()
    now = _now_utc()

    if mode == "everyone":
        if kind != "admin" or conv.admin_id != me.id:
            return jsonify({"error": "Only the admin participant can hide for everyone"}), 403
        conv.hidden_for_admin_at = now
        conv.hidden_for_user_at = now
    else:
        if kind == "admin":
            conv.hidden_for_admin_at = now
        else:
            conv.hidden_for_user_at = now

    db.session.commit()
    return jsonify({"ok": True}), 200

# ---- messages ----

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
    q = Message.query.filter(Message.conversation_id == conv.id)

    # Hide moderation-deleted for everyone
    q = q.filter(Message.moderation_deleted_at.is_(None))

    # Hide per-viewer soft-deleted
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
    msgs = list(reversed(msgs))  # ascending for UI
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
        # Unhide for sender if they had hidden it
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


@messages_bp.route("/messages/<uuid:message_id>", methods=["PATCH"])
def edit_message(message_id):
    """Only sender can edit; within EDIT_GRACE."""
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    msg = Message.query.get_or_404(message_id)
    conv = Conversation.query.get_or_404(msg.conversation_id)
    if not _assert_member(conv, kind, me):
        return jsonify({"error": "Forbidden"}), 403

    sender_is_me = (
        (kind == "admin" and msg.sender_role == "admin" and msg.sender_admin_id == me.id) or
        (kind == "user"  and msg.sender_role == "user"  and msg.sender_user_id  == me.id)
    )
    if not sender_is_me:
        return jsonify({"error": "Only the sender can edit this message"}), 403

    created_at_aware = msg.created_at if msg.created_at.tzinfo else msg.created_at.replace(tzinfo=timezone.utc)
    if _now_utc() - created_at_aware > EDIT_GRACE:
        return jsonify({"error": "Edit window expired"}), 400

    data = request.get_json() or {}
    body = (data.get("body") or "").strip()
    if not body:
        return jsonify({"error": "Message body is required"}), 400

    msg.body = body
    db.session.commit()
    return jsonify(_serialize_message(msg)), 200


@messages_bp.route("/messages/<uuid:message_id>", methods=["DELETE"])
def delete_message(message_id):
    """
    Soft delete:
      - default (?for=me): hide only for caller (deleted_for_user_at / deleted_for_admin_at)
      - ?for=everyone: admin-only moderation delete (hide for both + affects unread counters)
    """
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    msg = Message.query.get_or_404(message_id)
    conv = Conversation.query.get_or_404(msg.conversation_id)
    if not _assert_member(conv, kind, me):
        return jsonify({"error": "Forbidden"}), 403

    mode = (request.args.get("for") or "me").lower()
    now = _now_utc()

    if mode == "everyone":
        # moderation delete (admin participant only)
        if kind != "admin" or conv.admin_id != me.id:
            return jsonify({"error": "Only the admin participant can delete for everyone"}), 403

        # Hide for both sides & mark moderation
        msg.moderation_deleted_at = now
        msg.moderation_deleted_by_admin_id = me.id
        msg.deleted_for_user_at = now
        msg.deleted_for_admin_at = now

        # Adjust unread counters only if recipient hadn’t read yet
        if msg.sender_role == "admin" and msg.read_by_user_at is None:
            conv.user_unread_count = max(0, conv.user_unread_count - 1)
        if msg.sender_role == "user" and msg.read_by_admin_at is None:
            conv.admin_unread_count = max(0, conv.admin_unread_count - 1)

    else:
        # for=me: hide only for caller; do not change unread counters
        if kind == "admin":
            msg.deleted_for_admin_at = now
        else:
            msg.deleted_for_user_at = now

    # Recompute last_message_at using latest non-moderation-deleted message
    latest = (
        Message.query
        .filter(
            Message.conversation_id == conv.id,
            Message.moderation_deleted_at.is_(None),
        )
        .order_by(Message.created_at.desc())
        .first()
    )
    conv.last_message_at = latest.created_at if latest else None

    db.session.commit()
    return jsonify({"ok": True}), 200


@messages_bp.route("/conversations/<uuid:conversation_id>/read", methods=["POST"])
def mark_read(conversation_id):
    """Mark all messages read for caller side."""
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    conv = Conversation.query.get_or_404(conversation_id)
    if not _assert_member(conv, kind, me):
        return jsonify({"error": "Forbidden"}), 403

    now = _now_utc()
    q = Message.query.filter(
        Message.conversation_id == conv.id,
        Message.moderation_deleted_at.is_(None)  # don't touch deleted-by-moderation rows
    )

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

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta, timezone
from uuid import UUID as UUIDType

from extensions import db
from messages.models import Conversation, Message
from admin.models import Admin
from users.models import User

# ✅ use the new helper
from messages.auth import resolve_principal, AuthError

messages_bp = Blueprint("messages", __name__, url_prefix="/api/messages")

# ---- helpers ----

EDIT_GRACE = timedelta(minutes=15)

def _iso_z(dt):

    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def _serialize_conversation(c: Conversation, viewer_kind: str):
   
    if viewer_kind == "admin":
        # admin is viewing → show the USER’s name/email
        u = User.query.get(c.user_id)
        peer = (u.full_name or u.email or "User") if u else "User"
        unread = c.admin_unread_count
    else:
        # user is viewing → show the ADMIN’s name (or “Coach/Admin”)
        a = Admin.query.get(c.admin_id)
        peer = (a.full_name or "Coach/Admin") if a else "Coach/Admin"
        unread = c.user_unread_count

    return {
        "id": str(c.id),
        "user_id": str(c.user_id),
        "admin_id": str(c.admin_id),
        "peer_display_name": peer,                 # 👈 NEW
        "unread_count": unread,                    # 👈 per-viewer counter
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

def _ensure_uuid(v, name: str = "id"):
    try:
        return UUIDType(str(v))
    except Exception:
        from werkzeug.exceptions import BadRequest
        raise BadRequest(f"Invalid {name}")

def _get_or_create_conversation(user_id, admin_id) -> Conversation:
    conv = Conversation.query.filter_by(user_id=user_id, admin_id=admin_id).one_or_none()
    if conv:
        return conv
    conv = Conversation(user_id=user_id, admin_id=admin_id, last_message_at=datetime.now(timezone.utc))
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
    conv.last_message_at = datetime.now(timezone.utc)

def _decrement_unread_on_delete(conv: Conversation, msg: Message):
    # If a message was unread by a recipient and we delete it, adjust counters
    if msg.read_by_user_at is None and msg.sender_role == "admin":
        conv.user_unread_count = max(0, conv.user_unread_count - 1)
    if msg.read_by_admin_at is None and msg.sender_role == "user":
        conv.admin_unread_count = max(0, conv.admin_unread_count - 1)

# ---- conversations ----

@messages_bp.route("/conversations", methods=["GET"])
def list_conversations():
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    q = Conversation.query
    if kind == "admin":
        q = q.filter(Conversation.admin_id == me.id)
    else:
        q = q.filter(Conversation.user_id == me.id)

    limit = max(1, min(int(request.args.get("limit", 20)), 100))
    offset = max(0, int(request.args.get("offset", 0)))

    items = (
        q.order_by(Conversation.last_message_at.desc().nullslast())
         .offset(offset).limit(limit).all()
    )
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
    else:
        admin_id = data.get("admin_id")
        _ensure_uuid(admin_id, "admin_id")
        if not Admin.query.get(admin_id):
            return jsonify({"error": "Admin not found"}), 404
        conv = _get_or_create_conversation(user_id=me.id, admin_id=admin_id)

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

    db.session.delete(conv)
    db.session.commit()
    return jsonify({"ok": True}), 200

# ---- messages ----

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
    q = Message.query.filter(Message.conversation_id == conv.id)

    if before_iso:
        try:
            # accept both '...Z' and offsetless; treat offsetless as UTC
            parsed = before_iso
            if parsed and parsed.endswith("Z"):
                parsed = parsed.replace("Z", "+00:00")
            before_dt = datetime.fromisoformat(parsed)
            if before_dt.tzinfo is None:
                before_dt = before_dt.replace(tzinfo=timezone.utc)
            q = q.filter(Message.created_at < before_dt)
        except Exception:
            pass

    msgs = q.order_by(Message.created_at.desc()).limit(limit).all()
    msgs = list(reversed(msgs))  # ascending for UI
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
    else:
        if kind == "admin":
            user_id = data.get("user_id")
            _ensure_uuid(user_id, "user_id")
            if not User.query.get(user_id):
                return jsonify({"error": "User not found"}), 404
            conv = _get_or_create_conversation(user_id=user_id, admin_id=me.id)
        else:
            admin_id = data.get("admin_id")
            _ensure_uuid(admin_id, "admin_id")
            if not Admin.query.get(admin_id):
                return jsonify({"error": "Admin not found"}), 404
            conv = _get_or_create_conversation(user_id=me.id, admin_id=admin_id)

    msg = Message(
        conversation_id=conv.id,
        sender_role=kind,
        sender_user_id=me.id if kind == "user" else None,
        sender_admin_id=me.id if kind == "admin" else None,
        body=body,
        # created_at is set by the model/default; if not, you can set here to utc:
        # created_at=datetime.now(timezone.utc),
    )
    db.session.add(msg)
    _bump_unread_after_send(conv, kind)
    db.session.commit()

    return jsonify(_serialize_message(msg)), 201


@messages_bp.route("/messages/<uuid:message_id>", methods=["PATCH"])
def edit_message(message_id):
    
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    msg = Message.query.get_or_404(message_id)
    conv = Conversation.query.get_or_404(msg.conversation_id)
    if not _assert_member(conv, kind, me):
        return jsonify({"error": "Forbidden"}), 403

    sender_is_me = (
        (kind == "admin" and msg.sender_role == "admin" and msg.sender_admin_id == me.id) or
        (kind == "user"  and msg.sender_role == "user"  and msg.sender_user_id  == me.id)
    )
    if not sender_is_me:
        return jsonify({"error": "Only the sender can edit this message"}), 403

    # use aware now
    if datetime.now(timezone.utc) - (msg.created_at.replace(tzinfo=timezone.utc) if msg.created_at.tzinfo is None else msg.created_at) > EDIT_GRACE:
        return jsonify({"error": "Edit window expired"}), 400

    data = request.get_json() or {}
    body = (data.get("body") or "").strip()
    if not body:
        return jsonify({"error": "Message body is required"}), 400

    msg.body = body
    db.session.commit()
    return jsonify(_serialize_message(msg)), 200


@messages_bp.route("/messages/<uuid:message_id>", methods=["DELETE"])
def delete_message(message_id):
   
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    msg = Message.query.get_or_404(message_id)
    conv = Conversation.query.get_or_404(msg.conversation_id)
    if not _assert_member(conv, kind, me):
        return jsonify({"error": "Forbidden"}), 403

    sender_is_me = (
        (kind == "admin" and msg.sender_role == "admin" and msg.sender_admin_id == me.id) or
        (kind == "user"  and msg.sender_role == "user"  and msg.sender_user_id  == me.id)
    )

    created_at_aware = msg.created_at.replace(tzinfo=timezone.utc) if msg.created_at.tzinfo is None else msg.created_at
    within_window = datetime.now(timezone.utc) - created_at_aware <= EDIT_GRACE

    if not ((sender_is_me and within_window) or (kind == "admin" and conv.admin_id == me.id)):
        return jsonify({"error": "Not allowed to delete this message"}), 403

    _decrement_unread_on_delete(conv, msg)
    db.session.delete(msg)

    latest = (
        Message.query
        .filter(Message.conversation_id == conv.id)
        .order_by(Message.created_at.desc())
        .first()
    )
    conv.last_message_at = latest.created_at if latest else None

    db.session.commit()
    return jsonify({"ok": True}), 200


@messages_bp.route("/conversations/<uuid:conversation_id>/read", methods=["POST"])
def mark_read(conversation_id):
  
    try:
        kind, me = resolve_principal()
    except AuthError as e:
        return jsonify({"error": "Unauthorized", "message": str(e)}), 401

    conv = Conversation.query.get_or_404(conversation_id)
    if not _assert_member(conv, kind, me):
        return jsonify({"error": "Forbidden"}), 403

    now = datetime.now(timezone.utc)
    q = Message.query.filter(Message.conversation_id == conv.id)

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