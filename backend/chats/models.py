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
