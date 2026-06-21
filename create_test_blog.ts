import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

async function main() {
  console.log('--- CREATING A TEST BLOG VIA API ---');

  // 1) Log in as admin
  console.log('Logging in as admin...');
  const loginRes = await axios.post(`${API_URL}/auth/login`, {
    email: 'admin@kiwiclicks.com',
    password: 'admin123'
  });
  const token = loginRes.data.token;
  console.log('Login successful! Token acquired.');

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // 2) Create a test blog post
  const testTitle = `Automated AI Agent Testing ${Date.now()}`;
  console.log(`Creating blog post: "${testTitle}"...`);
  const blogPayload = {
    title: testTitle,
    excerpt: 'This is a test blog post created dynamically via integration script to verify auto-slug, auto-canonical, and category filtering.',
    content: '<p>Integrating artificial intelligence into web applications can save hundreds of manual hours. This article goes deep into details of utilizing agentic workflows, APIs, and modern frontends like React to create automated web experiences.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80',
    category: 'AI',
    author: 'James Mercer',
    tags: ['AI', 'Automation', 'Vite'],
    published: true,
    metaTitle: `SEO Meta: ${testTitle}`,
    metaDescription: 'Meta description for SEO optimization workflows in KiwiClicks CMS.',
    keywords: ['AI', 'Automation'],
  };

  const createRes = await axios.post(`${API_URL}/blogs`, blogPayload, authHeaders);
  const createdBlog = createRes.data.data.blog;
  console.log('Blog created successfully! Details:');
  console.log('- ID:', createdBlog.id);
  console.log('- Title:', createdBlog.title);
  console.log('- Slug (Auto-generated):', createdBlog.slug);
  console.log('- Canonical URL (Auto-generated):', createdBlog.canonicalUrl);
  console.log('- Published:', createdBlog.published);
  console.log('- Category:', createdBlog.category);

  console.log('--- TEST BLOG CREATED SUCCESSFULLY ---');
}

main().catch((err) => {
  console.error('Failed to create test blog:', err.response?.data || err.message);
});
