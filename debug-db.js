const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('--- DB Connection Test Start ---');
  try {
    const newUser = await prisma.user.create({
      data: {
        email: `test_${Date.now()}@example.com`,
        name: 'Test User',
        hashedPassword: 'password123'
      }
    });
    console.log('✅ Success! Created user:', newUser);
  } catch (e) {
    console.error('❌ Failed! Error details:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
