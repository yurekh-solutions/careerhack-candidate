"""
notifications.py — Email notifications for CareerHack Candidate App.
Uses Resend API (free tier: 100 emails/day, 3,000/month).
No SMTP, no per-user setup. Just one API key.
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
RESEND_FROM = os.environ.get("RESEND_FROM", "CareerHack <noreply@careerhack.ai>")
RESEND_API_URL = "https://api.resend.com/emails"


def send_email(to_email, subject, html_body):
    """
    Send an email via Resend API.
    Returns True if sent successfully, False otherwise.
    """
    if not RESEND_API_KEY:
        print("[email] Resend API key not configured. Set RESEND_API_KEY in .env")
        return False

    try:
        payload = {
            "from": RESEND_FROM,
            "to": [to_email],
            "subject": subject,
            "html": html_body,
        }

        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        }

        resp = requests.post(RESEND_API_URL, json=payload, headers=headers, timeout=10)

        if resp.status_code in (200, 201):
            print(f"[email] Sent to {to_email}: {subject}")
            return True
        else:
            print(f"[email] Failed ({resp.status_code}): {resp.text}")
            return False
    except Exception as e:
        print(f"[email] Error sending to {to_email}: {e}")
        return False


def send_candidate_welcome(candidate_email, candidate_name):
    """Send welcome email to new candidate."""
    subject = "Welcome to CareerHack"
    html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 50px; height: 50px; background: #4f6ef7; border-radius: 12px; line-height: 50px; text-align: center;">
                <span style="color: white; font-size: 24px; font-weight: bold;">&#9889;</span>
            </div>
        </div>
        <h2 style="color: #1e2a4a; text-align: center;">Welcome to CareerHack, {candidate_name}!</h2>
        <p style="color: #6b7280;">Your AI-powered career journey starts here.</p>
        <div style="background: #f4f7fb; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #1e2a4a; margin-top: 0;">What you can do:</h3>
            <ul style="color: #6b7280; padding-left: 20px;">
                <li>Build and optimize your professional profile</li>
                <li>Upload resumes and get AI-powered ATS scores</li>
                <li>Practice interviews with AI feedback</li>
                <li>Track all your job applications in one place</li>
                <li>Get career advice from your AI assistant</li>
            </ul>
        </div>
        <p style="color: #6b7280;">Best regards,<br>The CareerHack Team</p>
    </div>
</body>
</html>
"""
    return send_email(candidate_email, subject, html_body)


def send_password_reset(candidate_email, candidate_name, reset_token):
    """Send password reset email."""
    subject = "Reset Your CareerHack Password"
    html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e2a4a;">Password Reset Request</h2>
        <p>Hello {candidate_name},</p>
        <p>We received a request to reset your password. Use the token below:</p>
        <div style="background: #eef1f8; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <code style="font-size: 18px; color: #4f6ef7; font-weight: bold;">{reset_token}</code>
        </div>
        <p>This token expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The CareerHack Team</p>
    </div>
</body>
</html>
"""
    return send_email(candidate_email, subject, html_body)
