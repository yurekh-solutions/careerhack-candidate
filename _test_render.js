const https = require('https');

function get(path) {
  return new Promise((resolve, reject) => {
    const req = https.get('https://careerhack-candidate.onrender.com' + path, { timeout: 30000 }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: 'careerhack-candidate.onrender.com',
      path: path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
      timeout: 30000
    };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('=== Render Functionality Test ===\n');

  // 1. Health check
  try {
    const r = await get('/api/health');
    console.log('1. Health:', r.status, r.body);
  } catch(e) { console.log('1. Health: FAIL -', e.message); }

  // 2. Register
  const email = 'test' + Date.now() + '@test.com';
  try {
    const r = await post('/api/auth/register', { name: 'Test User', email, password: 'Test1234', role: 'candidate' });
    const data = JSON.parse(r.body);
    console.log('2. Register:', r.status, data.token ? 'OK (got token)' : data);
    const token = data.token;

    if (!token) { console.log('No token, stopping.'); return; }

    // 3. Profile
    const p = await post('/api/profile', { phone: '9876543210', location: 'Mumbai', bio: 'Test bio' }, token);
    console.log('3. Profile:', p.status, JSON.parse(p.body).message || JSON.parse(p.body));

    // 4. Resume upload
    const r2 = await post('/api/resume', { text: 'Test resume content', skills: ['JavaScript', 'Python'] }, token);
    console.log('4. Resume:', r2.status, JSON.parse(r2.body).message || 'OK');

    // 5. Dashboard
    const d = await get('/api/dashboard', token ? undefined : '/api/dashboard');
    // Need token for dashboard
    const dOpts = { hostname: 'careerhack-candidate.onrender.com', path: '/api/dashboard', method: 'GET', headers: { 'Authorization': 'Bearer ' + token }, timeout: 30000 };
    const dReq = https.request(dOpts, res => { let dd=''; res.on('data',c=>dd+=c); res.on('end',()=>console.log('5. Dashboard:', res.statusCode, dd.substring(0,100))); });
    dReq.on('error', e => console.log('5. Dashboard: FAIL'));
    dReq.on('timeout', () => { dReq.destroy(); console.log('5. Dashboard: timeout'); });
    dReq.end();

    // 6. Logout
    setTimeout(async () => {
      const l = await post('/api/auth/logout', {}, token);
      console.log('6. Logout:', l.status);
      console.log('\n=== All tests done ===');
    }, 3000);

  } catch(e) { console.log('2. Register: FAIL -', e.message); }
}

run();
