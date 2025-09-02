# messages/__init__.py

"""
Messages package: conversations + messages between users and admins.
Importing this package exposes the blueprint and models.
"""

from .routes import messages_bp
from .models import Conversation, Message  # re-export so migrations can discover models

__all__ = ["messages_bp", "Conversation", "Message"]


def init_app(app):
    """Optional convenience: register the blueprint from the package."""
    app.register_blueprint(messages_bp)
