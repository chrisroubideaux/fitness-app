# messages/models.py
import uuid
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Index, CheckConstraint
from extensions import db

def utcnow():
    return datetime.now(timezone.utc)

class Conversation(db.Model):
    __tablename__ = "conversations"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    admin_id = db.Column(UUID(as_uuid=True), db.ForeignKey("admins.id", ondelete="CASCADE"), nullable=False)

    last_message_at = db.Column(db.DateTime(timezone=True), default=utcnow, index=True)
    user_unread_count = db.Column(db.Integer, default=0, nullable=False)
    admin_unread_count = db.Column(db.Integer, default=0, nullable=False)

    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    # (optional) per-viewer hide of the whole conversation
    hidden_for_user_at  = db.Column(db.DateTime(timezone=True), nullable=True)
    hidden_for_admin_at = db.Column(db.DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("ix_conversation_unique_pair", "user_id", "admin_id", unique=True),
    )


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = db.Column(UUID(as_uuid=True), db.ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)

    sender_role = db.Column(db.String(10), nullable=False)
    sender_user_id  = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    sender_admin_id = db.Column(UUID(as_uuid=True), db.ForeignKey("admins.id", ondelete="SET NULL"), nullable=True)

    body = db.Column(db.Text, nullable=False)

    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, index=True, nullable=False)

    read_by_user_at  = db.Column(db.DateTime(timezone=True), nullable=True)
    read_by_admin_at = db.Column(db.DateTime(timezone=True), nullable=True)

    # NEW: per-viewer soft delete
    deleted_for_user_at  = db.Column(db.DateTime(timezone=True), nullable=True)
    deleted_for_admin_at = db.Column(db.DateTime(timezone=True), nullable=True)

    # OPTIONAL: moderation delete flag (if you prefer not to hard-delete)
    moderation_deleted_at = db.Column(db.DateTime(timezone=True), nullable=True)
    moderation_deleted_by_admin_id = db.Column(UUID(as_uuid=True), db.ForeignKey("admins.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (
        CheckConstraint("sender_role in ('user','admin')", name="ck_messages_sender_role"),
        Index("ix_messages_conv_created", "conversation_id", "created_at"),
    )




"""""""""
# messages/models.py
# messages/models.py
import uuid
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Index, CheckConstraint
from extensions import db

class Conversation(db.Model):
    __tablename__ = "conversations"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    admin_id = db.Column(UUID(as_uuid=True), db.ForeignKey("admins.id", ondelete="CASCADE"), nullable=False)

    # ✅ make these timezone-aware and default to UTC
    last_message_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    user_unread_count = db.Column(db.Integer, default=0, nullable=False)
    admin_unread_count = db.Column(db.Integer, default=0, nullable=False)

    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        Index("ix_conversation_unique_pair", "user_id", "admin_id", unique=True),
    )


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = db.Column(UUID(as_uuid=True), db.ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)

    sender_role = db.Column(db.String(10), nullable=False)
    sender_user_id  = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    sender_admin_id = db.Column(UUID(as_uuid=True), db.ForeignKey("admins.id", ondelete="SET NULL"), nullable=True)

    body = db.Column(db.Text, nullable=False)

    # ✅ timezone-aware + UTC default
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True, nullable=False)

    # ✅ receipts timezone-aware too
    read_by_user_at  = db.Column(db.DateTime(timezone=True), nullable=True)
    read_by_admin_at = db.Column(db.DateTime(timezone=True), nullable=True)

    __table_args__ = (
        CheckConstraint("sender_role in ('user','admin')", name="ck_messages_sender_role"),
        Index("ix_messages_conv_created", "conversation_id", "created_at"),
    )






"""""""""""