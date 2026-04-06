# backend/chats/models.py

import uuid
from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID

from extensions import db


class Chat(db.Model):
    """
    Represents a chat interaction with Lena for both guests and authenticated users.

    Guest chats:
      - user_id = None
      - is_guest = True
      - name/email come from request body

    Authenticated chats:
      - user_id is set
      - is_guest = False
      - name/email can be copied from the linked user for easy admin viewing
    """
    __tablename__ = "chats"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # ✅ Optional linkage to a real authenticated user
    user_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    user = db.relationship("User", backref=db.backref("chats", lazy="dynamic"))

    # ✅ Identity fields
    is_guest = db.Column(db.Boolean, default=True, nullable=False)
    name = db.Column(db.String(120), nullable=True)
    email = db.Column(db.String(120), nullable=True, index=True)

    # ✅ Chat content
    message = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=True)

    # 🧠 NLP / AI analysis metadata
    is_toxic = db.Column(db.Boolean, default=False)
    toxicity_score = db.Column(db.Float)
    sentiment = db.Column(db.String(50))
    sentiment_score = db.Column(db.Float)
    emotion = db.Column(db.String(50))
    intent = db.Column(db.String(50))

    # 🧩 Chat lifecycle status
    status = db.Column(db.String(20), default="new")

    # 🕓 Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def display_name(self) -> str:
        if self.user and self.user.full_name:
            return self.user.full_name
        return self.name or "Guest"

    @property
    def display_email(self) -> str | None:
        if self.user and self.user.email:
            return self.user.email
        return self.email

    def to_dict(self):
        """Serialize chat for API responses."""
        return {
            "id": self.id,
            "user_id": str(self.user_id) if self.user_id else None,
            "is_guest": self.is_guest,
            "name": self.name,
            "email": self.email,
            "display_name": self.display_name,
            "display_email": self.display_email,
            "message": self.message,
            "response": self.response,
            "is_toxic": self.is_toxic,
            "toxicity_score": self.toxicity_score,
            "sentiment": self.sentiment,
            "sentiment_score": self.sentiment_score,
            "emotion": self.emotion,
            "intent": self.intent,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return (
            f"<Chat id={self.id} user_id={self.user_id} "
            f"email={self.display_email} status={self.status}>"
        )

"""""""""""""""""""""""""""""""""""
import uuid
from datetime import datetime
from extensions import db


class Chat(db.Model):
    
    __tablename__ = "chats"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120))                  
    email = db.Column(db.String(120), nullable=False)
    message = db.Column(db.Text, nullable=False)    
    response = db.Column(db.Text)                   

    # 🧠 NLP / AI analysis metadata
    is_toxic = db.Column(db.Boolean, default=False)
    toxicity_score = db.Column(db.Float)
    sentiment = db.Column(db.String(50))           
    sentiment_score = db.Column(db.Float)            
    emotion = db.Column(db.String(50))              
    intent = db.Column(db.String(50))              

    # 🧩 Chat lifecycle status
    status = db.Column(db.String(20), default="new")  

    # 🕓 Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
       
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "message": self.message,
            "response": self.response,
            "is_toxic": self.is_toxic,
            "toxicity_score": self.toxicity_score,
            "sentiment": self.sentiment,
            "sentiment_score": self.sentiment_score,
            "emotion": self.emotion,
            "intent": self.intent,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    def __repr__(self):
        return f"<Chat id={self.id} email={self.email} status={self.status}>"

"""""""""""""""""""""""""""""""""""""""""""""""""""