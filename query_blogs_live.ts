import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Querying blogs from the KiwiClicks Neon database...');
  const blogs = await prisma.blog.findMany();
  console.log('Total blogs:', blogs.length);
  blogs.forEach((blog) => {
    console.log(`- Title: ${blog.title}`);
    console.log(`  Slug: ${blog.slug}`);
    console.log(`  Published: ${blog.published}`);
    console.log(`  Category: ${blog.category}`);
    console.log(`  CreatedAt: ${blog.createdAt}`);
    console.log(`  FeaturedImage: ${blog.featuredImage}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
