import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding KiwiClicks database...');

  // 1) Clean tables before seeding to prevent key conflicts
  await prisma.adminUser.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.contactLead.deleteMany();
  await prisma.service.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.agencySettings.deleteMany();

  // 2) Create default Administrative Login Profile
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.adminUser.create({
    data: {
      name: 'KiwiClicks Admin',
      email: 'admin@kiwiclicks.com',
      password: hashedPassword,
      role: 'admin',
    },
  });
  console.log('Default Admin Account Seeded:', admin.email);

  // 3) Create Service Offerings
  await prisma.service.createMany({
    data: [
      {
        title: 'Search Engine Optimization (SEO)',
        slug: 'seo-and-local-seo',
        description: 'Boost your website visibility on search engines and attract local customers with targeted organic strategy.',
        featuredImage: 'https://images.unsplash.com/photo-1571721795195-a2ca2d3370a9?auto=format&fit=crop&w=600&q=80',
        content: 'Our SEO & Local SEO service covers full-scale technical audits, competitor research, keyword planning, content writing, link building, and Google Business Profile optimization. We focus on driving real revenue by ranking you for high-intent keywords.',
      },
      {
        title: 'Social Media Marketing',
        slug: 'social-media-marketing',
        description: 'Engage your audience and build brand loyalty across platforms like Instagram, LinkedIn, and Facebook.',
        featuredImage: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80',
        content: 'We curate bespoke social media strategies including visual content design, copywriting, Reels/video editing, scheduling, paid advertisement funnels, and community engagement. Grow your organic reach and conversion rates today.',
      },
      {
        title: 'Website Development',
        slug: 'website-development',
        description: 'Create high-performance, responsive, and aesthetically stunning custom web solutions designed to convert.',
        featuredImage: 'https://images.unsplash.com/photo-1547658719-da2b81169b7a?auto=format&fit=crop&w=600&q=80',
        content: 'From Next.js applications to WordPress platforms, we build secure, accessible, SEO-optimized, and lightning-fast websites tailored to digital conversion. Complete with animations, custom dashboards, and third-party integrations.',
      },
      {
        title: 'AI Automation & Integration',
        slug: 'ai-automation',
        description: 'Leverage artificial intelligence agentic workflows to save hours and automate repetitive business operations.',
        featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80',
        content: 'We build custom AI integrations, multi-agent automated systems, custom customer service chatbots, database syncs, and visual automation pipelines (Make/Zapier) that reduce human labor bottlenecks by up to 90%.',
      },
    ],
  });
  console.log('Services Seeded');

  // 4) Create Team Members
  await prisma.teamMember.createMany({
    data: [
      {
        name: 'Bandana Kumari',
        designation: 'Founder & Growth Strategist',
        image: '/founder.png',
        bio: 'Bandana Kumari is the Founder & Growth Strategist at KiwiClicks. She specializes in Local SEO, Google Business Profile Optimization, Lead Generation, Digital Marketing Strategy, and Online Reputation Management.\n\nWith 4+ years of experience helping local businesses generate visibility, trust, and qualified leads, she focuses on building sustainable growth systems instead of short-term marketing tactics.\n\nShe has successfully helped businesses improve Google rankings, increase inquiries, optimize local search presence, and create measurable growth through data-driven digital marketing strategies.',
        linkedin: 'https://linkedin.com/in/bandana-kumari',
        twitter: 'https://twitter.com/bandana_strategy',
      },
      {
        name: 'Shammy Kumar',
        designation: 'Co-Founder & Growth Strategist',
        image: '/cofounder.png',
        bio: 'Shammy Kumar is a Digital Marketing & Growth Specialist with expertise in SEO, Google Ads, Meta Ads, Lead Generation, Website Development, Shopify, WordPress, and Marketing Automation.\n\nWith experience across 30+ business categories, he helps companies scale visibility, generate qualified leads, and build conversion-focused digital systems that drive long-term growth.\n\nHis strength lies in combining technical execution with marketing strategy to produce measurable business outcomes.',
        linkedin: 'https://linkedin.com/in/shammy-kumar',
        twitter: 'https://twitter.com/shammy_ads',
      },
      {
        name: 'Priya Sharma',
        designation: 'SEO Specialist',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        bio: 'Priya is a dedicated SEO Specialist focusing on Local SEO, ranking local business listings, and executing technical search strategies to maximize organic search visibility.',
        linkedin: 'https://linkedin.com/in/priya-sharma-seo',
      },
      {
        name: 'Rahul Verma',
        designation: 'Performance Marketing Manager',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        bio: 'Rahul manages performance marketing budgets, designing and scaling conversion-focused ad campaigns on Meta and Google to drive inbound leads.',
        linkedin: 'https://linkedin.com/in/rahul-verma-marketing',
      },
      {
        name: 'Neha Arora',
        designation: 'Content & Brand Strategist',
        image: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=400&q=80',
        bio: 'Neha is a creative content strategist and copywriter, formulating brand campaigns and content schedules that engage audiences and build digital trust.',
        linkedin: 'https://linkedin.com/in/neha-arora-content',
      },
    ],
  });
  console.log('Team Members Seeded');

  // 5) Create Testimonials
  await prisma.testimonial.createMany({
    data: [
      {
        clientName: 'Sarah Higgins',
        company: 'Apex Logistics',
        designation: 'Marketing Director',
        review: 'KiwiClicks completely transformed our website and boosted our organic traffic by 150% in under 6 months. Absolute professionals!',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      },
      {
        clientName: 'David Vance',
        company: 'Vance Dental Clinic',
        designation: 'Owner',
        review: 'Their local SEO campaigns filled our booking schedule within weeks. We highly recommend KiwiClicks for any local business.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      },
    ],
  });
  console.log('Testimonials Seeded');

  // 6) Create FAQs
  await prisma.fAQ.createMany({
    data: [
      {
        question: 'How long does it take to see results from SEO?',
        answer: 'SEO is a long-term investment. Most clients begin seeing positive movement in search keyword rankings and local listing impressions within 3 to 6 months.',
        category: 'SEO',
      },
      {
        question: 'Do you design custom websites or use templates?',
        answer: 'We design custom web structures tailored precisely to your brand guidelines and marketing funnel requirements, ensuring peak responsiveness and loading speeds.',
        category: 'Development',
      },
      {
        question: 'What is your monthly pricing structure?',
        answer: 'We offer customized monthly retainers based on your specific growth goals, service areas, and budget scope. Contact us for a detailed proposal.',
        category: 'Pricing',
      },
    ],
  });
  console.log('FAQs Seeded');

  // 7) Create Blog Articles
  await prisma.blog.createMany({
    data: [
      {
        title: 'The Future of SEO: AI Search & Core Web Vitals in 2026',
        slug: 'future-of-seo-2026',
        excerpt: 'Discover how AI search engines and search experience optimization are redefining Google rankings.',
        content: 'AI search answers and structured schema markups are taking over classic search result pages. To stand out in 2026, content creators must publish deep, verified information, secure quality backlinks, and optimize Core Web Vitals to deliver immediate user experiences.',
        featuredImage: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=600&q=80',
        category: 'SEO',
        author: 'Aanya Patel',
        tags: ['SEO', 'AI', 'Search Engine Optimization', 'Tech Trends'],
        published: true,
      },
      {
        title: 'How to Build an AI Assistant for Client Intake',
        slug: 'build-client-intake-ai-assistant',
        excerpt: 'A step-by-step guide on streamlining agency operations and capturing leads using automated agents.',
        content: 'Integrating a customized AI chatbot with tools like Make, Zapier, and your CRM can automate the process of capturing contact form leads, rating them, and booking discovery calls, saving your team up to 10 hours per week.',
        featuredImage: 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&w=600&q=80',
        category: 'AI',
        author: 'James Mercer',
        tags: ['AI', 'Automation', 'Agency Operations'],
        published: true,
      },
      {
        title: 'Draft - Social Media Calendar Planning tips',
        slug: 'draft-social-media-tips',
        excerpt: 'Unpublished blog draft containing content strategies for platforms like LinkedIn.',
        content: 'Detailed strategies on curating weekly content themes, mapping post templates, and tracking analytics metrics like engagement rate and follower growth.',
        featuredImage: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80',
        category: 'Marketing',
        author: 'James Mercer',
        tags: ['Marketing', 'Social Media'],
        published: false,
      },
    ],
  });
  console.log('Blogs Seeded');

  // 8) Create Leads
  await prisma.contactLead.createMany({
    data: [
      {
        name: 'Robert Stark',
        email: 'robert@starkindustries.com',
        phone: '+1-212-555-0182',
        service: 'AI Automation & Integration',
        budget: '$10,000 - $25,000',
        message: 'We want to integrate automated customer service agents with our Zendesk dashboard. Please share a quote.',
        status: 'pending',
      },
      {
        name: 'Elena Rostova',
        email: 'elena@rostov.design',
        phone: '+44-20-7946-0958',
        service: 'Website Development',
        budget: '$5,000 - $10,000',
        message: 'Looking to rebuild our design studio website. We require animations and standard dark mode layouts.',
        status: 'contacted',
      },
    ],
  });
  console.log('Contact Leads Seeded');

  // Seed default configurations
  await prisma.agencySettings.create({
    data: {
      agencyName: 'KiwiClicks',
      logoUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      phone: '6230078396',
      email: 'info@kiwiclicks.in',
      address: 'Dwarka Sector 2, New Delhi – 110077, India',
      mapsLink: 'https://maps.google.com',
      facebookLink: 'https://facebook.com/kiwiclicks',
      instagramLink: 'https://instagram.com/kiwiclicks',
      linkedinLink: 'https://linkedin.com/company/kiwiclicks',
      twitterLink: 'https://twitter.com/kiwiclicks',
    }
  });
  console.log('Agency Settings Seeded');

  console.log('Seeding completed successfully! 🎉');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
