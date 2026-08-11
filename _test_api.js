const https = require('https');

function req(method, url, data, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const body = data ? JSON.stringify(data) : undefined;
    if (body) headers['Content-Length'] = body.length;
    const opts = { hostname: u.hostname, path: u.pathname, method, headers, timeout: 30000 };
    const r = https.request(opts, (res) => {
      let raw = '';
      res.on('data', (c) => raw += c);
      res.on('end', () => resolve({ status: res.statusCode, body: raw }));
    });
    r.on('error', reject);
    r.on('timeout', () => { r.destroy(); reject(new Error('timeout')); });
    if (body) r.write(body);
    r.end();
  });
}

async function main() {
  // First login to get token
  console.log('--- LOGIN ---');
  const login = await req('POST', 'https://careerhack-candidate.onrender.com/api/auth/login', {
    email: 'test2026check@example.com', password: 'TestPass123!'
  });
  const token = JSON.parse(login.body).token;
  console.log('Status:', login.status, '| Token:', token ? 'OK' : 'MISSING');

  // Test /api/auth/me
  console.log('\n--- GET /api/auth/me ---');
  const me = await req('GET', 'https://careerhack-candidate.onrender.com/api/auth/me', null, token);
  console.log('Status:', me.status, '| Body:', me.body.substring(0, 120));

  // Test update profile
  console.log('\n--- PUT /api/auth/update-profile ---');
  const profile = await req('PUT', 'https://careerhack-candidate.onrender.com/api/auth/update-profile', {
    phone: '+91 9876543210', location: 'Mumbai, India', summary: 'Software developer'
  }, token);
  console.log('Status:', profile.status, '| Body:', profile.body.substring(0, 120));

  // Test jobs
  console.log('\n--- GET /api/jobs ---');
  const jobs = await req('GET', 'https://careerhack-candidate.onrender.com/api/jobs', null, token);
  console.log('Status:', jobs.status, '| Body:', jobs.body.substring(0, 120));

  // Test resume
  console.log('\n--- GET /api/resume ---');
  const resume = await req('GET', 'https://careerhack-candidate.onrender.com/api/resume', null, token);
  console.log('Status:', resume.status, '| Body:', resume.body.substring(0, 120));

  // Test interview
  console.log('\n--- GET /api/interview ---');
  const interview = await req('GET', 'https://careerhack-candidate.onrender.com/api/interview', null, token);
  console.log('Status:', interview.status, '| Body:', interview.body.substring(0, 120));

  // Test tracker
  console.log('\n--- GET /api/tracker ---');
  const tracker = await req('GET', 'https://careerhack-candidate.onrender.com/api/tracker', null, token);
  console.log('Status:', tracker.status, '| Body:', tracker.body.substring(0, 120));

  // Test assistant
  console.log('\n--- GET /api/assistant ---');
  const assistant = await req('GET', 'https://careerhack-candidate.onrender.com/api/assistant', null, token);
  console.log('Status:', assistant.status, '| Body:', assistant.body.substring(0, 120));

  // Test profile education
  console.log('\n--- GET /api/profile/education ---');
  const edu = await req('GET', 'https://careerhack-candidate.onrender.com/api/profile/education', null, token);
  console.log('Status:', edu.status, '| Body:', edu.body.substring(0, 120));

  // Test profile skills
  console.log('\n--- GET /api/profile/skills ---');
  const skills = await req('GET', 'https://careerhack-candidate.onrender.com/api/profile/skills', null, token);
  console.log('Status:', skills.status, '| Body:', skills.body.substring(0, 120));

  console.log('\n=== ALL TESTS DONE ===');
}

main().catch(e => console.log('FATAL:', e.message));
