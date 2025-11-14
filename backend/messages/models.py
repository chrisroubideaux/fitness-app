# backend/messages/models.py

import uuid
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Index, CheckConstraint
from extensions import db


# ---------------------------------------------------------
# Utility: always return UTC datetime
# ---------------------------------------------------------
def utcnow():
    return datetime.now(timezone.utc)


# ---------------------------------------------------------
# Conversation Model
# ---------------------------------------------------------
class Conversation(db.Model):
    __tablename__ = "conversations"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    admin_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("admins.id", ondelete="CASCADE"),
        nullable=False,
    )

    last_message_at = db.Column(db.DateTime(timezone=True), default=utcnow, index=True)
    user_unread_count = db.Column(db.Integer, default=0, nullable=False)
    admin_unread_count = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    # Optional: per-viewer hide of the conversation
    hidden_for_user_at = db.Column(db.DateTime(timezone=True), nullable=True)
    hidden_for_admin_at = db.Column(db.DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("ix_conversation_unique_pair", "user_id", "admin_id", unique=True),
    )


# ---------------------------------------------------------
# Message Model
# ---------------------------------------------------------
class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    conversation_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
    )

    sender_role = db.Column(db.String(10), nullable=False)  # 'user' or 'admin'
    sender_user_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    sender_admin_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("admins.id", ondelete="SET NULL"),
        nullable=True,
    )

    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=utcnow,
        index=True,
        nullable=False,
    )

    read_by_user_at = db.Column(db.DateTime(timezone=True), nullable=True)
    read_by_admin_at = db.Column(db.DateTime(timezone=True), nullable=True)

    # -----------------------------------------------------
    # Moderation / Analysis Fields
    # -----------------------------------------------------
    is_toxic = db.Column(db.Boolean, default=False)
    toxicity_score = db.Column(db.Float)

    sentiment = db.Column(db.String(50))  # POSITIVE, NEGATIVE, NEUTRAL
    sentiment_score = db.Column(db.Float)
    intent = db.Column(db.String(50))  # e.g., 'question', 'feedback'

    # -----------------------------------------------------
    # Soft Delete + Moderation Controls
    # -----------------------------------------------------
    deleted_for_user_at = db.Column(db.DateTime(timezone=True), nullable=True)
    deleted_for_admin_at = db.Column(db.DateTime(timezone=True), nullable=True)
    moderation_deleted_at = db.Column(db.DateTime(timezone=True), nullable=True)

    moderation_deleted_by_admin_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("admins.id", ondelete="SET NULL"),
        nullable=True,
    )

    __table_args__ = (
        CheckConstraint("sender_role IN ('user', 'admin')", name="ck_messages_sender_role"),
        Index("ix_messages_conv_created", "conversation_id", "created_at"),
    )

    # -----------------------------------------------------
    # Helper: UTC ISO 8601 serializer
    # -----------------------------------------------------
    @staticmethod
    def _to_iso(dt: datetime | None):
        if not dt:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")

    # -----------------------------------------------------
    # Public serializer
    # -----------------------------------------------------
    def to_dict(self):
        return {
            "id": str(self.id),
            "conversation_id": str(self.conversation_id),
            "sender_role": self.sender_role,
            "body": self.body,
            "is_toxic": self.is_toxic,
            "toxicity_score": self.toxicity_score,
            "sentiment": self.sentiment,
            "sentiment_score": self.sentiment_score,
            "intent": self.intent,
            "created_at": self._to_iso(self.created_at),
            "read_by_user_at": self._to_iso(self.read_by_user_at),
            "read_by_admin_at": self._to_iso(self.read_by_admin_at),
            "deleted_for_user_at": self._to_iso(self.deleted_for_user_at),
            "deleted_for_admin_at": self._to_iso(self.deleted_for_admin_at),
            "moderation_deleted_at": self._to_iso(self.moderation_deleted_at),
        }

