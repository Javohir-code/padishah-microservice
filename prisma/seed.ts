import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  await prisma.roles.deleteMany();
  await prisma.roleUsers.deleteMany();

  await prisma.user.create({
    data: {
      firstName: 'Javokhir',
      lastName: 'Omonov',
      email: 'javokhiromonov@gmail.com',
      password: await hash('12345', 10),
      msisdn: '998995790967',
    },
  });
}

main()
  .catch((err) => console.error(err))
  .finally(async () => await prisma.$disconnect());
