# messages/models.py
import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Index, CheckConstraint
from extensions import db

# A single conversation is between exactly one user and one admin.
class Conversation(db.Model):
    __tablename__ = "conversations"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    admin_id = db.Column(UUID(as_uuid=True), db.ForeignKey("admins.id", ondelete="CASCADE"), nullable=False)

    # quick stats & ordering
    last_message_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    user_unread_count = db.Column(db.Integer, default=0, nullable=False)
    admin_unread_count = db.Column(db.Integer, default=0, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_conversation_unique_pair", "user_id", "admin_id", unique=True),
    )


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = db.Column(UUID(as_uuid=True), db.ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    # 'user' or 'admin'
    sender_role = db.Column(db.String(10), nullable=False)
    # optional denormalized who (helps auditing)
    sender_user_id  = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    sender_admin_id = db.Column(UUID(as_uuid=True), db.ForeignKey("admins.id", ondelete="SET NULL"), nullable=True)

    body = db.Column(db.Text, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True, nullable=False)
    # read receipts per recipient side
    read_by_user_at  = db.Column(db.DateTime, nullable=True)
    read_by_admin_at = db.Column(db.DateTime, nullable=True)

    __table_args__ = (
        CheckConstraint("sender_role in ('user','admin')", name="ck_messages_sender_role"),
        Index("ix_messages_conv_created", "conversation_id", "created_at"),
    )





"""""""""
import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from extensions import db

class Conversation(db.Model):
   nique row per (user_id, admin_id) pair.
    __tablename__ = "conversations"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    admin_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("admins.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_message_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)

    # Relationships
    user = db.relationship("User", backref=db.backref("conversations", lazy="dynamic"))
    admin = db.relationship("Admin", backref=db.backref("conversations", lazy="dynamic"))
    messages = db.relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at.asc()",
        lazy="dynamic",
    )

    __table_args__ = (
        UniqueConstraint("user_id", "admin_id", name="uq_conversation_user_admin"),
        Index("ix_conversations_user_admin", "user_id", "admin_id"),
    )

    def bump_last_message(self, when: datetime | None = None):
        self.last_message_at = when or datetime.utcnow()

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "admin_id": str(self.admin_id),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "last_message_at": self.last_message_at.isoformat(),
        }

    def __repr__(self):
        return f"<Conversation {self.id} user={self.user_id} admin={self.admin_id}>"


class Message(db.Model):
  
    __tablename__ = "messages"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    conversation_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Sender: role + FK consistency 
    sender_role = db.Column(
        db.Enum("user", "admin", name="sender_role"),
        nullable=False,
        index=True,
    )
    sender_user_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    sender_admin_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("admins.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    content = db.Column(db.Text, nullable=False)
    meta = db.Column(JSONB, nullable=True)  

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)
    edited_at = db.Column(db.DateTime, nullable=True)

    # Per-side read flags (simple and fast for a 1:1 thread)
    seen_by_user = db.Column(db.Boolean, nullable=False, default=False)
    seen_by_admin = db.Column(db.Boolean, nullable=False, default=False)

    # Relationships
    conversation = db.relationship("Conversation", back_populates="messages")
    sender_user = db.relationship("User", foreign_keys=[sender_user_id])
    sender_admin = db.relationship("Admin", foreign_keys=[sender_admin_id])

    __table_args__ = (
        CheckConstraint(
            "(sender_role = 'user'  AND sender_user_id  IS NOT NULL AND sender_admin_id IS NULL) OR "
            "(sender_role = 'admin' AND sender_admin_id IS NOT NULL AND sender_user_id  IS NULL)",
            name="chk_message_sender_consistency",
        ),
    )

    def mark_seen(self, role: str):
        if role == "user":
            self.seen_by_user = True
        elif role == "admin":
            self.seen_by_admin = True

    def to_dict(self):
        return {
            "id": str(self.id),
            "conversation_id": str(self.conversation_id),
            "sender_role": self.sender_role,
            "sender_user_id": str(self.sender_user_id) if self.sender_user_id else None,
            "sender_admin_id": str(self.sender_admin_id) if self.sender_admin_id else None,
            "content": self.content,
            "meta": self.meta or {},
            "created_at": self.created_at.isoformat(),
            "edited_at": self.edited_at.isoformat() if self.edited_at else None,
            "seen_by_user": self.seen_by_user,
            "seen_by_admin": self.seen_by_admin,
        }

    def __repr__(self):
        return f"<Message {self.id} conv={self.conversation_id} role={self.sender_role}>"
"""""""""""