"""
shared_db.py — Cross-app database access for CareerHack.
Both employer and candidate backends share the same Supabase database.
This module lets the candidate backend read employer-posted jobs
and write to the employer's pipeline table.
"""

import os
import time
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL", "")


def _get_conn():
    """Get a psycopg2 connection to the shared Supabase database."""
    if not DATABASE_URL or not DATABASE_URL.startswith("postgresql"):
        raise RuntimeError("DATABASE_URL not configured for PostgreSQL")
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn


def get_published_jobs(search="", location="", limit=50):
    """Get all jobs posted by employers (from employer's jobs table)."""
    conn = _get_conn()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        query = """
            SELECT j.id, j.job_id, j.title, j.job_description as description,
                   j.location, j.department, j.ts,
                   e.company, e.name as employer_name, e.id as employer_id
            FROM jobs j
            LEFT JOIN employers e ON j.employer_id = e.id
            WHERE 1=1
        """
        params = []
        if search:
            query += " AND (j.title ILIKE %s OR j.job_description ILIKE %s OR e.company ILIKE %s)"
            params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
        if location:
            query += " AND j.location ILIKE %s"
            params.append(f"%{location}%")
        query += " ORDER BY j.ts DESC LIMIT %s"
        params.append(limit)
        cur.execute(query, params)
        rows = cur.fetchall()
        jobs = []
        for r in rows:
            jobs.append({
                "id": r["job_id"] or str(r["id"]),
                "title": r["title"] or "",
                "company": r["company"] or "",
                "location": r["location"] or "",
                "description": r["description"] or "",
                "department": r["department"] or "",
                "employer_id": r["employer_id"] or "",
                "posted_ts": r["ts"] or 0,
            })
        return jobs
    finally:
        conn.close()


def get_job_by_id(job_id):
    """Get a single job by its job_id."""
    conn = _get_conn()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            SELECT j.id, j.job_id, j.title, j.job_description as description,
                   j.location, j.department, j.ts,
                   e.company, e.name as employer_name, e.id as employer_id
            FROM jobs j
            LEFT JOIN employers e ON j.employer_id = e.id
            WHERE j.job_id = %s
            LIMIT 1
        """, (job_id,))
        row = cur.fetchone()
        if not row:
            return None
        return {
            "id": row["job_id"] or str(row["id"]),
            "title": row["title"] or "",
            "company": row["company"] or "",
            "location": row["location"] or "",
            "description": row["description"] or "",
            "department": row["department"] or "",
            "employer_id": row["employer_id"] or "",
            "employer_name": row["employer_name"] or "",
            "posted_ts": row["ts"] or 0,
        }
    finally:
        conn.close()


def create_pipeline_entry(employer_id, job_id, candidate_id, candidate_name, match_score=0, stage="applied"):
    """Write an application into the employer's pipeline table."""
    conn = _get_conn()
    try:
        cur = conn.cursor()
        data = {
            "job_id": job_id,
            "candidate_id": candidate_id,
            "candidate_name": candidate_name,
            "match_score": match_score,
            "stage": stage,
        }
        cur.execute("""
            INSERT INTO pipeline (employer_id, job_id, candidate_id, stage, ts, updated_ts, data)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (employer_id, job_id, candidate_id, stage, time.time(), time.time(), psycopg2.extras.Json(data)))
        return True
    finally:
        conn.close()


def get_applications_for_employer(employer_id):
    """Get all applications for an employer's jobs (from candidate's applications table)."""
    conn = _get_conn()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            SELECT a.id, a.candidate_id, a.job_id, a.status, a.applied_date,
                   a.updated_at, a.notes, a.salary_offered,
                   c.name as candidate_name, c.email as candidate_email,
                   c.phone as candidate_phone, c.summary as candidate_summary,
                   j.title as job_title
            FROM applications a
            JOIN candidates c ON a.candidate_id = c.id
            LEFT JOIN jobs_candidate j ON a.job_id = j.id
            WHERE a.job_id IN (SELECT job_id FROM jobs WHERE employer_id = %s)
            ORDER BY a.applied_date DESC
        """, (employer_id,))
        rows = cur.fetchall()
        applications = []
        for r in rows:
            applications.append({
                "id": r["id"],
                "candidate_id": r["candidate_id"],
                "candidate_name": r["candidate_name"] or "",
                "candidate_email": r["candidate_email"] or "",
                "candidate_phone": r["candidate_phone"] or "",
                "candidate_summary": r["candidate_summary"] or "",
                "job_id": r["job_id"],
                "job_title": r["job_title"] or "",
                "status": r["status"] or "applied",
                "applied_date": r["applied_date"].isoformat() if r["applied_date"] else None,
                "updated_at": r["updated_at"].isoformat() if r["updated_at"] else None,
                "notes": r["notes"] or "",
                "salary_offered": r["salary_offered"],
            })
        return applications
    finally:
        conn.close()


def update_application_status(application_id, new_status):
    """Update application status and sync to employer pipeline."""
    conn = _get_conn()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        # Get application details
        cur.execute("""
            SELECT a.*, c.name as candidate_name, c.email as candidate_email,
                   j.title as job_title, j.company as job_company
            FROM applications a
            JOIN candidates c ON a.candidate_id = c.id
            LEFT JOIN jobs_candidate j ON a.job_id = j.id
            WHERE a.id = %s
        """, (application_id,))
        app = cur.fetchone()
        if not app:
            return None

        # Update status
        cur.execute("""
            UPDATE applications SET status = %s, updated_at = NOW() WHERE id = %s
        """, (new_status, application_id))

        return {
            "id": app["id"],
            "candidate_name": app["candidate_name"],
            "candidate_email": app["candidate_email"],
            "job_title": app["job_title"],
            "old_status": app["status"],
            "new_status": new_status,
        }
    finally:
        conn.close()
