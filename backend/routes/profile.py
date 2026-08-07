"""
Profile routes for CareerHack Candidate App
"""
from flask import Blueprint, request, jsonify
from models import db, Candidate, Education, Experience, Skill
from auth import token_required
from datetime import datetime

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')


@profile_bp.route('/education', methods=['POST'])
@token_required
def add_education():
    """Add education entry"""
    candidate = request.current_candidate
    data = request.get_json()

    education = Education(
        candidate_id=candidate.id,
        institution=data.get('institution', ''),
        degree=data.get('degree', ''),
        field=data.get('field', ''),
        grade=data.get('grade', ''),
    )

    # Parse dates if provided
    if data.get('start_date'):
        try:
            education.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    if data.get('end_date'):
        try:
            education.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        except ValueError:
            pass

    db.session.add(education)
    db.session.commit()

    # Refresh candidate to include new education
    db.session.refresh(candidate)

    return jsonify({
        'message': 'Education added successfully',
        'candidate': candidate.to_dict()
    }), 201


@profile_bp.route('/education/<education_id>', methods=['DELETE'])
@token_required
def delete_education(education_id):
    """Delete education entry"""
    candidate = request.current_candidate
    education = Education.query.filter_by(id=education_id, candidate_id=candidate.id).first()

    if not education:
        return jsonify({'error': 'Education entry not found'}), 404

    db.session.delete(education)
    db.session.commit()

    db.session.refresh(candidate)

    return jsonify({
        'message': 'Education deleted successfully',
        'candidate': candidate.to_dict()
    }), 200


@profile_bp.route('/experience', methods=['POST'])
@token_required
def add_experience():
    """Add experience entry"""
    candidate = request.current_candidate
    data = request.get_json()

    experience = Experience(
        candidate_id=candidate.id,
        company=data.get('company', ''),
        role=data.get('role', ''),
        description=data.get('description', ''),
        achievements=data.get('achievements', ''),
    )

    # Parse dates if provided
    if data.get('start_date'):
        try:
            experience.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    if data.get('end_date'):
        try:
            experience.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        except ValueError:
            pass

    db.session.add(experience)
    db.session.commit()

    db.session.refresh(candidate)

    return jsonify({
        'message': 'Experience added successfully',
        'candidate': candidate.to_dict()
    }), 201


@profile_bp.route('/experience/<experience_id>', methods=['DELETE'])
@token_required
def delete_experience(experience_id):
    """Delete experience entry"""
    candidate = request.current_candidate
    experience = Experience.query.filter_by(id=experience_id, candidate_id=candidate.id).first()

    if not experience:
        return jsonify({'error': 'Experience entry not found'}), 404

    db.session.delete(experience)
    db.session.commit()

    db.session.refresh(candidate)

    return jsonify({
        'message': 'Experience deleted successfully',
        'candidate': candidate.to_dict()
    }), 200


@profile_bp.route('/skills', methods=['POST'])
@token_required
def add_skill():
    """Add skill entry"""
    candidate = request.current_candidate
    data = request.get_json()

    if not data.get('name'):
        return jsonify({'error': 'Skill name is required'}), 400

    skill = Skill(
        candidate_id=candidate.id,
        name=data['name'].strip(),
        category=data.get('category', 'technical'),
        proficiency=min(5, max(1, int(data.get('proficiency', 3)))),
    )

    db.session.add(skill)
    db.session.commit()

    db.session.refresh(candidate)

    return jsonify({
        'message': 'Skill added successfully',
        'candidate': candidate.to_dict()
    }), 201


@profile_bp.route('/skills/<skill_id>', methods=['DELETE'])
@token_required
def delete_skill(skill_id):
    """Delete skill entry"""
    candidate = request.current_candidate
    skill = Skill.query.filter_by(id=skill_id, candidate_id=candidate.id).first()

    if not skill:
        return jsonify({'error': 'Skill entry not found'}), 404

    db.session.delete(skill)
    db.session.commit()

    db.session.refresh(candidate)

    return jsonify({
        'message': 'Skill deleted successfully',
        'candidate': candidate.to_dict()
    }), 200
