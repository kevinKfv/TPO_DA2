import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.extra_credencialesCliente.findFirst({ where: { email: 'demo@hammer.com' } });
  if (!user) throw new Error('Usuario demo no encontrado.');

  const userId = user.cliente;

  // Creamos una tarjeta de crédito verificada para el usuario
  await prisma.extra_metodosPago.create({
    data: {
      cliente: userId,
      tipo: 'tarjeta',
      numero: '4509123456789012',
      vencimiento: new Date('2028-12-01'),
      cvv: '123',
      estado: 'verificado', // ¡Verificada automáticamente para pruebas!
      titular: 'Usuario Demo',
      banco: 'Banco Prisma'
    }
  });

  // Además, lo inscribimos automáticamente como asistente a TODAS las subastas abiertas
  // por si acaso (para evitar el error 403)
  const subastasAbiertas = await prisma.subastas.findMany({ where: { estado: 'abierta' } });
  
  for (const subasta of subastasAbiertas) {
    const yaAsiste = await prisma.asistentes.findFirst({
      where: { cliente: userId, subasta: subasta.identificador }
    });

    if (!yaAsiste) {
      const count = await prisma.asistentes.count({ where: { subasta: subasta.identificador } });
      await prisma.asistentes.create({
        data: {
          cliente: userId,
          subasta: subasta.identificador,
          numeroPostor: count + 1
        }
      });
    }
  }

  console.log(`✅ ¡Éxito! Se le asignó una Tarjeta de Crédito "Verificada" al Usuario Demo.`);
  console.log(`✅ El Usuario Demo ha sido registrado oficialmente como asistente en las subastas.`);
  console.log(`👉 Ahora ya puedes volver a la app, entrar a la subasta y presionar el botón "Pujar".`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
