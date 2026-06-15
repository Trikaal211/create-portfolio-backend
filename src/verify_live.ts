import axios from 'axios';
import { prisma } from './config/db';

const API_URL = 'https://create-portfolio-backend.onrender.com/api';

async function runLiveAudit() {
  console.log('=== KIWICLICKS LIVE PRODUCTION RENDER API AUDIT ===\n');
  console.log(`Targeting Endpoint: ${API_URL}\n`);

  let token = '';
  const testId = `live-${Date.now().toString().slice(-6)}`;

  // 1. Verify API Health Check
  try {
    console.log('[1] Auditing Live API Health endpoint (/health)...');
    const healthRes = await axios.get(`${API_URL}/health`);
    if (healthRes.status === 200 && healthRes.data.status === 'ok') {
      console.log('    ✅ Live Health API: Connected (200 OK)');
      console.log(`    🟢 Response: ${JSON.stringify(healthRes.data)}`);
    } else {
      throw new Error(`Health endpoint returned status ${healthRes.status}`);
    }
  } catch (err: any) {
    console.error('    ❌ Live Health API: Failed (Render redeployment might still be building)');
    console.error(`       Error: ${err.message}`);
    process.exit(1);
  }

  // 2. Verify Admin Login API & JWT Generation
  try {
    console.log('\n[2] Auditing JWT Authentication Flow (Login)...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@kiwiclicks.com',
      password: 'admin123',
    });

    if (loginRes.status === 200 && loginRes.data.status === 'success') {
      token = loginRes.data.token;
      console.log('    ✅ Login API: Connected (200 OK)');
      console.log(`    ✅ JWT Token acquired: Bearer ${token.slice(0, 15)}...`);
    } else {
      throw new Error(`Auth endpoint returned status ${loginRes.status}`);
    }
  } catch (err: any) {
    console.error('    ❌ JWT Authentication Flow: Failed');
    console.error(`       Error: ${err.message}`);
    process.exit(1);
  }

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // 3. Audit Dashboard Metrics API
  try {
    console.log('\n[3] Auditing Dashboard Metrics Fetching...');
    const statsRes = await axios.get(`${API_URL}/dashboard/stats`, authHeaders);
    if (statsRes.status === 200 && statsRes.data.status === 'success') {
      console.log('    ✅ Dashboard Stats API: Connected (200 OK)');
      console.log(`    📊 Total Blogs Count: ${statsRes.data.data.stats.blogs.total}`);
      console.log(`    📊 Total Leads Count: ${statsRes.data.data.stats.leads.total}`);
    } else {
      throw new Error(`Stats endpoint returned status ${statsRes.status}`);
    }
  } catch (err: any) {
    console.error('    ❌ Dashboard Metrics Fetching: Failed');
    console.error(`       Error: ${err.message}`);
  }

  // 4. Audit Blog CRUD
  try {
    console.log('\n[4] Auditing Blog CRUD...');
    const blogPayload = {
      title: `Live Audit Blog ${testId}`,
      excerpt: 'This is a test blog post generated during live integration verification.',
      content: '<p>Standard integration audit verification text content.</p>',
      featuredImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
      category: 'AI Automation',
      author: 'Live Audit Engine',
      tags: ['Live', 'Audit'],
      published: false,
      metaTitle: 'Live Audit Meta Title',
      metaDescription: 'Live Audit Description content',
      keywords: ['live', 'audit'],
      canonicalUrl: 'https://kiwiclicks.in/blog/audit'
    };

    // Create blog
    const createRes = await axios.post(`${API_URL}/blogs`, blogPayload, authHeaders);
    if (createRes.status === 201) {
      console.log('    ✅ Create Blog API: Connected (201 Created)');
      const blogId = createRes.data.data.blog.id;

      // Update blog (Publish it)
      const updateRes = await axios.put(`${API_URL}/blogs/${blogId}`, { published: true }, authHeaders);
      if (updateRes.status === 200 && updateRes.data.data.blog.published === true) {
        console.log('    ✅ Update Blog API (Publish): Connected (200 OK)');
      }

      // Fetch all public blogs to verify listing
      const getRes = await axios.get(`${API_URL}/blogs`);
      const found = getRes.data.data.blogs.some((b: any) => b.id === blogId);
      if (getRes.status === 200 && found) {
        console.log('    ✅ Get Public Blogs Listing: Verified');
      }

      // Cleanup (Delete Blog)
      const deleteRes = await axios.delete(`${API_URL}/blogs/${blogId}`, authHeaders);
      if (deleteRes.status === 204) {
        console.log('    ✅ Delete Blog API: Connected (204 No Content)');
      }
    }
  } catch (err: any) {
    console.error('    ❌ Blog CRUD Audit: Failed');
    console.error(`       Error: ${err.message}`);
  }

  // 5. Audit Team Management CRUD
  try {
    console.log('\n[5] Auditing Team Management CRUD...');
    const teamPayload = {
      name: `Live Auditor ${testId}`,
      designation: 'Live Security Auditor',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      bio: 'Live automation verification engine.',
      linkedin: 'https://linkedin.com/company/kiwiclicks',
      twitter: 'https://twitter.com/kiwiclicks',
    };

    // Create
    const createRes = await axios.post(`${API_URL}/team`, teamPayload, authHeaders);
    if (createRes.status === 201) {
      console.log('    ✅ Create Team Member API: Connected (201 Created)');
      const memberId = createRes.data.data.teamMember.id;

      // Fetch listing
      const listRes = await axios.get(`${API_URL}/team`);
      const found = listRes.data.data.teamMembers.some((m: any) => m.id === memberId);
      if (listRes.status === 200 && found) {
        console.log('    ✅ Get Team Members Listing: Verified');
      }

      // Cleanup (Delete)
      const deleteRes = await axios.delete(`${API_URL}/team/${memberId}`, authHeaders);
      if (deleteRes.status === 204) {
        console.log('    ✅ Delete Team Member API: Connected (204 No Content)');
      }
    }
  } catch (err: any) {
    console.error('    ❌ Team CRUD Audit: Failed');
    console.error(`       Error: ${err.message}`);
  }

  // 6. Audit FAQ CRUD
  try {
    console.log('\n[6] Auditing FAQ CRUD...');
    const faqPayload = {
      question: `Is the live system audited? [${testId}]`,
      answer: 'Yes, full live integration test suites have run and validated connection pools.',
      category: 'Compliance'
    };

    // Create
    const createRes = await axios.post(`${API_URL}/faqs`, faqPayload, authHeaders);
    if (createRes.status === 201) {
      console.log('    ✅ Create FAQ API: Connected (201 Created)');
      const faqId = createRes.data.data.faq.id;

      // Fetch list
      const listRes = await axios.get(`${API_URL}/faqs`);
      const found = listRes.data.data.faqs.some((f: any) => f.id === faqId);
      if (listRes.status === 200 && found) {
        console.log('    ✅ Get FAQs Listing: Verified');
      }

      // Cleanup (Delete)
      const deleteRes = await axios.delete(`${API_URL}/faqs/${faqId}`, authHeaders);
      if (deleteRes.status === 204) {
        console.log('    ✅ Delete FAQ API: Connected (204 No Content)');
      }
    }
  } catch (err: any) {
    console.error('    ❌ FAQ CRUD Audit: Failed');
    console.error(`       Error: ${err.message}`);
  }

  // 7. Audit Testimonial CRUD
  try {
    console.log('\n[7] Auditing Testimonial CRUD...');
    const testimonialPayload = {
      clientName: `Live Client [${testId}]`,
      company: 'LiveLabs Ltd',
      designation: 'Engineering Director',
      review: 'Live integration audit succeeded correctly.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956'
    };

    // Create
    const createRes = await axios.post(`${API_URL}/testimonials`, testimonialPayload, authHeaders);
    if (createRes.status === 201) {
      console.log('    ✅ Create Testimonial API: Connected (201 Created)');
      const testimonialId = createRes.data.data.testimonial.id;

      // Fetch list
      const listRes = await axios.get(`${API_URL}/testimonials`);
      const found = listRes.data.data.testimonials.some((t: any) => t.id === testimonialId);
      if (listRes.status === 200 && found) {
        console.log('    ✅ Get Testimonials Listing: Verified');
      }

      // Cleanup (Delete)
      const deleteRes = await axios.delete(`${API_URL}/testimonials/${testimonialId}`, authHeaders);
      if (deleteRes.status === 204) {
        console.log('    ✅ Delete Testimonial API: Connected (204 No Content)');
      }
    }
  } catch (err: any) {
    console.error('    ❌ Testimonial CRUD Audit: Failed');
    console.error(`       Error: ${err.message}`);
  }

  // 8. Audit Global Settings Update
  try {
    console.log('\n[8] Auditing Global Settings updates...');
    const settingsPayload = {
      agencyName: 'KiwiClicks',
      phone: '+91-11-23310000',
      email: 'hello@kiwiclicks.agency',
      address: 'Connaught Place, New Delhi 110001',
      mapsLink: 'https://maps.google.com',
      facebookLink: 'https://facebook.com/kiwiclicks',
      instagramLink: 'https://instagram.com/kiwiclicks',
      linkedinLink: 'https://linkedin.com/company/kiwiclicks',
      twitterLink: 'https://twitter.com/kiwiclicks'
    };

    // Update settings
    const updateRes = await axios.put(`${API_URL}/settings`, settingsPayload, authHeaders);
    if (updateRes.status === 200 && updateRes.data.status === 'success') {
      console.log('    ✅ Update Global Settings API: Connected (200 OK)');
    }
  } catch (err: any) {
    console.error('    ❌ Global Settings Audit: Failed');
    console.error(`       Error: ${err.message}`);
  }

  // 9. Audit Image Upload & Fallback Behaviour
  try {
    console.log('\n[9] Auditing Image Upload Flow & Fallback Behavior...');
    const uploadCheckRes = await axios.post(`${API_URL}/upload`, {}, {
      ...authHeaders,
      validateStatus: (status) => status === 400
    });

    if (uploadCheckRes.status === 400 && uploadCheckRes.data.message.includes('upload')) {
      console.log('    ✅ Image Upload API Check: Connected (Endpoint active, handles fallback/errors correctly)');
    }
  } catch (err: any) {
    console.error('    ❌ Image Upload Audit: Failed');
    console.error(`       Error: ${err.message}`);
  }

  // 10. Audit Contact Leads
  try {
    console.log('\n[10] Auditing Lead submission...');
    const leadPayload = {
      name: `Lead Auditor ${testId}`,
      email: 'lead@audit.com',
      phone: '+91-9999999999',
      service: 'AI Automation',
      budget: '₹50,000 - ₹1,00,000',
      message: 'This is an integration test query.'
    };

    const leadRes = await axios.post(`${API_URL}/leads`, leadPayload);
    if (leadRes.status === 201 && leadRes.data.status === 'success') {
      console.log('    ✅ Lead Submission API: Connected (201 Created)');
      console.log(`    📧 Response: Lead successfully dispatched`);
      
      // Delete the test lead from database to keep lead queue clean
      const leadId = leadRes.data.data.contactLead.id;
      // We can use direct database access or wait
      await prisma.contactLead.delete({ where: { id: leadId } });
      console.log('    ✅ Database Restored: Verification Sandbox cleaned');
    }
  } catch (err: any) {
    console.error('    ❌ Lead Submission Audit: Failed');
    console.error(`       Error: ${err.message}`);
  }

  console.log('\n=== KIWICLICKS LIVE RENDER INTEGRATION AUDIT COMPLETED ===\n');
}

runLiveAudit();
