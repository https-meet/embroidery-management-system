import { PrismaClient, Role } from '@prisma/client';
import { passwordService } from '../src/modules/auth/password.service';

const prisma = new PrismaClient();

const demoEmail = process.env.DEMO_EMAIL || 'demo@ebms.com';
const demoPassword = process.env.DEMO_PASSWORD || 'demo123';
const adminEmail = process.env.PROD_OWNER_EMAIL || 'admin@ebms.local';
const adminPassword = process.env.PROD_OWNER_PASSWORD || 'Admin@2026!';

const seedUsers = [
  {
    name: 'EBMS Admin',
    email: adminEmail,
    password: adminPassword,
    role: Role.ADMIN,
  },
  {
    name: 'EBMS Public Demo User',
    email: demoEmail,
    password: demoPassword,
    role: Role.ADMIN,
  },
  {
    name: 'EBMS Manager',
    email: 'manager@ebms.local',
    password: 'Manager@2026!',
    role: Role.MANAGER,
  },
  {
    name: 'EBMS Operator',
    email: 'operator@ebms.local',
    password: 'Operator@2026!',
    role: Role.OPERATOR,
  },
];

async function main(): Promise<void> {
  for (const user of seedUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { email: user.email },
        data: {
          name: user.name,
          role: user.role,
          isActive: true,
        },
      });

      continue;
    }

    const passwordHash = await passwordService.hash(user.password);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role,
        isActive: true,
      },
    });
  }

  console.log(`✅ Seeded ${seedUsers.length} local development users.`);
}

main()
  .catch((error) => {
    console.error('❌ Database seeding failed.');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });