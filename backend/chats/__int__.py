# chats/__init__.py
from flask import Blueprint

chats_bp = Blueprint("chats", __name__, url_prefix="/api/chats")

from . import routes  # import routes after blueprint to avoid circular imports
