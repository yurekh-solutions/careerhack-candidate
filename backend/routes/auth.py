"""
Authentication routes for CareerHack Candidate App
"""
from flask import Blueprint, request, jsonify
from models import db, Candidate
from auth import hash_password, verify_password, generate_token, token_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def _send_welcome_async(email, name):
    """Send welcome email in background (non-blocking)."""
    try:
        from notifications import send_candidate_welcome
        send_candidate_welcome(email, name)
    except Exception:
        pass  # Email failure should not block registration


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new candidate"""
    data = request.get_json()
    
    # Validate required fields
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '').strip()
    
    if not email or not password or not name:
        return jsonify({'error': 'Email, password, and name are required'}), 400
    
    # Validate email format
    if '@' not in email or '.' not in email:
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Validate password length
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    # Check if email already exists
    if Candidate.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Create new candidate
    candidate = Candidate(
        email=email,
        password_hash=hash_password(password),
        name=name
    )
    
    db.session.add(candidate)
    db.session.commit()
    
    # Send welcome email (non-blocking)
    _send_welcome_async(email, name)
    
    # Generate token
    token = generate_token(candidate.id)
    
    return jsonify({
        'message': 'Registration successful',
        'token': token,
        'candidate': candidate.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a candidate"""
    data = request.get_json()
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Find candidate by email
    candidate = Candidate.query.filter_by(email=email).first()
    
    if not candidate:
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Verify password
    if not verify_password(password, candidate.password_hash):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Generate token
    token = generate_token(candidate.id)
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'candidate': candidate.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    """Get current authenticated candidate"""
    candidate = request.current_candidate
    return jsonify({
        'candidate': candidate.to_dict()
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """Logout candidate (client-side token deletion)"""
    # JWT is stateless, so logout is handled client-side by deleting the token
    return jsonify({'message': 'Logout successful'}), 200


@auth_bp.route('/update-profile', methods=['PUT'])
@token_required
def update_profile():
    """Update candidate profile"""
    candidate = request.current_candidate
    data = request.get_json()
    
    # Update fields if provided
    if 'name' in data:
        candidate.name = data['name'].strip()
    if 'phone' in data:
        candidate.phone = data['phone'].strip()
    if 'location' in data:
        candidate.location = data['location'].strip()
    if 'linkedin_url' in data:
        candidate.linkedin_url = data['linkedin_url'].strip()
    if 'github_url' in data:
        candidate.github_url = data['github_url'].strip()
    if 'portfolio_url' in data:
        candidate.portfolio_url = data['portfolio_url'].strip()
    if 'summary' in data:
        candidate.summary = data['summary'].strip()
    
    # Calculate profile completion
    candidate.profile_completion = calculate_profile_completion(candidate)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'candidate': candidate.to_dict()
    }), 200


def calculate_profile_completion(candidate):
    """Calculate profile completion percentage"""
    total_fields = 10
    completed_fields = 0
    
    if candidate.name:
        completed_fields += 1
    if candidate.email:
        completed_fields += 1
    if candidate.phone:
        completed_fields += 1
    if candidate.location:
        completed_fields += 1
    if candidate.linkedin_url:
        completed_fields += 1
    if candidate.github_url:
        completed_fields += 1
    if candidate.portfolio_url:
        completed_fields += 1
    if candidate.summary:
        completed_fields += 1
    if candidate.education:
        completed_fields += 1
    if candidate.experience:
        completed_fields += 1
    
    return int((completed_fields / total_fields) * 100)
