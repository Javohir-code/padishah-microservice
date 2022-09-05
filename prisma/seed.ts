import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // await prisma.user.deleteMany();
  // await prisma.roles.deleteMany();
  // await prisma.roleUsers.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        firstName: 'Javokhir',
        lastName: 'Omonov',
        email: 'javokhiromonov@gmail.com',
        password: await argon.hash('12345'),
        msisdn: '998995790967',
      },
      {
        firstName: 'John',
        lastName: 'Martin',
        email: 'john@gmail.com',
        password: await argon.hash('123456'),
        msisdn: '998900060912',
      },
    ],
  });
  await prisma.roles.createMany({
    data: [{ name: 'ADMIN' }, { name: 'CLIENT' }, { name: 'MERCHANT' }],
  });

  await prisma.roleUsers.createMany({
    data: [
      {
        userId: 3,
        roleId: 1,
      },
      {
        userId: 4,
        roleId: 2,
      },
    ],
  });
}

main()
  .catch((err) => console.error(err))
  .finally(async () => await prisma.$disconnect());
