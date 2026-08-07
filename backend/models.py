"""
Database models for CareerHack Candidate App
"""
import uuid
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def generate_uuid():
    """Generate a new UUID"""
    return str(uuid.uuid4())


class Candidate(db.Model):
    """Candidate model"""
    __tablename__ = 'candidates'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), default='')
    phone = db.Column(db.String(50), default='')
    location = db.Column(db.String(255), default='')
    linkedin_url = db.Column(db.Text, default='')
    github_url = db.Column(db.Text, default='')
    portfolio_url = db.Column(db.Text, default='')
    summary = db.Column(db.Text, default='')
    profile_completion = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    education = db.relationship('Education', backref='candidate', lazy=True, cascade='all, delete-orphan')
    experience = db.relationship('Experience', backref='candidate', lazy=True, cascade='all, delete-orphan')
    skills = db.relationship('Skill', backref='candidate', lazy=True, cascade='all, delete-orphan')
    resumes = db.relationship('Resume', backref='candidate', lazy=True, cascade='all, delete-orphan')
    applications = db.relationship('Application', backref='candidate', lazy=True, cascade='all, delete-orphan')
    interviews = db.relationship('Interview', backref='candidate', lazy=True, cascade='all, delete-orphan')
    messages = db.relationship('AssistantMessage', backref='candidate', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'location': self.location,
            'linkedin_url': self.linkedin_url,
            'github_url': self.github_url,
            'portfolio_url': self.portfolio_url,
            'summary': self.summary,
            'profile_completion': self.profile_completion,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'education': [e.to_dict() for e in self.education],
            'experience': [e.to_dict() for e in self.experience],
            'skills': [s.to_dict() for s in self.skills]
        }


class Education(db.Model):
    """Education model"""
    __tablename__ = 'education'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    candidate_id = db.Column(db.String(36), db.ForeignKey('candidates.id'), nullable=False)
    institution = db.Column(db.String(255), default='')
    degree = db.Column(db.String(255), default='')
    field = db.Column(db.String(255), default='')
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    grade = db.Column(db.String(50), default='')
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'institution': self.institution,
            'degree': self.degree,
            'field': self.field,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'grade': self.grade
        }


class Experience(db.Model):
    """Experience model"""
    __tablename__ = 'experience'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    candidate_id = db.Column(db.String(36), db.ForeignKey('candidates.id'), nullable=False)
    company = db.Column(db.String(255), default='')
    role = db.Column(db.String(255), default='')
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    description = db.Column(db.Text, default='')
    achievements = db.Column(db.Text, default='')
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'company': self.company,
            'role': self.role,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'description': self.description,
            'achievements': self.achievements
        }


class Skill(db.Model):
    """Skill model"""
    __tablename__ = 'skills'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    candidate_id = db.Column(db.String(36), db.ForeignKey('candidates.id'), nullable=False)
    name = db.Column(db.String(255), default='')
    category = db.Column(db.String(50), default='technical')  # technical, soft, tools
    proficiency = db.Column(db.Integer, default=3)  # 1-5
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'name': self.name,
            'category': self.category,
            'proficiency': self.proficiency
        }


class Resume(db.Model):
    """Resume model"""
    __tablename__ = 'resumes'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    candidate_id = db.Column(db.String(36), db.ForeignKey('candidates.id'), nullable=False)
    title = db.Column(db.String(255), default='')
    content = db.Column(db.Text, default='')
    ats_score = db.Column(db.Integer, default=0)
    keywords = db.Column(db.Text, default='[]')  # JSON array
    file_url = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary"""
        import json
        return {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'title': self.title,
            'content': self.content,
            'ats_score': self.ats_score,
            'keywords': json.loads(self.keywords) if self.keywords else [],
            'file_url': self.file_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Job(db.Model):
    """Job model"""
    __tablename__ = 'jobs'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    title = db.Column(db.String(255), default='')
    company = db.Column(db.String(255), default='')
    location = db.Column(db.String(255), default='')
    description = db.Column(db.Text, default='')
    requirements = db.Column(db.Text, default='')
    salary_min = db.Column(db.Integer)
    salary_max = db.Column(db.Integer)
    source = db.Column(db.String(100), default='')  # LinkedIn, Naukri, etc.
    url = db.Column(db.Text, default='')
    posted_date = db.Column(db.Date)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'description': self.description,
            'requirements': self.requirements,
            'salary_min': self.salary_min,
            'salary_max': self.salary_max,
            'source': self.source,
            'url': self.url,
            'posted_date': self.posted_date.isoformat() if self.posted_date else None
        }


class Application(db.Model):
    """Application model"""
    __tablename__ = 'applications'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    candidate_id = db.Column(db.String(36), db.ForeignKey('candidates.id'), nullable=False)
    job_id = db.Column(db.String(36), db.ForeignKey('jobs.id'), nullable=False)
    status = db.Column(db.String(50), default='applied')  # applied, viewed, shortlisted, interview, offer, hired, rejected
    applied_date = db.Column(db.Date, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = db.Column(db.Text, default='')
    salary_offered = db.Column(db.Integer)
    
    # Relationships
    job = db.relationship('Job', backref='applications')
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'job_id': self.job_id,
            'status': self.status,
            'applied_date': self.applied_date.isoformat() if self.applied_date else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'notes': self.notes,
            'salary_offered': self.salary_offered,
            'job': self.job.to_dict() if self.job else None
        }


class Interview(db.Model):
    """Interview model"""
    __tablename__ = 'interviews'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    candidate_id = db.Column(db.String(36), db.ForeignKey('candidates.id'), nullable=False)
    role = db.Column(db.String(255), default='')
    difficulty = db.Column(db.String(50), default='medium')
    questions = db.Column(db.Text, default='[]')  # JSON array
    answers = db.Column(db.Text, default='[]')  # JSON array
    scores = db.Column(db.Text, default='{}')  # JSON: communication, confidence, technical
    feedback = db.Column(db.Text, default='')
    interview_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary"""
        import json
        return {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'role': self.role,
            'difficulty': self.difficulty,
            'questions': json.loads(self.questions) if self.questions else [],
            'answers': json.loads(self.answers) if self.answers else [],
            'scores': json.loads(self.scores) if self.scores else {},
            'feedback': self.feedback,
            'interview_date': self.interview_date.isoformat() if self.interview_date else None
        }


class AssistantMessage(db.Model):
    """AI Assistant message model"""
    __tablename__ = 'assistant_messages'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    candidate_id = db.Column(db.String(36), db.ForeignKey('candidates.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # user, assistant
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'role': self.role,
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
