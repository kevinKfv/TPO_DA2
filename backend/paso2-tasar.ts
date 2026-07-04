import { articlesService } from './src/modulos/articulos/articulos.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log('Uso: npx ts-node paso2-tasar.ts <ID_PRODUCTO> <PRECIO_BASE> <COMISION_DECIMAL>');
    console.log('Ejemplo: npx ts-node paso2-tasar.ts 1 50000 0.10');
    return;
  }

  const productoId = parseInt(args[0], 10);
  const precioBase = parseFloat(args[1]);
  const comision = parseFloat(args[2]);

  try {
    // Usamos directamente el servicio del backend para respetar TODA la lógica real (notificaciones, etc.)
    await articlesService.aprobarSolicitud(productoId, precioBase, comision);
    console.log(`✅ ¡Éxito! El tasador aprobó el producto ${productoId}.`);
    console.log(`   Precio Base: $${precioBase}`);
    console.log(`   Comisión: ${comision * 100}%`);
    console.log(`🔔 La notificación ha sido generada y el cliente ya puede revisarla en su app.`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
