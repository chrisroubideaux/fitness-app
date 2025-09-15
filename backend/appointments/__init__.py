# appointments/__init__.py

# Expose the blueprint here so you can import directly from appointments
from .routes import appointments_bp

__all__ = ["appointments_bp"]
