"""
AGRO-SMART Main Flask Application Server
Smart Farming. Smarter Decisions. Better Harvests.
"""
import os
import time
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load Environment Variables
load_dotenv()

# Import Route Blueprints
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.disease_routes import disease_bp
from routes.weather_routes import weather_bp
from routes.machinery_routes import machinery_bp
from routes.market_routes import market_bp
from models import get_database_status
from utils.helpers import error_response

def create_app():
    app = Flask(__name__)
    
    # Configure CORS for local development environments safely
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:5000"
    ]
    CORS(app, resources={r"/api/*": {"origins": allowed_origins, "methods": ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]}})

    # Register Blueprints for Core Agricultural, Auth & Admin Services
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(disease_bp)
    app.register_blueprint(weather_bp)
    app.register_blueprint(machinery_bp)
    app.register_blueprint(market_bp)

    @app.route("/")
    def root():
        return jsonify({
            "name": "AGRO-SMART API",
            "tagline": "Smart Farming. Smarter Decisions. Better Harvests.",
            "status": "online",
            "version": "1.0.0",
            "services": [
                "/api/auth",
                "/api/admin",
                "/api/disease",
                "/api/weather",
                "/api/machinery",
                "/api/market"
            ]
        })

    @app.route("/api/health", methods=["GET"])
    def health_check():
        """
        Health Check Endpoint:
        Returns status of backend and configuration flags for external services.
        Never exposes secrets or API keys.
        """
        weather_key = os.getenv("WEATHER_API_KEY", "").strip()
        disease_key = os.getenv("DISEASE_AI_API_KEY", os.getenv("DISEASE_API_KEY", "")).strip()

        return jsonify({
            "status": "ok",
            "app": "AGRO-SMART Full-Stack Engine",
            "version": "1.0.0",
            "database_configured": get_database_status(),
            "weather_service_configured": bool(weather_key and not weather_key.startswith("your-")),
            "disease_service_configured": bool(disease_key and not disease_key.startswith("your-")),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        })

    # Global Error Handlers (No raw stack traces exposed to client)
    @app.errorhandler(404)
    def not_found(e):
        return error_response(message="Requested API endpoint not found", code="NOT_FOUND", status_code=404)

    @app.errorhandler(500)
    def server_error(e):
        return error_response(message="An internal server error occurred. Please try again later.", code="SERVER_ERROR", status_code=500)

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"🌾 AGRO-SMART Backend running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
