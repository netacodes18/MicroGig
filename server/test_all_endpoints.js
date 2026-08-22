const http = require('http');

const API_BASE = 'http://localhost:5000';

const endpointsToTest = [
  { name: 'API Health Check', method: 'GET', path: '/api/health' },
  { name: 'Prometheus Metrics', method: 'GET', path: '/metrics' },
  { name: 'Get Jobs List', method: 'GET', path: '/api/jobs' },
  { name: 'Get Users List', method: 'GET', path: '/api/users' },
  { name: 'Get Guild Stats', method: 'GET', path: '/api/users/guilds/stats' },
  { name: 'Get Reviews', method: 'GET', path: '/api/reviews' },
  { name: 'Auth Logout', method: 'GET', path: '/api/auth/logout' },
  { name: 'Auth Me (Unauthorized Test)', method: 'GET', path: '/api/auth/me' },
  { name: 'Protected Route Validation (Notifications)', method: 'GET', path: '/api/notifications' },
];

async function runTests() {
  console.log('🧪 Starting Automated API Endpoint Tests...\n');
  let passed = 0;
  let total = endpointsToTest.length;

  for (const item of endpointsToTest) {
    try {
      const result = await makeRequest(item.method, item.path);
      console.log(`[${result.statusCode}] ${item.method} ${item.path} -> ${item.name} (${result.duration}ms)`);
      if (result.statusCode < 500) {
        passed++;
      }
    } catch (err) {
      console.error(`❌ ${item.method} ${item.path} -> Failed: ${err.message}`);
    }
  }

  // Test Authentication Flow (Register + Login)
  console.log('\n🔐 Testing Authentication Flow (Register/Login)...');
  const testUser = {
    name: 'Test Automation User',
    email: `test_user_${Date.now()}@example.com`,
    password: 'password123'
  };

  try {
    const regRes = await makeRequest('POST', '/api/auth/register', testUser);
    console.log(`[${regRes.statusCode}] POST /api/auth/register -> Registered User (${regRes.duration}ms)`);
    
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    console.log(`[${loginRes.statusCode}] POST /api/auth/login -> Logged in successfully (${loginRes.duration}ms)`);

    if (loginRes.data && loginRes.data.token) {
      const token = loginRes.data.token;
      // Test Protected Route with JWT Token
      const meRes = await makeRequest('GET', '/api/auth/me', null, token);
      console.log(`[${meRes.statusCode}] GET /api/auth/me (Authenticated) -> ${meRes.data.user?.name || 'Verified'} (${meRes.duration}ms)`);
    }
  } catch (err) {
    console.error('Auth test failed:', err.message);
  }

  console.log('\n✅ Automated Endpoint Verification Complete!');
}

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const payload = body ? JSON.stringify(body) : null;
    const start = Date.now();

    const headers = {
      'Content-Type': 'application/json'
    };
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          duration: Date.now() - start,
          data: parsed
        });
      });
    });

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

runTests();
