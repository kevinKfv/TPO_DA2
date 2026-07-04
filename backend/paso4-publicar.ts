import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Uso: npx ts-node paso4-publicar.ts <ID_PRODUCTO>');
    console.log('Ejemplo: npx ts-node paso4-publicar.ts 1');
    return;
  }

  const productoId = parseInt(args[0], 10);

  try {
    // Verificar que el cliente haya aceptado la propuesta
    const solicitud = await prisma.extra_solicitudesVenta.findUnique({ where: { producto: productoId } });
    if (!solicitud) throw new Error('Solicitud no encontrada.');
    if (solicitud.estado !== 'a_subastar') {
      throw new Error(`El producto está en estado "${solicitud.estado}". El cliente DEBE aceptar la propuesta en la app antes de que el Admin pueda publicarlo.`);
    }

    // Buscar una subasta abierta para asignarlo
    const subasta = await prisma.subastas.findFirst({ where: { categoria: 'comun', estado: 'abierta' } });
    if (!subasta) throw new Error('No hay subasta abierta disponible para alojar el producto.');

    // 1. Crear catálogo
    const catalogo = await prisma.catalogos.create({
      data: {
        descripcion: `Catálogo de Asignación Manual para Producto ${productoId}`,
        responsable: 1, // ID del Admin
        subasta: subasta.identificador
      }
    });

    // 2. Asociar el producto al catálogo
    await prisma.itemsCatalogo.create({
      data: {
        catalogo: catalogo.identificador,
        producto: productoId,
        precioBase: solicitud.precioBase!,
        comision: solicitud.comision!,
        subastado: 'no'
      }
    });

    console.log(`✅ ¡Éxito! El administrador publicó el producto ${productoId} en la Subasta Activa #${subasta.identificador}.`);
    console.log(`👀 Ya podés ir a la app a la sección "Subastas Disponibles" y el artículo aparecerá ahí para que otros pujen.`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
