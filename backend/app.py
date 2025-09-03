# app.py
# app.py
import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv
from extensions import db

# Load env first
load_dotenv()

# --- Import models so Alembic sees them ---
from users.models import User
from memberships.models import MembershipPlan
from workout_session.models import WorkoutSession
from login_session import LoginSession

# --- Blueprints ---
from memberships.routes import membership_bp
from users.routes import user_bp
from users.oauth import oauth_bp
from admin.routes import admin_bp
from admin.oauth import admin_oauth_bp
from ai.routes import ai_bp
from workout_session import workout_sessions_bp
from payments.routes import payments_bp
from messages.routes import messages_bp 

from flask_dance.contrib.facebook import make_facebook_blueprint


def create_app():
    app = Flask(__name__)

    # Accept both `/api/x` and `/api/x/`
    app.url_map.strict_slashes = False

    # --- OAuth (Users) ---
    facebook_bp = make_facebook_blueprint(
        client_id=os.getenv("FACEBOOK_CLIENT_ID"),
        client_secret=os.getenv("FACEBOOK_CLIENT_SECRET"),
        redirect_to="oauth.facebook_callback",
        scope=["email"],
    )
    app.register_blueprint(facebook_bp, url_prefix="/auth/facebook")

    # --- OAuth (Admins) ---
    admin_facebook_bp = make_facebook_blueprint(
        client_id=os.getenv("FACEBOOK_CLIENT_ID"),
        client_secret=os.getenv("FACEBOOK_CLIENT_SECRET"),
        redirect_url="/auth/admin/facebook/callback",
        scope=["email"],
        redirect_to=None,
    )
    app.register_blueprint(admin_facebook_bp, name="admin_facebook", url_prefix="/auth/admin/facebook")

    # --- CORS (global) ---
    ALLOWED_ORIGINS = [
        os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/"),
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": ALLOWED_ORIGINS,
                "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True,
            }
        },
    )

    @app.before_request
    def handle_preflight():
        """Return proper CORS headers for preflight (OPTIONS) requests."""
        if request.method == "OPTIONS":
            resp = app.make_default_options_response()
            origin = request.headers.get("Origin")
            if origin in ALLOWED_ORIGINS:
                resp.headers["Access-Control-Allow-Origin"] = origin
                resp.headers["Vary"] = "Origin"
                resp.headers["Access-Control-Allow-Credentials"] = "true"
                resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
                resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
                resp.headers["Access-Control-Max-Age"] = "86400"
            return resp

    @app.after_request
    def add_cors_headers(resp):
        """Guarantee CORS headers even on error responses."""
        origin = request.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            resp.headers["Access-Control-Allow-Origin"] = origin
            resp.headers["Vary"] = "Origin"
            resp.headers["Access-Control-Allow-Credentials"] = "true"
            resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            resp.headers["Access-Control-Max-Age"] = "86400"
        return resp

    # --- Config ---
    app.config['SECRET_KEY'] = os.getenv("DB_SECRET_KEY", "dev-secret")
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@"
        f"{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # --- Init DB/migrations ---
    db.init_app(app)
    Migrate(app, db)

    # --- Register blueprints ---
    app.register_blueprint(membership_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(oauth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(admin_oauth_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(workout_sessions_bp, url_prefix="/api/workout_sessions")
    app.register_blueprint(payments_bp)
    app.register_blueprint(messages_bp)  

    # --- Health/root ---
    @app.route("/")
    def hello():
        return jsonify({"message": "Flask backend is running!"})

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)



"""""""""""""""
import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv
from extensions import db

# Load env first
load_dotenv()

# --- Import models so Alembic sees them ---
from users.models import User
from memberships.models import MembershipPlan
from workout_session.models import WorkoutSession
from login_session import LoginSession

# --- Blueprints ---
from memberships.routes import membership_bp
from users.routes import user_bp
from users.oauth import oauth_bp
from admin.routes import admin_bp
from admin.oauth import admin_oauth_bp
from ai.routes import ai_bp
from workout_session import workout_sessions_bp
from payments.routes import payments_bp
from messages.routes import messages_bp 

from flask_dance.contrib.facebook import make_facebook_blueprint


def create_app():
    app = Flask(__name__)

    # Accept both `/api/x` and `/api/x/`
    app.url_map.strict_slashes = False

    # --- OAuth (Users) ---
    facebook_bp = make_facebook_blueprint(
        client_id=os.getenv("FACEBOOK_CLIENT_ID"),
        client_secret=os.getenv("FACEBOOK_CLIENT_SECRET"),
        redirect_to="oauth.facebook_callback",
        scope=["email"],
    )
    app.register_blueprint(facebook_bp, url_prefix="/auth/facebook")

    # --- OAuth (Admins) ---
    admin_facebook_bp = make_facebook_blueprint(
        client_id=os.getenv("FACEBOOK_CLIENT_ID"),
        client_secret=os.getenv("FACEBOOK_CLIENT_SECRET"),
        redirect_url="/auth/admin/facebook/callback",
        scope=["email"],
        redirect_to=None,
    )
    app.register_blueprint(admin_facebook_bp, name="admin_facebook", url_prefix="/auth/admin/facebook")

    # --- CORS (global) ---
    ALLOWED_ORIGINS = [
        os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/"),
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": ALLOWED_ORIGINS,
                # Include PATCH so preflight for edits works
                "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True,
            }
        },
    )

    @app.after_request
    def add_cors_headers(resp):
       
        origin = request.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            resp.headers["Access-Control-Allow-Origin"] = origin
            resp.headers["Vary"] = "Origin"
            resp.headers["Access-Control-Allow-Credentials"] = "true"
            resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            resp.headers["Access-Control-Max-Age"] = "86400"
        return resp

    # --- Config ---
    app.config['SECRET_KEY'] = os.getenv("DB_SECRET_KEY", "dev-secret")
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@"
        f"{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # --- Init DB/migrations ---
    db.init_app(app)
    Migrate(app, db)

    # --- Register blueprints ---
    app.register_blueprint(membership_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(oauth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(admin_oauth_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(workout_sessions_bp, url_prefix="/api/workout_sessions")
    app.register_blueprint(payments_bp)
    app.register_blueprint(messages_bp)  

    # --- Health/root ---
    @app.route("/")
    def hello():
        return jsonify({"message": "Flask backend is running!"})

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)





"""""""""
