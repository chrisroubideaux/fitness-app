# app.py
import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv

from extensions import db


# ✅ Import models explicitly so Alembic detects them

from login_session import LoginSession
from workout_session.models import WorkoutSession
# Import route blueprints

from memberships.routes import membership_bp
from users.routes import user_bp
from users.oauth import oauth_bp
from admin.routes import admin_bp
from admin.oauth import admin_oauth_bp  # ✅ Admin OAuth blueprint
from ai.routes import ai_bp  # ✅ Add AI routes here
from workout_session import workout_sessions_bp  # ✅ Import workout session routes



from flask_dance.contrib.facebook import make_facebook_blueprint

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # ✅ Facebook OAuth for users
    facebook_bp = make_facebook_blueprint(
        client_id=os.getenv("FACEBOOK_CLIENT_ID"),
        client_secret=os.getenv("FACEBOOK_CLIENT_SECRET"),
        redirect_to="oauth.facebook_callback",  # must match oauth.py
        scope=["email"]
    )
    app.register_blueprint(facebook_bp, url_prefix="/auth/facebook")

   # ✅ Facebook OAuth for admins
    admin_facebook_bp = make_facebook_blueprint(
    client_id=os.getenv("FACEBOOK_CLIENT_ID"),
    client_secret=os.getenv("FACEBOOK_CLIENT_SECRET"),
    redirect_url="/auth/admin/facebook/callback",
    scope=["email"],
    redirect_to=None,
)

    # Register admin Facebook blueprint with custom name
    app.register_blueprint(admin_facebook_bp, name="admin_facebook", url_prefix="/auth/admin/facebook")


    # ✅ CORS
    frontend_origin = os.getenv("FRONTEND_URL", "http://localhost:3000")
    CORS(app,
         origins=[frontend_origin],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=False
    )

    # ✅ Config
    app.config['SECRET_KEY'] = os.getenv("DB_SECRET_KEY")
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@"
        f"{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    Migrate(app, db)

    # ✅ Register all blueprints
    app.register_blueprint(membership_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(oauth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(admin_oauth_bp)  # ✅ Register Admin OAuth
    app.register_blueprint(ai_bp)  # ✅ Register AI API
    
    app.register_blueprint(workout_sessions_bp, url_prefix="/api/workout_sessions")

    

    @app.route('/')
    def hello():
        return jsonify({"message": "Flask backend is running!"})

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)


#from flask import Flask, jsonify
#from flask_cors import CORS

#app = Flask(__name__)
#CORS(app)

#@app.route('/')
#def home():
#    return jsonify({"message": "Flask backend is running!"})

#if __name__ == '__main__':
#   app.run(debug=True)
