import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Aprobando Tareas Pendientes Automáticamente ---');

  // 1. Activar todas las cuentas pendientes
  const cuentas = await prisma.extra_credencialesCliente.findMany({ where: { estadoCredencial: 'pendiente' } });
  for (const c of cuentas) {
    await prisma.extra_credencialesCliente.update({
      where: { cliente: c.cliente },
      data: { estadoCredencial: 'activo', debeCambiarClave: 'no', mailEnviado: true }
    });
    await prisma.clientes.update({
      where: { identificador: c.cliente },
      data: { admitido: 'si', categoria: 'comun' }
    });
    console.log(`✅ Cuenta de ${c.email} activada y admitida en el sistema.`);
  }

  // 2. Aceptar todas las solicitudes de venta
  // Le asignamos un precio base y comisión aleatorios como si un tasador lo hubiera hecho.
  const ventas = await prisma.extra_solicitudesVenta.findMany({ where: { estado: 'pendiente' } });
  for (const v of ventas) {
    await prisma.extra_solicitudesVenta.update({
      where: { identificador: v.identificador },
      data: { estado: 'aceptado', precioBase: 50000, comision: 5000 }
    });
    console.log(`✅ Solicitud de venta ID ${v.identificador} aceptada (Precio Base fijado en $50.000).`);
  }

  // 3. Verificar todos los métodos de pago (ej: tarjetas, transferencias, cheques)
  const metodos = await prisma.extra_metodosPago.findMany({ where: { estado: 'pendiente' } });
  for (const m of metodos) {
    await prisma.extra_metodosPago.update({
      where: { identificador: m.identificador },
      data: { estado: 'verificado' }
    });
    console.log(`✅ Método de pago ID ${m.identificador} (${m.tipo}) marcado como verificado.`);
  }

  console.log('\n🎉 ¡Todo ha sido aprobado y activado exitosamente!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
