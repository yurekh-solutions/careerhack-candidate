"""
AI Assistant routes for CareerHack Candidate App
"""
import json
from flask import Blueprint, request, jsonify
from models import db, AssistantMessage
from auth import token_required
from datetime import datetime

assistant_bp = Blueprint('assistant', __name__, url_prefix='/api/assistant')


# Pre-built responses for common career questions (no AI API needed)
RESPONSES = {
    'cover letter': """Here's a professional cover letter template:

---
[Your Name]
[Your Address]
[Your Email] | [Your Phone]

[Date]

[Hiring Manager Name]
[Company Name]
[Company Address]

Dear [Hiring Manager Name],

I am writing to express my interest in the [Position] role at [Company]. With my background in [relevant skill/experience], I am confident I would be a valuable addition to your team.

In my previous role at [Previous Company], I [key achievement with metrics]. This experience has prepared me to [how you'll contribute to the new role].

I am particularly drawn to [Company] because [specific reason about the company]. I would welcome the opportunity to discuss how my skills align with your needs.

Thank you for your consideration.

Best regards,
[Your Name]
---

**Tips:** Customize each cover letter for the specific role. Mention the company by name and reference specific job requirements. Keep it to one page.""",

    'interview tips': """Here are key interview tips:

**Before the Interview:**
- Research the company thoroughly
- Review the job description and match your skills
- Prepare answers for common questions (STAR method)
- Plan your outfit and route

**During the Interview:**
- Arrive 10-15 minutes early
- Maintain good eye contact and body language
- Use the STAR method: Situation, Task, Action, Result
- Ask thoughtful questions about the role
- Be specific with examples and metrics

**After the Interview:**
- Send a thank-you email within 24 hours
- Reflect on what went well and what to improve
- Follow up if you haven't heard back in a week

**Common Questions to Prepare For:**
1. Tell me about yourself
2. Why do you want this job?
3. What are your strengths/weaknesses?
4. Tell me about a challenge you faced
5. Where do you see yourself in 5 years?""",

    'salary negotiation': """Salary negotiation tips:

**Before Negotiating:**
- Research market rates (Glassdoor, Payscale, LinkedIn Salary)
- Know your minimum acceptable salary
- Consider total compensation (benefits, equity, remote work)

**During Negotiation:**
- Let them make the first offer when possible
- Don't give a specific number first - give a range
- Focus on value you bring, not your personal needs
- Use phrases like "Based on my research and experience..."
- Be prepared to walk away if needed

**Example Script:**
"Thank you for the offer. Based on my research of similar roles in this market and my [X years] of experience in [skill], I was expecting a range of [range]. Is there flexibility to move closer to that range?"

**Remember:**
- Always negotiate professionally and positively
- Get the final offer in writing
- Consider non-salary benefits (extra PTO, remote days, learning budget)""",

    'resume tips': """Resume improvement tips:

**Format:**
- Keep it to 1-2 pages
- Use a clean, professional layout
- Use consistent formatting throughout
- Save as PDF unless otherwise specified

**Content:**
- Start with a strong summary (2-3 sentences)
- Use bullet points, not paragraphs
- Start bullets with action verbs (Led, Developed, Achieved)
- Quantify achievements with numbers and percentages
- Tailor keywords to each job description

**What to Include:**
- Contact information
- Professional summary
- Work experience (reverse chronological)
- Education
- Skills (technical + soft)
- Certifications (if relevant)

**What to Avoid:**
- Photos (unless required in your country)
- Unprofessional email addresses
- Irrelevant personal information
- Spelling or grammar errors
- Generic objective statements""",

    'resignation letter': """Professional resignation letter template:

---
[Your Name]
[Your Address]
[Date]

[Manager Name]
[Company Name]

Dear [Manager Name],

Please accept this letter as formal notification that I am resigning from my position as [Your Role] at [Company Name]. My last day will be [Date - typically 2 weeks from notice].

I want to express my gratitude for the opportunities I've had during my time here. I've learned and grown significantly, and I appreciate the support from you and the team.

I am committed to ensuring a smooth transition. I am happy to help train my replacement and document my processes during my remaining time.

Thank you again for everything. I wish you and the company continued success.

Best regards,
[Your Name]
---

**Tips:** Keep it professional and positive. Don't burn bridges. Give at least 2 weeks notice.""",

    'linkedin message': """LinkedIn outreach message templates:

**Connection Request:**
"Hi [Name], I came across your profile and was impressed by your work in [field]. I'd love to connect and learn from your insights. Looking forward to connecting!"

**Recruiter Outreach:**
"Hi [Name], I noticed you're recruiting for [Role] at [Company]. With my [X years] of experience in [skill] and my background in [relevant experience], I believe I'd be a strong fit. Would you be open to a brief conversation?"

**Networking:**
"Hi [Name], I saw your post about [topic] and found it really insightful. I'm also passionate about [related area]. Would love to connect and exchange ideas!"

**Follow-up:**
"Hi [Name], thank you for connecting! I'm currently exploring opportunities in [field] and would appreciate any advice you might have. Would you be open to a brief chat?"

**Tips:** Personalize every message. Keep it under 300 characters for connection requests. Always mention something specific about their profile."""
}


@assistant_bp.route('', methods=['GET'])
@token_required
def get_assistant_history():
    """Get chat history for current candidate"""
    candidate = request.current_candidate
    messages = AssistantMessage.query.filter_by(candidate_id=candidate.id).order_by(AssistantMessage.created_at.asc()).all()
    return jsonify({
        'messages': [m.to_dict() for m in messages]
    }), 200


@assistant_bp.route('/chat', methods=['POST'])
@token_required
def chat():
    """Send a message and get AI response"""
    candidate = request.current_candidate
    data = request.get_json()
    user_message = data.get('message', '').strip()

    if not user_message:
        return jsonify({'error': 'Message is required'}), 400

    # Save user message
    user_msg = AssistantMessage(
        candidate_id=candidate.id,
        role='user',
        content=user_message
    )
    db.session.add(user_msg)

    # Find matching response
    response_text = _get_response(user_message)

    # Save assistant response
    assistant_msg = AssistantMessage(
        candidate_id=candidate.id,
        role='assistant',
        content=response_text
    )
    db.session.add(assistant_msg)
    db.session.commit()

    return jsonify({
        'response': response_text,
        'message': assistant_msg.to_dict()
    }), 200


def _get_response(message):
    """Get response based on message keywords"""
    msg_lower = message.lower()

    for keyword, response in RESPONSES.items():
        if keyword in msg_lower:
            return response

    # Default helpful response
    return """I'm your AI Career Assistant! I can help you with:

- **Cover Letters** - "Help me write a cover letter"
- **Interview Tips** - "Give me interview tips"
- **Salary Negotiation** - "How do I negotiate salary?"
- **Resume Tips** - "How can I improve my resume?"
- **Resignation Letter** - "Help me write a resignation letter"
- **LinkedIn Messages** - "Write a LinkedIn outreach message"
- **Career Advice** - "Should I change careers?"
- **Job Search** - "How do I find jobs?"

Just ask me about any of these topics and I'll provide detailed guidance!"""


@assistant_bp.route('/history', methods=['GET'])
@token_required
def get_history():
    """Get chat history"""
    candidate = request.current_candidate
    messages = AssistantMessage.query.filter_by(candidate_id=candidate.id)\
        .order_by(AssistantMessage.created_at.asc()).all()

    return jsonify({
        'messages': [m.to_dict() for m in messages]
    }), 200


@assistant_bp.route('/clear', methods=['POST'])
@token_required
def clear_history():
    """Clear chat history"""
    candidate = request.current_candidate
    AssistantMessage.query.filter_by(candidate_id=candidate.id).delete()
    db.session.commit()
    return jsonify({'message': 'Chat history cleared'}), 200
