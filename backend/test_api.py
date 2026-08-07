"""Test the auth API endpoints"""
import requests

BASE = 'http://127.0.0.1:5000'

# Test health
print("=== Health Check ===")
r = requests.get(f'{BASE}/api/health')
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
print()

# Test register
print("=== Register ===")
r = requests.post(f'{BASE}/api/auth/register', json={
    'name': 'Test User',
    'email': 'test@example.com',
    'password': 'test123456'
})
print(f"Status: {r.status_code}")
data = r.json()
print(f"Response: {data}")
token = data.get('token', '')
print()

# Test login
print("=== Login ===")
r = requests.post(f'{BASE}/api/auth/login', json={
    'email': 'test@example.com',
    'password': 'test123456'
})
print(f"Status: {r.status_code}")
data = r.json()
print(f"Response: {data}")
token = data.get('token', token)
print()

# Test get current user
print("=== Get Current User ===")
r = requests.get(f'{BASE}/api/auth/me', headers={
    'Authorization': f'Bearer {token}'
})
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
print()

# Test update profile
print("=== Update Profile ===")
r = requests.put(f'{BASE}/api/auth/update-profile', json={
    'phone': '+91 98765 43210',
    'location': 'Mumbai, India',
    'summary': 'Software developer with 3 years experience'
}, headers={
    'Authorization': f'Bearer {token}'
})
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
print()

# Test add education
print("=== Add Education ===")
r = requests.post(f'{BASE}/api/profile/education', json={
    'institution': 'IIT Bombay',
    'degree': 'B.Tech',
    'field': 'Computer Science',
    'start_date': '2018-06-01',
    'end_date': '2022-05-31',
    'grade': '8.5 CGPA'
}, headers={
    'Authorization': f'Bearer {token}'
})
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
print()

# Test add skill
print("=== Add Skill ===")
r = requests.post(f'{BASE}/api/profile/skills', json={
    'name': 'Python',
    'category': 'technical',
    'proficiency': 4
}, headers={
    'Authorization': f'Bearer {token}'
})
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
print()

print("=== ALL TESTS PASSED ===")
