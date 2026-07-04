import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Simulando Flujo Completo de Negocio ---');

  // 1. Obtener al usuario demo
  const user = await prisma.extra_credencialesCliente.findFirst({ where: { email: 'demo@hammer.com' } });
  if (!user) throw new Error('Usuario demo no encontrado. Corre el seed original primero.');
  const userId = user.cliente;

  // 2. Obtener el producto que estaba pendiente (el que aceptamos antes)
  const solicitud = await prisma.extra_solicitudesVenta.findFirst({
    where: { cliente: userId, estado: 'aceptado' },
    include: { productos: true }
  });

  if (!solicitud) {
    console.log('⚠️ No se encontró una solicitud en estado "aceptado". Sube un artículo desde la app, corre accept-all y vuelve a intentarlo.');
    return;
  }

  const productoId = solicitud.producto;
  const titulo = solicitud.productos?.descripcionCatalogo || 'Artículo Genérico';
  const precioBase = Number(solicitud.precioBase) || 50000;
  const comision = Number(solicitud.comision) || 5000;

  // 3. Crear Notificación de Aprobación (lo que faltó en accept-all.ts)
  console.log('Creando notificación de aprobación para el cliente...');
  await prisma.notificaciones.create({
    data: {
      identificadorPersona: userId,
      mensaje: `OFERTA-REF-${productoId} Tu artículo "${titulo}" fue aprobado. Revisá el precio base ($${precioBase}) y la comisión (${comision}) en Mis Ventas y respondé para continuar.`
    }
  });

  // 4. Simular que el cliente ACEPTA la propuesta (Pasa a estado: a_subastar)
  console.log('Simulando que el cliente acepta la propuesta del tasador...');
  await prisma.extra_solicitudesVenta.update({
    where: { producto: productoId },
    data: { estado: 'a_subastar', fechaActualizacion: new Date() }
  });

  // 5. El Administrador crea un Catálogo y lo asigna a una Subasta Activa
  console.log('Administrador: Asignando el producto a una Subasta Disponible...');
  
  // Buscar subasta común existente (creada por seed.ts)
  const subasta = await prisma.subastas.findFirst({
    where: { categoria: 'comun', estado: 'abierta' }
  });

  if (!subasta) throw new Error('No se encontró la subasta común abierta.');

  // Crear catálogo para la subasta
  const catalogo = await prisma.catalogos.create({
    data: {
      descripcion: `Catálogo Especial para ${titulo}`,
      responsable: 1, // Admin
      subasta: subasta.identificador
    }
  });

  // Agregar el producto al catálogo como un "Item" de la subasta
  await prisma.itemsCatalogo.create({
    data: {
      catalogo: catalogo.identificador,
      producto: productoId,
      precioBase: precioBase,
      comision: comision,
      subastado: 'no'
    }
  });

  console.log('\n🎉 ¡Flujo Completado!');
  console.log('Ahora podrás ver la notificación en la campanita, y si vas a las Subastas Disponibles, verás este nuevo artículo listo para ser pujado.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
