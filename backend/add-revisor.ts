import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // El servicio busca un empleado con cargo que contenga "Revisor"
  // Actualizamos al empleado administrador (ID 1) para que también sea revisor.
  await prisma.empleados.update({
    where: { identificador: 1 },
    data: { cargo: 'Sistema y Revisor' }
  });
  console.log('✅ Empleado 1 actualizado. Ahora es Sistema y Revisor.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
