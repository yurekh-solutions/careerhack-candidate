"""
Application Tracker routes for CareerHack Candidate App
"""
from flask import Blueprint, request, jsonify
from models import db, Application, Job
from auth import token_required
from datetime import datetime

tracker_bp = Blueprint('tracker', __name__, url_prefix='/api/tracker')


@tracker_bp.route('', methods=['POST'])
@token_required
def add_application():
    """Manually add a job application"""
    candidate = request.current_candidate
    data = request.get_json()

    title = data.get('title', '').strip()
    company = data.get('company', '').strip()
    status = data.get('status', 'applied')

    if not title or not company:
        return jsonify({'error': 'Job title and company are required'}), 400

    # Create a job entry if it doesn't exist
    job = Job(
        title=title,
        company=company,
        location=data.get('location', ''),
        url=data.get('url', ''),
        posted_date=datetime.utcnow().date()
    )
    db.session.add(job)
    db.session.flush()

    application = Application(
        candidate_id=candidate.id,
        job_id=job.id,
        status=status,
        applied_date=datetime.utcnow().date(),
        notes=data.get('notes', ''),
        salary_offered=data.get('salary_offered'),
    )
    db.session.add(application)
    db.session.commit()

    return jsonify({
        'message': 'Application added',
        'application': application.to_dict()
    }), 201


@tracker_bp.route('', methods=['GET'])
@token_required
def list_applications():
    """Get all tracked applications"""
    candidate = request.current_candidate
    status_filter = request.args.get('status', '')

    query = Application.query.filter_by(candidate_id=candidate.id)
    if status_filter:
        query = query.filter_by(status=status_filter)

    applications = query.order_by(Application.applied_date.desc()).all()

    return jsonify({'applications': [a.to_dict() for a in applications]}), 200


@tracker_bp.route('/<app_id>', methods=['PUT'])
@token_required
def update_application(app_id):
    """Update application status/notes"""
    candidate = request.current_candidate
    application = Application.query.filter_by(id=app_id, candidate_id=candidate.id).first()
    if not application:
        return jsonify({'error': 'Application not found'}), 404

    data = request.get_json()
    if 'status' in data:
        application.status = data['status']
    if 'notes' in data:
        application.notes = data['notes']
    if 'salary_offered' in data:
        application.salary_offered = data['salary_offered']

    application.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Application updated', 'application': application.to_dict()}), 200


@tracker_bp.route('/<app_id>', methods=['DELETE'])
@token_required
def delete_application(app_id):
    """Delete an application"""
    candidate = request.current_candidate
    application = Application.query.filter_by(id=app_id, candidate_id=candidate.id).first()
    if not application:
        return jsonify({'error': 'Application not found'}), 404

    db.session.delete(application)
    db.session.commit()
    return jsonify({'message': 'Application deleted'}), 200


@tracker_bp.route('/stats', methods=['GET'])
@token_required
def get_stats():
    """Get tracker analytics"""
    candidate = request.current_candidate
    applications = Application.query.filter_by(candidate_id=candidate.id).all()

    total = len(applications)
    by_status = {}
    for app in applications:
        by_status[app.status] = by_status.get(app.status, 0) + 1

    # Weekly applications count
    from collections import defaultdict
    weekly = defaultdict(int)
    for app in applications:
        if app.applied_date:
            week = app.applied_date.strftime('%Y-%m-%d')
            weekly[week] += 1

    responded = sum(1 for a in applications if a.status not in ['applied'])
    response_rate = round((responded / total * 100), 1) if total > 0 else 0

    interviews = sum(1 for a in applications if a.status in ['interview', 'offer', 'hired'])
    interview_rate = round((interviews / total * 100), 1) if total > 0 else 0

    offers = sum(1 for a in applications if a.status in ['offer', 'hired'])
    offer_rate = round((offers / total * 100), 1) if total > 0 else 0

    return jsonify({
        'total_applications': total,
        'by_status': by_status,
        'weekly_applications': dict(weekly),
        'response_rate': response_rate,
        'interview_rate': interview_rate,
        'offer_rate': offer_rate,
    }), 200
