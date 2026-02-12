import { PrismaClient, PermissionName } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  connectionLimit: 1,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const permissions = [
    { name: PermissionName.ADMIN, description: 'Administrador do sistema' },
    {
      name: PermissionName.READER,
      description: 'Leitor com acesso somente leitura',
    },
    {
      name: PermissionName.EDITOR,
      description: 'Editor com acesso de escrita',
    },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: { description: permission.description },
      create: permission,
    });
  }

  const adminPermission = await prisma.permission.findUnique({
    where: { name: PermissionName.ADMIN },
  });

  if (!adminPermission) {
    throw new Error('Permissão ADMIN não encontrada');
  }

  const hashedPassword = await bcrypt.hash('password', 10);

  const rootUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: { name: 'user' },
    create: {
      name: 'user',
      email: 'user@example.com',
      password: hashedPassword,
    },
  });

  await prisma.userPermission.upsert({
    where: {
      userId_permissionId: {
        userId: rootUser.id,
        permissionId: adminPermission.id,
      },
    },
    update: {},
    create: {
      userId: rootUser.id,
      permissionId: adminPermission.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
