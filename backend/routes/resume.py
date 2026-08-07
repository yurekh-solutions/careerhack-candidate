"""
Resume routes for CareerHack Candidate App
"""
import os
import json
from flask import Blueprint, request, jsonify, current_app
from models import db, Resume
from auth import token_required

resume_bp = Blueprint('resume', __name__, url_prefix='/api/resume')

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@resume_bp.route('/upload', methods=['POST'])
@token_required
def upload_resume():
    """Upload a resume file"""
    candidate = request.current_candidate

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Validate file type
    allowed = {'pdf', 'docx', 'doc', 'txt'}
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in allowed:
        return jsonify({'error': f'Invalid file type. Allowed: {", ".join(allowed)}'}), 400

    # Save file
    filename = f"{candidate.id}_{file.filename}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Read text content for txt files
    content = ''
    if ext == 'txt':
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

    # Create resume record
    resume = Resume(
        candidate_id=candidate.id,
        title=file.filename.rsplit('.', 1)[0],
        content=content,
        file_url=filepath,
    )
    db.session.add(resume)
    db.session.commit()

    return jsonify({
        'message': 'Resume uploaded successfully',
        'resume': resume.to_dict()
    }), 201


@resume_bp.route('', methods=['GET'])
@token_required
def get_resumes():
    """Get all resumes for current candidate"""
    candidate = request.current_candidate
    resumes = Resume.query.filter_by(candidate_id=candidate.id).order_by(Resume.created_at.desc()).all()
    return jsonify({'resumes': [r.to_dict() for r in resumes]}), 200


@resume_bp.route('/<resume_id>', methods=['GET'])
@token_required
def get_resume(resume_id):
    """Get a specific resume"""
    candidate = request.current_candidate
    resume = Resume.query.filter_by(id=resume_id, candidate_id=candidate.id).first()
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404
    return jsonify({'resume': resume.to_dict()}), 200


@resume_bp.route('/<resume_id>', methods=['PUT'])
@token_required
def update_resume(resume_id):
    """Update resume content/title"""
    candidate = request.current_candidate
    resume = Resume.query.filter_by(id=resume_id, candidate_id=candidate.id).first()
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404

    data = request.get_json()
    if 'title' in data:
        resume.title = data['title'].strip()
    if 'content' in data:
        resume.content = data['content']
    if 'ats_score' in data:
        resume.ats_score = data['ats_score']
    if 'keywords' in data:
        resume.keywords = json.dumps(data['keywords'])

    db.session.commit()
    return jsonify({'message': 'Resume updated', 'resume': resume.to_dict()}), 200


@resume_bp.route('/<resume_id>', methods=['DELETE'])
@token_required
def delete_resume(resume_id):
    """Delete a resume"""
    candidate = request.current_candidate
    resume = Resume.query.filter_by(id=resume_id, candidate_id=candidate.id).first()
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404

    # Delete file if exists
    if resume.file_url and os.path.exists(resume.file_url):
        os.remove(resume.file_url)

    db.session.delete(resume)
    db.session.commit()
    return jsonify({'message': 'Resume deleted'}), 200


@resume_bp.route('/<resume_id>/analyze', methods=['POST'])
@token_required
def analyze_resume(resume_id):
    """Analyze resume for ATS score"""
    candidate = request.current_candidate
    resume = Resume.query.filter_by(id=resume_id, candidate_id=candidate.id).first()
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404

    content = resume.content or ''
    if not content:
        return jsonify({'error': 'No text content to analyze. Upload a .txt resume or add content manually.'}), 400

    # Simple ATS scoring based on best practices
    score = 0
    checks = []

    # Length check
    word_count = len(content.split())
    if word_count >= 200:
        score += 20
        checks.append({'item': 'Content length', 'status': 'pass', 'detail': f'{word_count} words'})
    elif word_count >= 100:
        score += 10
        checks.append({'item': 'Content length', 'status': 'warning', 'detail': f'{word_count} words (aim for 200+)'})
    else:
        checks.append({'item': 'Content length', 'status': 'fail', 'detail': f'{word_count} words (too short)'})

    # Keywords check
    keywords = ['experience', 'skills', 'education', 'project', 'achievement', 'responsibility', 'developed', 'managed', 'led', 'created']
    found_keywords = [kw for kw in keywords if kw.lower() in content.lower()]
    keyword_score = min(30, len(found_keywords) * 3)
    score += keyword_score
    checks.append({'item': 'Keywords', 'status': 'pass' if len(found_keywords) >= 5 else 'warning', 'detail': f'{len(found_keywords)}/{len(keywords)} keywords found'})

    # Action verbs
    action_verbs = ['achieved', 'improved', 'trained', 'mentored', 'managed', 'created', 'resolved', 'volunteered', 'influenced', 'increased', 'decreased', 'developed', 'organized', 'analyzed', 'designed']
    found_verbs = [v for v in action_verbs if v.lower() in content.lower()]
    verb_score = min(20, len(found_verbs) * 2)
    score += verb_score
    checks.append({'item': 'Action verbs', 'status': 'pass' if len(found_verbs) >= 4 else 'warning', 'detail': f'{len(found_verbs)} action verbs found'})

    # Quantifiable results
    import re
    numbers = re.findall(r'\d+%', content) + re.findall(r'\$\d+', content) + re.findall(r'\d+\+?', content)
    if len(numbers) >= 3:
        score += 15
        checks.append({'item': 'Quantifiable results', 'status': 'pass', 'detail': f'{len(numbers)} metrics found'})
    elif len(numbers) >= 1:
        score += 7
        checks.append({'item': 'Quantifiable results', 'status': 'warning', 'detail': f'{len(numbers)} metrics (add more numbers)'})
    else:
        checks.append({'item': 'Quantifiable results', 'status': 'fail', 'detail': 'No metrics found'})

    # Sections check
    sections = ['education', 'experience', 'skill']
    found_sections = [s for s in sections if s.lower() in content.lower()]
    section_score = min(15, len(found_sections) * 5)
    score += section_score
    checks.append({'item': 'Key sections', 'status': 'pass' if len(found_sections) >= 2 else 'warning', 'detail': f'{len(found_sections)}/3 sections found'})

    score = min(100, score)
    resume.ats_score = score
    resume.keywords = json.dumps(found_keywords)
    db.session.commit()

    return jsonify({
        'ats_score': score,
        'checks': checks,
        'suggestions': [
            'Add quantifiable achievements (numbers, percentages)',
            'Use strong action verbs to start bullet points',
            'Include relevant keywords from job descriptions',
            'Keep resume to 1-2 pages',
        ]
    }), 200
