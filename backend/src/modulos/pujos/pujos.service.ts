function getCurrentPrice(pujos: any[], precioBase: number): number {
  if (!pujos || pujos.length === 0) return precioBase;
  return Math.max(...pujos.map((p: any) => Number(p.importe)));
}

export const processUserBids = (pujos: any[], filter: string = 'todas') => {
  const uniqueItems = new Map();

  pujos.forEach((p) => {
    const item = p.itemsCatalogo;
    if (!item) return;

    const subasta = item.catalogos?.subastas;
    const extra = subasta?.extra_subastas?.[0];
    const currentPrice = getCurrentPrice(item.pujos ?? [], Number(item.precioBase ?? 0));
    const userAmount = Number(p.importe);

    // Determinar estado de la puja basado en negocio y estado de la subasta
    let status: 'winning' | 'outbid' | 'won' | 'lost' = 'outbid';
    const esSubastaFinalizada = subasta?.estado === 'finalizada' || subasta?.estado === 'completada';

    if (p.ganador === 'si') {
      status = 'won';
    } else if (esSubastaFinalizada && p.ganador !== 'si') {
      status = 'lost';
    } else {
      // Subasta Activa / Abierta
      status = userAmount >= currentPrice ? 'winning' : 'outbid';
    }

    if (!uniqueItems.has(item.identificador)) {
      uniqueItems.set(item.identificador, {
        id: item.identificador.toString(),
        amount: userAmount,
        status,
        catalogItem: {
          id: item.identificador.toString(),
          title: item.productos?.descripcionCompleta ?? item.productos?.descripcionCatalogo ?? 'Sin título',
          currentPrice,
          auctionId: subasta?.identificador?.toString() ?? '',
          auctionTitle: extra?.titulo ?? 'Sin título',
          statusSubasta: subasta?.estado ?? 'desconocido'
        },
      });
    } else {
      // Conservar la puja más alta del usuario para este artículo y recalcular estado
      const existing = uniqueItems.get(item.identificador);
      if (userAmount > existing.amount) {
        existing.amount = userAmount;
        existing.status = status; // Mantiene el estado correcto recalculado arriba
      }
    }
  });

  // Convertimos el mapa a un array plano
  let result = Array.from(uniqueItems.values());

  // Aplicamos el filtrado solicitado por el Frontend aquí en el Service
  if (filter === 'ganadas') {
    result = result.filter(b => b.status === 'won' || b.status === 'winning');
  } else if (filter === 'perdidas') {
    result = result.filter(b => b.status === 'lost' || b.status === 'outbid');
  }

  return result;
};