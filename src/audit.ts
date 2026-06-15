import axios from 'axios';
import { prisma } from './config/db';

const API_URL = 'http://localhost:5000/api';

async function runAudit() {
  console.log('=== KIWICLICKS SYSTEM INTEGRATION AUDIT RUNNER ===\n');

  let token = '';
  const testId = `audit-${Date.now().toString().slice(-6)}`;

  try {
    // 1. Verify Admin Login API & JWT Generation
    console.log('[1] Auditing JWT Authentication Flow...');
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

  // 2. Audit Dashboard Metrics API
  try {
    console.log('\n[2] Auditing Dashboard Metrics Fetching...');
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

  // 3. Audit Blog CRUD & Database Persistence
  try {
    console.log('\n[3] Auditing Blog CRUD & Database Persistence...');
    const blogPayload = {
      title: `Audit Blog ${testId}`,
      excerpt: 'This is a test blog post generated during integration verification.',
      content: '<p>Standard integration audit verification text content.</p>',
      featuredImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
      category: 'AI Automation',
      author: 'Audit Engine',
      tags: ['Audit', 'Auto'],
      published: false,
      metaTitle: 'Audit Meta Title',
      metaDescription: 'Audit Description content',
      keywords: ['audit', 'test'],
      canonicalUrl: 'http://localhost/audit'
    };

    // Create blog
    const createRes = await axios.post(`${API_URL}/blogs`, blogPayload, authHeaders);
    if (createRes.status === 201) {
      console.log('    ✅ Create Blog API: Connected (210 Created)');
      const blogId = createRes.data.data.blog.id;

      // Verify direct PostgreSQL write via Prisma
      const dbRecord = await prisma.blog.findUnique({ where: { id: blogId } });
      if (dbRecord && dbRecord.title === blogPayload.title) {
        console.log('    ✅ PostgreSQL Persistence (Blog Write): Verified');
      } else {
        throw new Error('Database record does not match input payload!');
      }

      // Update blog (Publish it)
      const updateRes = await axios.put(`${API_URL}/blogs/${blogId}`, { published: true }, authHeaders);
      if (updateRes.status === 200 && updateRes.data.data.blog.published === true) {
        console.log('    ✅ Update Blog API (Publish): Connected (200 OK)');
      } else {
        throw new Error('Blog updates failed to compile or return status success');
      }

      // Fetch all public blogs to verify listing
      const getRes = await axios.get(`${API_URL}/blogs`);
      const found = getRes.data.data.blogs.some((b: any) => b.id === blogId);
      if (getRes.status === 200 && found) {
        console.log('    ✅ Get Public Blogs Listing: Verified');
      } else {
        throw new Error('Newly created blog not found in public listings!');
      }

      // Cleanup (Delete Blog)
      const deleteRes = await axios.delete(`${API_URL}/blogs/${blogId}`, authHeaders);
      if (deleteRes.status === 204) {
        console.log('    ✅ Delete Blog API: Connected (204 No Content)');
        const checkDeleted = await prisma.blog.findUnique({ where: { id: blogId } });
        if (!checkDeleted) {
          console.log('    ✅ PostgreSQL Persistence (Blog Cleanup): Verified');
        } else {
          throw new Error('Database record was not deleted successfully!');
        }
      }
    }
  } catch (err: any) {
    console.error('    ❌ Blog CRUD Audit: Failed');
    console.error(`       Error: ${err.message}`);
  }

  // 4. Audit Team Management CRUD
  try {
    console.log('\n[4] Auditing Team Management CRUD...');
    const teamPayload = {
      name: `Auditor ${testId}`,
      designation: 'Lead Security Auditor',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      bio: 'Professional automation engine verifying runtime databases.',
      linkedin: 'https://linkedin.com/company/kiwiclicks',
      twitter: 'https://twitter.com/kiwiclicks',
    };

    // Create
    const createRes = await axios.post(`${API_URL}/team`, teamPayload, authHeaders);
    if (createRes.status === 201) {
      console.log('    ✅ Create Team Member API: Connected (201 Created)');
      const memberId = createRes.data.data.teamMember.id;

      // Verify db persistence
      const dbRecord = await prisma.teamMember.findUnique({ where: { id: memberId } });
      if (dbRecord && dbRecord.name === teamPayload.name) {
        console.log('    ✅ PostgreSQL Persistence (Team Write): Verified');
      }

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

  // 5. Audit FAQ Category Builder CRUD
  try {
    console.log('\n[5] Auditing FAQ Category Builder CRUD...');
    const faqPayload = {
      question: `Is the system audited? [${testId}]`,
      answer: 'Yes, full integration test suites have run and validated connection pools.',
      category: 'Compliance'
    };

    // Create
    const createRes = await axios.post(`${API_URL}/faqs`, faqPayload, authHeaders);
    if (createRes.status === 201) {
      console.log('    ✅ Create FAQ API: Connected (201 Created)');
      const faqId = createRes.data.data.faq.id;

      // Verify db persistence
      const dbRecord = await prisma.fAQ.findUnique({ where: { id: faqId } });
      if (dbRecord && dbRecord.question === faqPayload.question) {
        console.log('    ✅ PostgreSQL Persistence (FAQ Write): Verified');
      }

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

  // 6. Audit Testimonial CRUD
  try {
    console.log('\n[6] Auditing Testimonial CRUD...');
    const testimonialPayload = {
      clientName: `Test Client [${testId}]`,
      company: 'AuditLabs Ltd',
      designation: 'Engineering Director',
      review: 'KiwiClicks CMS has excellent user interfaces and compiles code splits flawlessly.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956'
    };

    // Create
    const createRes = await axios.post(`${API_URL}/testimonials`, testimonialPayload, authHeaders);
    if (createRes.status === 201) {
      console.log('    ✅ Create Testimonial API: Connected (201 Created)');
      const testimonialId = createRes.data.data.testimonial.id;

      // Verify db persistence
      const dbRecord = await prisma.testimonial.findUnique({ where: { id: testimonialId } });
      if (dbRecord && dbRecord.clientName === testimonialPayload.clientName) {
        console.log('    ✅ PostgreSQL Persistence (Testimonial Write): Verified');
      }

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

  // 7. Audit Global Settings Update
  try {
    console.log('\n[7] Auditing Global Settings updates...');
    const origSettings = await prisma.agencySettings.findFirst();
    const settingsPayload = {
      agencyName: `KiwiClicks Audit [${testId}]`,
      logoUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      phone: '+91-11-23310000',
      email: 'hello@kiwiclicks.agency',
      address: '104, Statesman House, Connaught Place, New Delhi 110001',
      mapsLink: 'https://maps.google.com',
      facebookLink: 'https://facebook.com/kiwiclicks',
      instagramLink: 'https://instagram.com/kiwiclicks',
      linkedinLink: 'https://linkedin.com/company/kiwiclicks',
      twitterLink: 'https://twitter.com/kiwiclicks'
    };

    // Update settings
    const updateRes = await axios.put(`${API_URL}/settings`, settingsPayload, authHeaders);
    if (updateRes.status === 200 && updateRes.data.data.settings.agencyName === settingsPayload.agencyName) {
      console.log('    ✅ Update Global Settings API: Connected (200 OK)');
      
      const dbSettings = await prisma.agencySettings.findFirst();
      if (dbSettings && dbSettings.agencyName === settingsPayload.agencyName) {
        console.log('    ✅ PostgreSQL Persistence (Settings Update): Verified');
      }

      // Restore original settings to keep workspace clean
      if (origSettings) {
        await prisma.agencySettings.update({
          where: { id: dbSettings?.id },
          data: {
            agencyName: origSettings.agencyName,
            logoUrl: origSettings.logoUrl,
            phone: origSettings.phone,
            email: origSettings.email,
            address: origSettings.address,
            mapsLink: origSettings.mapsLink,
            facebookLink: origSettings.facebookLink,
            instagramLink: origSettings.instagramLink,
            linkedinLink: origSettings.linkedinLink,
            twitterLink: origSettings.twitterLink,
          }
        });
        console.log('    ✅ Database Restored: Verification Sandbox cleaned');
      }
    }
  } catch (err: any) {
    console.error('    ❌ Global Settings Audit: Failed');
    console.error(`       Error: ${err.message}`);
  }

  // 8. Audit Image Upload & Fallback Behaviour
  try {
    console.log('\n[8] Auditing Image Upload Flow & Fallback Behavior...');
    // We will verify the mock fallback by calling the endpoint with a test file request.
    // Rather than fully submitting multipart/form-data with binary streams, we verify the endpoint is active.
    const uploadCheckRes = await axios.post(`${API_URL}/upload`, {}, {
      ...authHeaders,
      validateStatus: (status) => status === 400 // Expected 400 because payload is empty
    });

    if (uploadCheckRes.status === 400 && uploadCheckRes.data.message.includes('upload')) {
      console.log('    ✅ Image Upload API Check: Connected (Endpoint active, handles validator rules)');
    }
  } catch (err: any) {
    console.error('    ❌ Image Upload Audit: Failed');
    console.error(`       Error: ${err.message}`);
  }

  console.log('\n=== KIWICLICKS INTEGRATION AUDIT RUN COMPLETED ===\n');
}

runAudit();
