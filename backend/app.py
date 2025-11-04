# app.py

import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv

# Make sure Python finds local modules when running from root
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from extensions import db, jwt  # both exist in extensions.py

# Load env vars
load_dotenv()

# --- Import models so Alembic sees them ---
from users.models import User
from memberships.models import MembershipPlan
from workout_session.models import WorkoutSession
from login_session import LoginSession
from appointments.models import CalendarEvent
from admin.models import Admin, AdminIdentity
from face_login.models import FaceEmbedding
from chats.models import Chat  

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
from appointments.routes import appointments_bp
from face_login import face_bp
from chats.routes import chats_bp

from flask_dance.contrib.facebook import make_facebook_blueprint

migrate = Migrate()


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
    app.register_blueprint(
        admin_facebook_bp,
        name="admin_facebook",
        url_prefix="/auth/admin/facebook"
    )

    # --- CORS (global) ---
    ALLOWED_ORIGINS = [
        os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/"),
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Apply CORS to ALL routes under /api/*
    CORS(
        app,
        resources={r"/api/*": {"origins": ALLOWED_ORIGINS}},
        supports_credentials=True,
        expose_headers=["Content-Type", "Authorization"]
    )

    # --- Config ---
    app.config["SECRET_KEY"] = os.getenv("DB_SECRET_KEY", "dev-secret")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret")  # flask-jwt-extended
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@"
        f"{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # --- Init DB/migrations ---
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # --- Register blueprints ---
    app.register_blueprint(membership_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(oauth_bp)
    app.register_blueprint(admin_bp)          # ✅ includes /api/admins/upload-profile
    app.register_blueprint(admin_oauth_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(
        workout_sessions_bp, url_prefix="/api/workout_sessions"
    )
    app.register_blueprint(payments_bp)
    app.register_blueprint(messages_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(face_bp)
    app.register_blueprint(chats_bp)

    # --- Health/root ---
    @app.route("/")
    def hello():
        return jsonify({"message": "Flask backend is running!"})

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)



"""""""""""""""
# app.py
import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv

# ✅ make sure Python finds local modules when running from root
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from extensions import db, jwt   # now both exist in extensions.py

# Load env first
load_dotenv()

# --- Import models so Alembic sees them ---
from users.models import User
from memberships.models import MembershipPlan
from workout_session.models import WorkoutSession
from login_session import LoginSession
from appointments.models import CalendarEvent
from admin.models import Admin, AdminIdentity
from face_login.models import FaceEmbedding

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
from appointments.routes import appointments_bp
from face_login import face_bp

from flask_dance.contrib.facebook import make_facebook_blueprint

migrate = Migrate()

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

    # --- CORS (global, simplified) ---
    ALLOWED_ORIGINS = [
        os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/"),
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    CORS(
        app,
        resources={r"/api/*": {"origins": ALLOWED_ORIGINS}},
        supports_credentials=True
    )

    # --- Config ---
    app.config['SECRET_KEY'] = os.getenv("DB_SECRET_KEY", "dev-secret")
    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "super-secret")   # for flask-jwt-extended
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@"
        f"{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # --- Init DB/migrations ---
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

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
    app.register_blueprint(appointments_bp)
    app.register_blueprint(face_bp)  # no extra url_prefix (already set in routes)

    # --- Health/root ---
    @app.route("/")
    def hello():
        return jsonify({"message": "Flask backend is running!"})

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)



"""""""""
