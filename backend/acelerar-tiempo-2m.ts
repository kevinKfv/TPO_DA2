import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const ahora = new Date();
  const enDosMinutos = new Date(ahora.getTime() + 2 * 60 * 1000); // 2 minutos
  const haceUnRato = new Date(ahora.getTime() - 60 * 1000); // Para que aparezcan ya iniciadas

  // 1. Reabrimos cualquier subasta que se haya cerrado, y ajustamos la hora de inicio al PASADO
  await prisma.subastas.updateMany({
    data: { 
      estado: 'abierta',
      fecha: haceUnRato,
      hora: haceUnRato
    }
  });

  const abiertas = await prisma.subastas.findMany({
    where: { estado: 'abierta' },
    include: { extra_subastas: true, catalogos: true }
  });

  let count = 0;
  for (const s of abiertas) {
    if (s.extra_subastas.length > 0) {
      await prisma.extra_subastas.update({
        where: { identificador: s.extra_subastas[0].identificador },
        data: { fechaFin: enDosMinutos }
      });
      count++;
    }

    // 2. Marcamos todos los artículos como "no subastados" para que admitan pujas nuevamente
    for (const c of s.catalogos) {
      await prisma.itemsCatalogo.updateMany({
        where: { catalogo: c.identificador },
        data: { subastado: 'no' }
      });
    }
  }

  // 3. Vamos a simular que alguien hace una puja por tu artículo (Producto 6)
  const otroCliente = await prisma.clientes.findFirst({
    where: { NOT: { identificador: 6 } } 
  });

  if (otroCliente) {
    const tuItem = await prisma.itemsCatalogo.findFirst({
      where: { producto: 6 }
    });

    if (tuItem) {
      const subastaDeTuItem = await prisma.catalogos.findUnique({
        where: { identificador: tuItem.catalogo },
        select: { subasta: true }
      });

      if (subastaDeTuItem && subastaDeTuItem.subasta) {
        const yaAsiste = await prisma.asistentes.findFirst({
          where: { cliente: otroCliente.identificador, subasta: subastaDeTuItem.subasta }
        });
        let idAsistente = yaAsiste?.identificador;

        if (!idAsistente) {
          const c = await prisma.asistentes.count({ where: { subasta: subastaDeTuItem.subasta } });
          const nuevo = await prisma.asistentes.create({
            data: { cliente: otroCliente.identificador, subasta: subastaDeTuItem.subasta, numeroPostor: c + 1 }
          });
          idAsistente = nuevo.identificador;
        }

        await prisma.pujos.create({
          data: {
            asistente: idAsistente,
            item: tuItem.identificador,
            importe: 45000,
            ganador: 'no' 
          }
        });
        console.log(`\n🤖 [Simulación] Un comprador anónimo acaba de pujar $45.000 por tu artículo (relojito).`);
      }
    }
  }

  console.log(`\n⏳ ¡Reloj reconfigurado y fechas corregidas!`);
  console.log(`✅ Las subastas ahora están "En Vivo" (fecha inicio en el pasado) y finalizan en 2 mins.`);
  console.log(`🕒 Hora actual: ${ahora.toLocaleTimeString('es-AR')}`);
  console.log(`🏁 Nuevo cierre programado: ${enDosMinutos.toLocaleTimeString('es-AR')}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
