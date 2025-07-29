# app.py
import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv
from extensions import db

from memberships.routes import membership_bp
from users.routes import user_bp
from users.oauth import oauth_bp

load_dotenv()

def create_app():
    app = Flask(__name__)

    # ✅ Explicit frontend origin fallback if .env var is missing
    frontend_origin = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # ✅ FIX: Apply CORS correctly with wildcard routes and token header support
    CORS(app,
         origins=[frontend_origin],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=False  # ❌ set to False because you're using JWTs in headers
    )

    app.config['SECRET_KEY'] = os.getenv("DB_SECRET_KEY")
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@"
        f"{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    Migrate(app, db)

    # ✅ Register routes
    app.register_blueprint(membership_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(oauth_bp)

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
