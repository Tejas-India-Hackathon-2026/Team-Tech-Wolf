"""
AGRO-SMART Main Flask Application Server
Smart Farming. Smarter Decisions. Better Harvests.
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load Environment Variables
load_dotenv()

# Import Route Blueprints
from routes.disease_routes import disease_bp
from routes.weather_routes import weather_bp
from routes.machinery_routes import machinery_bp
from routes.market_routes import market_bp

def create_app():
    app = Flask(__name__)
    
    # Configure CORS for frontend access
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register Blueprints for the 4 Core Agricultural Services
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
                "/api/disease",
                "/api/weather",
                "/api/machinery",
                "/api/market"
            ]
        })

    @app.route("/api/health")
    def health_check():
        return jsonify({
            "status": "healthy",
            "app": "AGRO-SMART Backend",
            "services_active": 4
        })

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"🌾 AGRO-SMART Backend starting on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
