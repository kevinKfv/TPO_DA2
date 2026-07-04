import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const ahora = new Date();
  const enUnMinuto = new Date(ahora.getTime() + 60 * 1000);

  // Buscamos todas las subastas abiertas
  const abiertas = await prisma.subastas.findMany({
    where: { estado: 'abierta' },
    include: { extra_subastas: true }
  });

  let count = 0;
  for (const s of abiertas) {
    if (s.extra_subastas.length > 0) {
      // Actualizamos la fechaFin del detalle extra de la subasta a "dentro de 1 minuto"
      await prisma.extra_subastas.update({
        where: { identificador: s.extra_subastas[0].identificador },
        data: { fechaFin: enUnMinuto }
      });
      count++;
    }
  }

  console.log(`\n⏳ ¡Acelerando el tiempo!`);
  console.log(`✅ Se configuraron ${count} subasta(s) activa(s) para que finalicen en exactamente 1 minuto.`);
  console.log(`🕒 Hora actual: ${ahora.toLocaleTimeString('es-AR')}`);
  console.log(`🏁 Cierre programado: ${enUnMinuto.toLocaleTimeString('es-AR')}`);
  console.log(`\nEl servidor backend está revisando constantemente (cada 30 segundos). Apenas pase 1 minuto, cerrará la subasta automáticamente. Si nadie pujó, los artículos se marcarán como no vendidos.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
