import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_EMAIL = 'contact@digitalnative.vip';

async function main() {
  // Find profile by email
  let profile = await prisma.profile.findFirst({ where: { email: TEST_EMAIL } });

  if (profile) {
    profile = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        isPro: true,
        userType: 'DEVELOPER',
        fullName: 'Digital Native',
        role: 'Full Stack Developer',
        location: 'Seoul, Korea',
        allowContact: true,
      },
    });
    console.log('Updated existing profile:', profile.id, profile.userId);
  } else {
    console.log('No profile found for', TEST_EMAIL);
    console.log('List all profiles:');
    const all = await prisma.profile.findMany({ select: { id: true, email: true, userId: true, isPro: true } });
    console.log(JSON.stringify(all, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
