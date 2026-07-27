import { PrismaClient, Role } from '@prisma/client';
import { passwordService } from '../src/modules/auth/password.service';

const prisma = new PrismaClient();

const seedUsers = [
  {
    name: 'EBMS Admin',
    email: 'admin@ebms.local',
    password: 'Admin@2026!',
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
] as const;

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