# payments/__init__.py

from .routes import payments_bp
from .webhooks import stripe_webhooks_bp

__all__ = ["payments_bp", "stripe_webhooks_bp"]

def register_payments(app):
    """Optional helper so your app can do: payments.register_payments(app)"""
    app.register_blueprint(payments_bp)
    app.register_blueprint(stripe_webhooks_bp)
