"""
Supabase PostgreSQL Database Setup Script
Run this after setting DATABASE_URL in .env to initialize all tables.

Usage:
    python setup_supabase.py
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

def check_supabase_connection():
    """Check if Supabase connection string is configured"""
    db_url = os.environ.get('DATABASE_URL', 'sqlite:///candidate.db')
    
    if db_url.startswith('sqlite'):
        print("[!] Still using SQLite. To switch to Supabase:")
        print("    1. Create a project at https://supabase.com")
        print("    2. Get your connection string from Project Settings > Database")
        print("    3. Update DATABASE_URL in .env file")
        print("    4. Run this script again")
        return False
    
    if 'supabase.com' in db_url:
        print("[OK] Supabase connection string detected")
    elif 'postgresql' in db_url or 'postgres' in db_url:
        print("[OK] PostgreSQL connection string detected")
    else:
        print(f"[?] Unknown database URL format: {db_url[:50]}...")
    
    return True

def init_database():
    """Initialize all database tables"""
    from app import app
    from models import db
    
    with app.app_context():
        print("\n📦 Creating database tables...")
        db.create_all()
        
        # List all tables
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        
        print("\n[OK] Database initialized successfully!")
        print(f"    Tables created: {', '.join(tables)}")
        print(f"    Database URL: {os.environ.get('DATABASE_URL', 'N/A')[:60]}...")

if __name__ == '__main__':
    print("=" * 50)
    print("  CareerHack - Database Setup")
    print("=" * 50)
    
    if check_supabase_connection():
        try:
            init_database()
        except Exception as e:
            print(f"\n[ERROR] Error initializing database: {e}")
            print("\nTroubleshooting:")
            print("  1. Check your DATABASE_URL in .env")
            print("  2. Make sure psycopg2-binary is installed: pip install psycopg2-binary")
            print("  3. Verify your Supabase project is active")
            sys.exit(1)
    else:
        print("\n Running with SQLite for development.")
        print("   To use Supabase, update DATABASE_URL in .env\n")
