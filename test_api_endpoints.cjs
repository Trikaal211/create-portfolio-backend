const http = require('http');

const request = (method, path, body, headers = {}) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    
    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ statusCode: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: responseBody });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
};

async function test() {
  console.log('--- STARTING KIWICLICKS API VERIFICATION ---');

  // 1) Test Admin Login
  console.log('\n[1] Testing Admin Login...');
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'admin@kiwiclicks.com',
    password: 'admin123'
  });
  console.log('Status Code:', loginRes.statusCode);
  if (loginRes.statusCode !== 200 || !loginRes.body.token) {
    console.error('Login failed! Response:', loginRes.body);
    process.exit(1);
  }
  const token = loginRes.body.token;
  console.log('Login successful! Token acquired.');

  // 2) Get Dashboard Stats
  console.log('\n[2] Testing Get Dashboard Stats...');
  const statsRes = await request('GET', '/api/dashboard/stats', null, {
    'Authorization': `Bearer ${token}`
  });
  console.log('Status Code:', statsRes.statusCode);
  console.log('Stats:', JSON.stringify(statsRes.body, null, 2));

  // 3) Create a new blog post
  console.log('\n[3] Testing Create Blog Post...');
  const newBlogRes = await request('POST', '/api/blogs', {
    title: 'Top AI Growth Hacks in 2026',
    excerpt: 'Simple AI agent flows to scale digital marketing agencies.',
    content: 'This post covers how digital marketing agencies can leverage large language models to automate lead generation and email drafts...',
    featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a',
    category: 'AI Automation',
    author: 'KiwiClicks Admin',
    tags: ['AI', 'Growth Hacks'],
    published: true
  }, {
    'Authorization': `Bearer ${token}`
  });
  console.log('Status Code:', newBlogRes.statusCode);
  console.log('Created Blog:', JSON.stringify(newBlogRes.body, null, 2));

  // 4) Get All Blogs
  console.log('\n[4] Testing Get All Blogs (Public)...');
  const blogsRes = await request('GET', '/api/blogs');
  console.log('Status Code:', blogsRes.statusCode);
  console.log('Number of blogs retrieved:', blogsRes.body.results);

  console.log('\n--- API VERIFICATION COMPLETED SUCCESSFULLY ---');
}

test().catch(console.error);
