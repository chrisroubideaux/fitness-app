# app.py
# app.py
import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate  # ✅ import Migrate
from dotenv import load_dotenv
from memberships.models import db
from memberships.routes import membership_bp

# Load .env variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Load config from environment
    app.config['SECRET_KEY'] = os.getenv("DB_SECRET_KEY")
    app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Init extensions
    db.init_app(app)
    migrate = Migrate(app, db)  # ✅ This line registers Flask-Migrate

    # Register Blueprints
    app.register_blueprint(membership_bp, url_prefix="/api/memberships")

    @app.route('/')
    def hello():
        return jsonify({"message": "Flask backend is running!"})

    return app
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)  # Run the Flask app in debug mode

#from flask import Flask, jsonify
#from flask_cors import CORS

#app = Flask(__name__)
#CORS(app)

#@app.route('/')
#def home():
#    return jsonify({"message": "Flask backend is running!"})

#if __name__ == '__main__':
#   app.run(debug=True)
