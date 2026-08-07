# CareerHack Candidate App - Backend

Flask REST API for the CareerHack Candidate Journey platform.

## Tech Stack

- **Flask 2.3** - Web framework
- **SQLAlchemy 2.0** - ORM
- **SQLite** (dev) / **PostgreSQL** (prod) - Database
- **JWT** - Authentication
- **Celery + Redis** - Background tasks (optional)

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Run the server:
```bash
python app.py
```

The API will be available at `http://127.0.0.1:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new candidate
- `POST /api/auth/login` - Login candidate
- `GET /api/auth/me` - Get current user (requires token)
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/update-profile` - Update profile (requires token)

### Health Check
- `GET /api/health` - Health check endpoint

## Database Models

- **Candidate** - User profiles
- **Education** - Education history
- **Experience** - Work experience
- **Skill** - Skills (technical, soft, tools)
- **Resume** - Uploaded resumes
- **Job** - Job listings
- **Application** - Job applications
- **Interview** - Interview practice sessions
- **AssistantMessage** - AI assistant chat history

## Development

The backend uses SQLite by default for development. For production, configure PostgreSQL in `.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/careerhack_candidate
```

## Production

For production deployment:
1. Set `FLASK_ENV=production`
2. Configure PostgreSQL database
3. Use Gunicorn: `gunicorn app:app`
4. Set up Redis for Celery task queue
5. Configure AWS S3 for file storage
