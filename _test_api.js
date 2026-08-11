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
  const ts = Date.now();
  const email = `test${ts}@example.com`;

  // Register
  console.log('--- REGISTER ---');
  const reg = await req('POST', 'https://careerhack-candidate.onrender.com/api/auth/register', {
    name: 'TestUser', email, password: 'TestPass123!'
  });
  console.log('Status:', reg.status);
  let token = '';
  try { token = JSON.parse(reg.body).token; } catch(e) {}
  console.log('Token:', token ? 'OK' : 'MISSING');

  if (!token) { console.log('Registration failed, cannot continue'); return; }

  // Test all endpoints
  const endpoints = [
    ['GET', '/api/auth/me', null],
    ['PUT', '/api/auth/update-profile', { phone: '+91 9876543210', location: 'Mumbai', summary: 'Dev' }],
    ['GET', '/api/jobs', null],
    ['GET', '/api/resume', null],
    ['GET', '/api/interview', null],
    ['GET', '/api/tracker', null],
    ['GET', '/api/assistant', null],
    ['GET', '/api/profile/education', null],
    ['GET', '/api/profile/experience', null],
    ['GET', '/api/profile/skills', null],
  ];

  for (const [method, path, data] of endpoints) {
    const r = await req(method, `https://careerhack-candidate.onrender.com${path}`, data, token);
    const ok = r.status >= 200 && r.status < 300;
    console.log(`${ok ? 'PASS' : 'FAIL'} | ${method} ${path} | Status: ${r.status} | ${r.body.substring(0, 80)}`);
  }

  console.log('\n=== ALL TESTS DONE ===');
}

main().catch(e => console.log('FATAL:', e.message));
