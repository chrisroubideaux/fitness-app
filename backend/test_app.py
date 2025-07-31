
import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv
from extensions import db

from memberships.routes import membership_bp
from users.routes import user_bp
from users.oauth import oauth_bp
from admin.routes import admin_bp

from flask_dance.contrib.facebook import make_facebook_blueprint

load_dotenv()

def create_app():
    app = Flask(__name__)

    # ✅ Create Facebook OAuth blueprint (no name param)
    facebook_bp = make_facebook_blueprint(
        client_id=os.getenv("FACEBOOK_CLIENT_ID"),
        client_secret=os.getenv("FACEBOOK_CLIENT_SECRET"),
        redirect_to="oauth.facebook_callback",  # matches callback route in oauth.py
        scope=["email"]
    )
    app.register_blueprint(facebook_bp, url_prefix="/auth/facebook")

    # ✅ CORS
    frontend_origin = os.getenv("FRONTEND_URL", "http://localhost:3000")
    CORS(app,
         origins=[frontend_origin],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=False
    )

    # ✅ App config
    app.config['SECRET_KEY'] = os.getenv("DB_SECRET_KEY")
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@"
        f"{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    Migrate(app, db)

    # ✅ Register Blueprints (no duplicates!)
    app.register_blueprint(membership_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(oauth_bp)
    app.register_blueprint(admin_bp)  

    @app.route('/')
    def hello():
        return jsonify({"message": "Flask backend is running!"})

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
