import { PrismaClient } from '@prisma/client';
import { passwordService } from '../modules/auth/password.service';

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('=== CHECKING USERS IN DATABASE ===');
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users in database:\n`);

  for (const u of users) {
    console.log(`User ID: ${u.id}`);
    console.log(`Name   : ${u.name}`);
    console.log(`Email  : ${u.email}`);
    console.log(`Role   : ${u.role}`);
    console.log(`Active : ${u.isActive}`);

    const isMatchChauhan = await passwordService.verify('Chauhan@2025', u.passwordHash);
    console.log(`Password match for 'Chauhan@2025': ${isMatchChauhan}`);
    console.log('-----------------------------------');
  }
}

checkUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
