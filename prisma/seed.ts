import { PrismaClient, PermissionName } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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

  const hashedPassword = await bcrypt.hash('root', 10);

  const rootUser = await prisma.user.upsert({
    where: { email: 'root@local' },
    update: { name: 'root' },
    create: {
      name: 'root',
      email: 'root@local',
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
