"""
Interview practice routes for CareerHack Candidate App
"""
import json
import random
from flask import Blueprint, request, jsonify
from models import db, Interview
from auth import token_required
from datetime import datetime

interview_bp = Blueprint('interview', __name__, url_prefix='/api/interview')

# Question bank by category
QUESTION_BANK = {
    'behavioral': [
        'Tell me about a time you faced a difficult challenge at work.',
        'Describe a situation where you had to work with a difficult team member.',
        'Give an example of when you showed leadership.',
        'Tell me about a time you failed and what you learned.',
        'Describe a time you had to meet a tight deadline.',
        'Tell me about a time you disagreed with a manager.',
        'Give an example of how you handled conflict.',
        'Describe your greatest professional achievement.',
    ],
    'technical': [
        'Explain the difference between SQL and NoSQL databases.',
        'What is REST API and how does it work?',
        'Explain object-oriented programming principles.',
        'What is the difference between Git merge and Git rebase?',
        'Explain how authentication and authorization work.',
        'What are microservices and their advantages?',
        'Explain the concept of CI/CD.',
        'What is the difference between TCP and UDP?',
    ],
    'situational': [
        'If you were given a project with unclear requirements, what would you do?',
        'How would you handle a situation where your team is behind schedule?',
        'What would you do if you noticed a critical bug before a product launch?',
        'How would you prioritize multiple urgent tasks?',
        'If a client is unhappy with the deliverable, how would you handle it?',
        'How would you onboard a new team member remotely?',
    ],
    'general': [
        'Tell me about yourself and your background.',
        'Why are you interested in this role?',
        'What are your greatest strengths?',
        'What is your biggest weakness?',
        'Where do you see yourself in 5 years?',
        'Why should we hire you?',
        'What motivates you?',
        'How do you handle stress and pressure?',
    ]
}


@interview_bp.route('', methods=['GET'])
@token_required
def get_interviews():
    """Get all interview sessions for current candidate"""
    try:
        candidate = request.current_candidate
        interviews = Interview.query.filter_by(candidate_id=candidate.id).order_by(Interview.interview_date.desc()).all()
        return jsonify({
            'interviews': [i.to_dict() for i in interviews]
        }), 200
    except Exception as e:
        print(f"Interview list error: {e}")
        return jsonify({'interviews': [], 'error': str(e)}), 200


@interview_bp.route('/start', methods=['POST'])
@token_required
def start_interview():
    """Start a new interview session"""
    candidate = request.current_candidate
    data = request.get_json()

    role = data.get('role', 'Software Engineer')
    difficulty = data.get('difficulty', 'medium')
    num_questions = data.get('num_questions', 6)

    # Select questions based on difficulty
    num_per_category = max(1, num_questions // 4)
    questions = []
    for category, bank in QUESTION_BANK.items():
        pool = bank if difficulty != 'hard' else bank
        selected = random.sample(pool, min(num_per_category, len(pool)))
        questions.extend(selected)

    # Trim to requested number
    questions = questions[:num_questions]
    random.shuffle(questions)

    interview = Interview(
        candidate_id=candidate.id,
        role=role,
        difficulty=difficulty,
        questions=json.dumps(questions),
        answers=json.dumps([]),
        scores=json.dumps({}),
    )
    db.session.add(interview)
    db.session.commit()

    return jsonify({
        'message': 'Interview session started',
        'interview': {
            'id': interview.id,
            'role': interview.role,
            'difficulty': interview.difficulty,
            'questions': questions,
            'total_questions': len(questions),
        }
    }), 201


@interview_bp.route('/<interview_id>/answer', methods=['POST'])
@token_required
def submit_answer(interview_id):
    """Submit an answer for an interview question"""
    candidate = request.current_candidate
    interview = Interview.query.filter_by(id=interview_id, candidate_id=candidate.id).first()
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404

    data = request.get_json()
    question_index = data.get('question_index', 0)
    answer = data.get('answer', '')

    questions = json.loads(interview.questions)
    answers = json.loads(interview.answers)

    # Ensure answers list is long enough
    while len(answers) <= question_index:
        answers.append('')

    answers[question_index] = answer
    interview.answers = json.dumps(answers)
    db.session.commit()

    return jsonify({'message': 'Answer saved'}), 200


@interview_bp.route('/<interview_id>/complete', methods=['POST'])
@token_required
def complete_interview(interview_id):
    """Complete interview and generate report"""
    candidate = request.current_candidate
    interview = Interview.query.filter_by(id=interview_id, candidate_id=candidate.id).first()
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404

    questions = json.loads(interview.questions)
    answers = json.loads(interview.answers)

    # Score each answer
    scores = {
        'communication': 0,
        'confidence': 0,
        'technical': 0,
        'overall': 0,
    }
    question_scores = []

    for i, (q, a) in enumerate(zip(questions, answers)):
        q_score = 0
        if len(a) > 20:
            q_score += 20
        if len(a) > 50:
            q_score += 15
        if len(a) > 100:
            q_score += 15
        # Check for structure (paragraphs, bullet points)
        if '\n' in a or '. ' in a:
            q_score += 10
        # Check for keywords
        action_words = ['I', 'we', 'achieved', 'improved', 'developed', 'managed', 'led', 'created', 'designed', 'implemented']
        if any(w in a for w in action_words):
            q_score += 10
        q_score = min(100, q_score)
        question_scores.append({'question': q, 'score': q_score})

    if question_scores:
        avg = sum(qs['score'] for qs in question_scores) / len(question_scores)
        scores['overall'] = round(avg)
        scores['communication'] = round(avg * 0.95)
        scores['confidence'] = round(avg * 0.9)
        scores['technical'] = round(avg * 1.05)

    interview.scores = json.dumps(scores)
    interview.feedback = f"Overall score: {scores['overall']}%. "
    if scores['overall'] >= 80:
        interview.feedback += "Excellent performance! You demonstrated strong communication and technical skills."
    elif scores['overall'] >= 60:
        interview.feedback += "Good performance. Focus on providing more specific examples and quantifiable results."
    else:
        interview.feedback += "Keep practicing. Try to provide longer, more detailed answers with specific examples."

    db.session.commit()

    return jsonify({
        'message': 'Interview completed',
        'report': {
            'scores': scores,
            'question_scores': question_scores,
            'feedback': interview.feedback,
        }
    }), 200


@interview_bp.route('/<interview_id>/report', methods=['GET'])
@token_required
def get_report(interview_id):
    """Get interview report"""
    candidate = request.current_candidate
    interview = Interview.query.filter_by(id=interview_id, candidate_id=candidate.id).first()
    if not interview:
        return jsonify({'error': 'Interview not found'}), 404

    return jsonify({
        'interview': {
            'id': interview.id,
            'role': interview.role,
            'difficulty': interview.difficulty,
            'interview_date': interview.interview_date.isoformat() if interview.interview_date else None,
            'questions': json.loads(interview.questions),
            'answers': json.loads(interview.answers),
            'scores': json.loads(interview.scores),
            'feedback': interview.feedback,
        }
    }), 200


@interview_bp.route('/history', methods=['GET'])
@token_required
def interview_history():
    """Get interview history"""
    candidate = request.current_candidate
    interviews = Interview.query.filter_by(candidate_id=candidate.id)\
        .order_by(Interview.interview_date.desc()).all()

    return jsonify({
        'interviews': [{
            'id': i.id,
            'role': i.role,
            'difficulty': i.difficulty,
            'interview_date': i.interview_date.isoformat() if i.interview_date else None,
            'scores': json.loads(i.scores) if i.scores else {},
            'feedback': i.feedback,
        } for i in interviews]
    }), 200
