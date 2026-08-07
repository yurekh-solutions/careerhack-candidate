"""
Jobs routes for CareerHack Candidate App
"""
from flask import Blueprint, request, jsonify
from models import db, Job, Application
from auth import token_required
from datetime import datetime
import shared_db

jobs_bp = Blueprint('jobs', __name__, url_prefix='/api/jobs')


@jobs_bp.route('', methods=['GET'])
@token_required
def list_jobs():
    """List all jobs — shows employer-posted jobs from shared database."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '').strip()
    location = request.args.get('location', '').strip()

    # Try to get employer-posted jobs from shared database
    try:
        employer_jobs = shared_db.get_published_jobs(search=search, location=location, limit=100)
    except Exception as e:
        print(f"[jobs] Could not fetch employer jobs: {e}")
        employer_jobs = []

    # Also get local jobs (fallback / seed data)
    query = Job.query
    if search:
        query = query.filter(
            db.or_(
                Job.title.ilike(f'%{search}%'),
                Job.company.ilike(f'%{search}%'),
                Job.description.ilike(f'%{search}%')
            )
        )
    if location:
        query = query.filter(Job.location.ilike(f'%{location}%'))
    local_jobs = [j.to_dict() for j in query.order_by(Job.posted_date.desc()).limit(50).all()]

    # Merge: employer jobs take priority, local jobs as fallback
    seen_ids = set()
    all_jobs = []
    for j in employer_jobs:
        j['source'] = 'employer'
        all_jobs.append(j)
        seen_ids.add(j['id'])
    for j in local_jobs:
        if j['id'] not in seen_ids:
            j['source'] = 'local'
            all_jobs.append(j)
            seen_ids.add(j['id'])

    # Pagination
    start = (page - 1) * per_page
    end = start + per_page
    paginated = all_jobs[start:end]

    return jsonify({
        'jobs': paginated,
        'total': len(all_jobs),
        'page': page,
        'pages': max(1, (len(all_jobs) + per_page - 1) // per_page)
    }), 200


@jobs_bp.route('/<job_id>', methods=['GET'])
@token_required
def get_job(job_id):
    """Get job details — checks employer jobs first, then local."""
    # Try employer job first
    try:
        job = shared_db.get_job_by_id(job_id)
        if job:
            job['source'] = 'employer'
            return jsonify({'job': job}), 200
    except Exception:
        pass

    # Fall back to local
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    return jsonify({'job': job.to_dict()}), 200


@jobs_bp.route('/<job_id>/apply', methods=['POST'])
@token_required
def apply_job(job_id):
    """Apply for a job — creates application + writes to employer pipeline + sends email."""
    candidate = request.current_candidate

    # Check if it's an employer job
    employer_job = None
    try:
        employer_job = shared_db.get_job_by_id(job_id)
    except Exception:
        pass

    if employer_job:
        # Apply to employer-posted job
        existing = Application.query.filter_by(candidate_id=candidate.id, job_id=job_id).first()
        if existing:
            return jsonify({'error': 'Already applied to this job'}), 409

        # Create application record
        application = Application(
            candidate_id=candidate.id,
            job_id=job_id,
            status='applied',
            applied_date=datetime.utcnow().date()
        )
        db.session.add(application)
        db.session.commit()

        # Write to employer's pipeline table
        try:
            shared_db.create_pipeline_entry(
                employer_id=employer_job['employer_id'],
                job_id=job_id,
                candidate_id=candidate.id,
                candidate_name=candidate.name,
                match_score=0,
                stage='applied'
            )
        except Exception as e:
            print(f"[apply] Pipeline write failed: {e}")

        # Send email notification to employer
        try:
            from notifications import send_email
            send_email(
                to_email=_get_employer_email(employer_job['employer_id']),
                subject=f"New Application: {candidate.name} applied for {employer_job['title']}",
                html_body=f"""
                <html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #2a8a8a;">New Job Application</h2>
                        <p>Hello {employer_job.get('employer_name', 'Employer')},</p>
                        <p><strong>{candidate.name}</strong> has applied for <strong>{employer_job['title']}</strong>.</p>
                        <div style="background: #f0f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Candidate:</strong> {candidate.name}</p>
                            <p><strong>Email:</strong> {candidate.email}</p>
                            <p><strong>Position:</strong> {employer_job['title']}</p>
                        </div>
                        <p>Log in to CareerHack.AI to review this application.</p>
                        <p>Best regards,<br>CareerHack.AI</p>
                    </div>
                </body></html>
                """
            )
        except Exception as e:
            print(f"[apply] Email notification failed: {e}")

        return jsonify({
            'message': 'Application submitted successfully',
            'application': application.to_dict()
        }), 201
    else:
        # Apply to local job
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404

        existing = Application.query.filter_by(candidate_id=candidate.id, job_id=job_id).first()
        if existing:
            return jsonify({'error': 'Already applied to this job'}), 409

        application = Application(
            candidate_id=candidate.id,
            job_id=job_id,
            status='applied',
            applied_date=datetime.utcnow().date()
        )
        db.session.add(application)
        db.session.commit()

        return jsonify({
            'message': 'Application submitted successfully',
            'application': application.to_dict()
        }), 201


def _get_employer_email(employer_id):
    """Get employer email from database."""
    import psycopg2
    import psycopg2.extras
    import os
    from dotenv import load_dotenv
    load_dotenv()
    db_url = os.environ.get("DATABASE_URL", "")
    if not db_url:
        return ""
    conn = psycopg2.connect(db_url)
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT email FROM employers WHERE id = %s", (employer_id,))
        row = cur.fetchone()
        return row['email'] if row else ""
    finally:
        conn.close()


@jobs_bp.route('/suggested', methods=['GET'])
@token_required
def suggested_jobs():
    """Get suggested jobs based on candidate profile."""
    candidate = request.current_candidate
    skills = [s.name.lower() for s in candidate.skills]

    # Get employer jobs matching skills
    try:
        all_jobs = shared_db.get_published_jobs(limit=50)
    except Exception:
        all_jobs = []

    # Score jobs by skill match
    scored = []
    for j in all_jobs:
        desc = (j.get('description', '') + ' ' + j.get('title', '')).lower()
        match_count = sum(1 for s in skills if s in desc)
        if match_count > 0:
            j['match_score'] = match_count
            scored.append(j)

    scored.sort(key=lambda x: -x['match_score'])

    # Also get local suggested jobs
    query = Job.query
    if skills:
        conditions = [Job.description.ilike(f'%{skill}%') for skill in skills[:5]]
        if conditions:
            query = query.filter(db.or_(*conditions))
    local_jobs = [j.to_dict() for j in query.order_by(Job.posted_date.desc()).limit(10).all()]

    # Merge
    seen = set()
    result = []
    for j in scored[:10]:
        result.append(j)
        seen.add(j['id'])
    for j in local_jobs:
        if j['id'] not in seen:
            result.append(j)
            seen.add(j['id'])

    return jsonify({'jobs': result[:10]}), 200


# Applications routes
@jobs_bp.route('/applications', methods=['GET'])
@token_required
def list_applications():
    """List all applications for current candidate."""
    candidate = request.current_candidate
    applications = Application.query.filter_by(candidate_id=candidate.id)\
        .order_by(Application.applied_date.desc()).all()
    return jsonify({'applications': [a.to_dict() for a in applications]}), 200


@jobs_bp.route('/applications/<app_id>', methods=['PUT'])
@token_required
def update_application(app_id):
    """Update application status."""
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


@jobs_bp.route('/applications/stats', methods=['GET'])
@token_required
def application_stats():
    """Get application statistics."""
    candidate = request.current_candidate
    applications = Application.query.filter_by(candidate_id=candidate.id).all()

    total = len(applications)
    by_status = {}
    for app in applications:
        by_status[app.status] = by_status.get(app.status, 0) + 1

    responded = sum(1 for a in applications if a.status not in ['applied'])
    response_rate = round((responded / total * 100), 1) if total > 0 else 0

    interviews = sum(1 for a in applications if a.status in ['interview', 'offer', 'hired'])
    interview_rate = round((interviews / total * 100), 1) if total > 0 else 0

    return jsonify({
        'total_applications': total,
        'by_status': by_status,
        'response_rate': response_rate,
        'interview_rate': interview_rate,
    }), 200
