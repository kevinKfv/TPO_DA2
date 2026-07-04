import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.extra_credencialesCliente.update({
    where: { email: 'demo@hammer.com' },
    data: { estadoCredencial: 'activo' }
  });
  console.log('El usuario demo ahora está activo y puede iniciar sesión.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
