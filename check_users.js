const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Querying database admin users...');
  try {
    const adminCount = await prisma.adminUser.count();
    console.log(`Total admin users found: ${adminCount}`);
    
    if (adminCount > 0) {
      const admins = await prisma.adminUser.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });
      console.log('Admin Users List:');
      console.log(JSON.stringify(admins, null, 2));
    } else {
      console.log('No admin users exist in the database!');
    }
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
