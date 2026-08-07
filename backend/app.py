"""
CareerHack Candidate App - Main Flask Application
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from config import config
from models import db

# Initialize extensions
migrate = Migrate()


def create_app(config_name=None):
    """Create and configure the Flask application"""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Configure CORS
    CORS(app, resources={r"/api/*": {
        "origins": app.config['FRONTEND_URL'],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }})
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.profile import profile_bp
    from routes.resume import resume_bp
    from routes.jobs import jobs_bp
    from routes.interview import interview_bp
    from routes.assistant import assistant_bp
    from routes.tracker import tracker_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(interview_bp)
    app.register_blueprint(assistant_bp)
    app.register_blueprint(tracker_bp)
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'CareerHack Candidate API',
            'version': '1.0.0'
        }), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    # Create database tables (non-blocking - app starts even if DB is temporarily unreachable)
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created successfully")
        except Exception as e:
            print(f"Warning: Could not create DB tables on startup: {e}")
            print("Tables will be created on first successful request")
    
    return app


# Create the application
app = create_app()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    
    print(f"CareerHack Candidate API running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
