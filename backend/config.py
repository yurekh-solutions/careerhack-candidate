"""
Configuration for CareerHack Candidate App
"""
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Database
    _db_url = os.environ.get('DATABASE_URL', 'sqlite:///candidate.db')
    # Supabase requires SSL for external connections
    if ('supabase.com' in _db_url or 'supabase.co' in _db_url) and 'sslmode' not in _db_url:
        _db_url += '?sslmode=require'
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Connection pool settings
    if _db_url.startswith('sqlite'):
        # SQLite doesn't need pool settings
        pass
    elif 'supabase.com' in _db_url or 'pooler' in _db_url:
        # Supabase uses PgBouncer - use smaller pool
        SQLALCHEMY_ENGINE_OPTIONS = {
            'pool_size': 5,
            'max_overflow': 10,
            'pool_pre_ping': True,
            'pool_recycle': 300
        }
    else:
        # Standard PostgreSQL
        SQLALCHEMY_ENGINE_OPTIONS = {
            'pool_size': 20,
            'max_overflow': 100,
            'pool_pre_ping': True
        }
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 3600)))
    
    # AI Providers
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    
    # Redis
    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    
    # AWS S3
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    AWS_S3_BUCKET = os.environ.get('AWS_S3_BUCKET', 'careerhack-candidate-resumes')
    AWS_REGION = os.environ.get('AWS_REGION', 'ap-south-1')
    
    # Email
    SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
    SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
    SMTP_USERNAME = os.environ.get('SMTP_USERNAME')
    SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD')
    
    # CORS
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False


class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db'


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
