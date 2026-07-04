import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Verificando Tareas Pendientes para los Administradores ---');

  // 1. Cuentas (clientes) pendientes de aprobación
  const cuentasPendientes = await prisma.extra_credencialesCliente.findMany({
    where: { estadoCredencial: 'pendiente' },
    include: { clientes: { include: { personas: true } } }
  });

  if (cuentasPendientes.length > 0) {
    console.log(`\n⚠️ Hay ${cuentasPendientes.length} cuenta(s) pendiente(s) de validación:`);
    cuentasPendientes.forEach(c => {
      console.log(`   - ID Cliente: ${c.cliente} | Email: ${c.email} | Nombre: ${c.clientes?.personas?.nombre || 'Desconocido'}`);
    });
  } else {
    console.log('\n✅ No hay cuentas pendientes de validación.');
  }

  // 2. Solicitudes de venta de artículos pendientes
  const ventasPendientes = await prisma.extra_solicitudesVenta.findMany({
    where: { estado: 'pendiente' },
    include: { clientes: { include: { personas: true } }, productos: true }
  });

  if (ventasPendientes.length > 0) {
    console.log(`\n⚠️ Hay ${ventasPendientes.length} solicitud(es) de venta de artículos pendiente(s):`);
    ventasPendientes.forEach(v => {
      console.log(`   - ID PRODUCTO: ${v.producto} | (ID Venta: ${v.identificador}) | Título: ${v.productos?.descripcionCatalogo || 'Sin descripción'} | Solicitado por: ${v.clientes?.personas?.nombre || 'Desconocido'}`);
    });
  } else {
    console.log('\n✅ No hay solicitudes de venta pendientes.');
  }

  // 3. Métodos de pago pendientes de verificación
  const metodosPendientes = await prisma.extra_metodosPago.findMany({
    where: { estado: 'pendiente' },
    include: { clientes: { include: { personas: true } } }
  });

  if (metodosPendientes.length > 0) {
    console.log(`\n⚠️ Hay ${metodosPendientes.length} método(s) de pago pendiente(s) de verificación:`);
    metodosPendientes.forEach(m => {
      console.log(`   - ID Método: ${m.identificador} | Tipo: ${m.tipo} | Cliente: ${m.clientes?.personas?.nombre || 'Desconocido'}`);
    });
  } else {
    console.log('\n✅ No hay métodos de pago pendientes.');
  }

  console.log('\n--------------------------------------------------------------');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
