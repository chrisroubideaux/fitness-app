# chats/models.py
# backend/chats/models.py

import uuid
from datetime import datetime
from extensions import db


class Chat(db.Model):
    """
    Represents a chat interaction with Lena.
    Works like DigiWraith's 'Message' model but designed for the AI fitness coach context.
    """
    __tablename__ = "chats"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120))                  # guest name or user display name
    email = db.Column(db.String(120), nullable=False) # required for guests/users
    message = db.Column(db.Text, nullable=False)      # the user/guest’s message
    response = db.Column(db.Text)                     # Lena’s AI-generated reply

    # 🧠 NLP / AI analysis metadata
    is_toxic = db.Column(db.Boolean, default=False)
    toxicity_score = db.Column(db.Float)
    sentiment = db.Column(db.String(50))              # e.g. "positive", "negative", "neutral"
    sentiment_score = db.Column(db.Float)             # confidence value
    emotion = db.Column(db.String(50))                # e.g. "joy", "sadness", "anger"
    intent = db.Column(db.String(50))                 # e.g. "question", "goal", "nutrition", etc.

    # 🧩 Chat lifecycle status
    status = db.Column(db.String(20), default="new")  # new, responded, rejected, etc.

    # 🕓 Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Serialize chat for API responses."""
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
