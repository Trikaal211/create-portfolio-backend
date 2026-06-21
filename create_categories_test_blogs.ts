import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

async function main() {
  console.log('--- CREATING TEST CATEGORIES BLOGS VIA API ---');

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

  // 2) Create Design Blog
  const designTitle = `Exploring Modern Web Design ${Date.now()}`;
  console.log(`Creating Design blog post: "${designTitle}"...`);
  const designPayload = {
    title: designTitle,
    excerpt: 'An article focused on modern web design, UI elements, neon shadows and sleek layout guidelines.',
    content: '<p>Modern web design requires harmonious colors, clean layout, typography choice, and premium transitions. In this article, we cover how to leverage glassmorphism and bold styling in 2026.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?auto=format&fit=crop&w=600&q=80',
    category: 'Design',
    author: 'James Mercer',
    tags: ['Design', 'UX', 'UI'],
    published: true,
    metaTitle: `SEO Meta: ${designTitle}`,
    metaDescription: 'Modern web design guidelines and tips.',
    keywords: ['Design', 'UI', 'UX'],
  };

  const designRes = await axios.post(`${API_URL}/blogs`, designPayload, authHeaders);
  console.log('Design blog created successfully! Slug:', designRes.data.data.blog.slug);

  // 3) Create Architecture Blog
  const archTitle = `Information Architecture in Modern Systems ${Date.now()}`;
  console.log(`Creating Architecture blog post: "${archTitle}"...`);
  const archPayload = {
    title: archTitle,
    excerpt: 'An investigation into information architecture, system blueprints, and directory structures.',
    content: '<p>System architecture defines how data flows between client, database, and caching systems. Here we analyze the most stable design architectures for full stack development.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    category: 'Architecture',
    author: 'James Mercer',
    tags: ['Architecture', 'Systems', 'Blueprints'],
    published: true,
    metaTitle: `SEO Meta: ${archTitle}`,
    metaDescription: 'System blueprint information architecture guidelines.',
    keywords: ['Architecture', 'Systems'],
  };

  const archRes = await axios.post(`${API_URL}/blogs`, archPayload, authHeaders);
  console.log('Architecture blog created successfully! Slug:', archRes.data.data.blog.slug);

  console.log('--- TEST CATEGORY BLOGS CREATED SUCCESSFULLY ---');
}

main().catch((err) => {
  console.error('Failed to create test blogs:', err.response?.data || err.message);
});
