import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const ahora = new Date();
  const enMediaHora = new Date(ahora.getTime() + 30 * 60 * 1000); // 30 minutos

  // 1. Volver a abrir todas las subastas que acabamos de cerrar
  await prisma.subastas.updateMany({
    where: { estado: 'cerrada' },
    data: { estado: 'abierta' }
  });

  // 2. Extender el tiempo de cierre (fechaFin) para que tengas 30 minutos
  const subastasAbiertas = await prisma.subastas.findMany({
    where: { estado: 'abierta' },
    include: { extra_subastas: true, catalogos: true }
  });

  let subastasReabiertas = 0;
  for (const s of subastasAbiertas) {
    if (s.extra_subastas.length > 0) {
      await prisma.extra_subastas.update({
        where: { identificador: s.extra_subastas[0].identificador },
        data: { fechaFin: enMediaHora }
      });
      subastasReabiertas++;
    }

    // 3. Volver a marcar los artículos como "no subastados" para que se pueda pujar por ellos
    for (const c of s.catalogos) {
      await prisma.itemsCatalogo.updateMany({
        where: { catalogo: c.identificador },
        data: { subastado: 'no' }
      });
    }
  }

  console.log(`\n⏳ ¡Retrocediendo el tiempo y reabriendo puertas!`);
  console.log(`✅ Se reabrieron ${subastasReabiertas} subasta(s) y sus artículos.`);
  console.log(`🕒 Nueva hora de cierre: ${enMediaHora.toLocaleTimeString('es-AR')}`);
  console.log(`\n¡Ahora tienes 30 minutos enteros para ir a la app, entrar a la subasta y pujar con tranquilidad!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
