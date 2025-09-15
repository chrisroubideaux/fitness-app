# backend/appointments/models.py

import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from extensions import db

class CalendarEvent(db.Model):
    __tablename__ = "calendar_events"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)

    # event types: workout, in_person, video_chat, tour
    event_type = db.Column(db.String(50), nullable=False)

    # Relationships
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=True)
    admin_id = db.Column(UUID(as_uuid=True), db.ForeignKey("admins.id"), nullable=True)

    # Guest booking info
    guest_name = db.Column(db.String(100), nullable=True)
    guest_email = db.Column(db.String(255), nullable=True)
    guest_phone = db.Column(db.String(30), nullable=True)

    # Times
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship("User", backref="calendar_events", lazy=True)
    admin = db.relationship("Admin", backref="calendar_events", lazy=True)

    def serialize(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "event_type": self.event_type,
            "user_id": str(self.user_id) if self.user_id else None,
            "admin_id": str(self.admin_id) if self.admin_id else None,
            "guest_name": self.guest_name,
            "guest_email": self.guest_email,
            "guest_phone": self.guest_phone,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat(),
            "created_at": self.created_at.isoformat(),
        }

