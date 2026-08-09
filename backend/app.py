"""
CareerHack Candidate App - Main Flask Application
"""
import os
from flask import Flask, jsonify, send_from_directory, request
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
    
    # Serve frontend static files
    frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'out')
    
    @app.route('/')
    def serve_frontend():
        return send_from_directory(frontend_dir, 'index.html')
    
    @app.route('/<path:path>')
    def serve_static(path):
        # Don't interfere with API routes
        if path.startswith('api/'):
            return jsonify({'error': 'Not found'}), 404
        # Try exact file first (e.g. _next/static/...)
        file_path = os.path.join(frontend_dir, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            # Determine mimetype based on extension
            ext = os.path.splitext(path)[1].lower()
            mimetype_map = {
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.woff': 'font/woff',
                '.woff2': 'font/woff2',
                '.svg': 'image/svg+xml',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.ico': 'image/x-icon',
            }
            mimetype = mimetype_map.get(ext, 'application/octet-stream')
            return send_from_directory(frontend_dir, path, mimetype=mimetype)
        # Try path.html (e.g. /login -> login.html)
        html_path = os.path.join(frontend_dir, path + '.html')
        if os.path.exists(html_path) and os.path.isfile(html_path):
            return send_from_directory(frontend_dir, path + '.html', mimetype='text/html')
        # Try path/index.html (e.g. /dashboard -> dashboard/index.html)
        index_path = os.path.join(frontend_dir, path, 'index.html')
        if os.path.exists(index_path) and os.path.isfile(index_path):
            return send_from_directory(frontend_dir, os.path.join(path, 'index.html'), mimetype='text/html')
        # Fallback to index.html for SPA routing
        return send_from_directory(frontend_dir, 'index.html', mimetype='text/html')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        # Check if it's an API request
        if request.path.startswith('/api/'):
            return jsonify({'error': 'Not found'}), 404
        # Serve frontend for non-API 404s
        return send_from_directory(frontend_dir, 'index.html')
    
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
