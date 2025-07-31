# login session management

import uuid
from datetime import datetime
from extensions import db
from sqlalchemy.dialects.postgresql import UUID

class LoginSession(db.Model):
    __tablename__ = 'login_sessions'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    login_time = db.Column(db.DateTime, default=datetime.utcnow)
    logout_time = db.Column(db.DateTime, nullable=True)

    user = db.relationship("User", backref="login_sessions")

