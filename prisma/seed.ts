import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seed() {
  console.log('Seeding database...');

  // 1. Api Key
  await prisma.apiKey.upsert({
    where: { key: 'GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj' },
    update: {},
    create: {
      key: 'GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj',
      permissions: ['GENERAL'],
      comments: ['To be used by the xyz vendor'],
      version: 1,
      status: true,
    },
  });

  // 2. Roles
  const roles = ['LEARNER', 'WRITER', 'EDITOR', 'ADMIN'];
  for (const code of roles) {
    await prisma.role.upsert({
      where: { code },
      update: {},
      create: {
        code,
        status: true,
      },
    });
  }

  // 3. Admin User
  const adminEmail = 'admin@xyz.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('changeit', 10);
    const allRoles = await prisma.role.findMany();
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: passwordHash,
        status: true,
        verified: true,
        roles: {
          connect: allRoles.map((r) => ({ id: r.id })),
        },
      },
    });
  }

  console.log('Database seeded successfully!');
}

if (require.main === module) {
  seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
