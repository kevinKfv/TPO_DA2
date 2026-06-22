import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const EMPLEADO_DEFAULT = 1;

function mergeDateTime(fecha: Date | null, hora: Date): Date {
  if (!fecha) return hora;
  const d = new Date(fecha);
  d.setHours(hora.getHours(), hora.getMinutes(), hora.getSeconds(), hora.getMilliseconds());
  return d;
}

function deriveStatus(subasta: any): string {
  if (!subasta.estado) return 'pendiente';
  const extra = subasta.extra_subastas?.[0];
  const now = new Date();
  if (extra?.fechaFin && new Date(extra.fechaFin) < now) return 'cerrada';
  const startDate = mergeDateTime(subasta.fecha, subasta.hora);
  if (startDate > now) return 'pendiente';
  return subasta.estado;
}

export function mapItem(item: any, subastaId: string) {
  const importes = item.pujos?.map((p: any) => Number(p.importe)) ?? [];
  const currentPrice = importes.length > 0 ? Math.max(...importes) : Number(item.precioBase);
  const winnerPuja = item.pujos?.find((p: any) => p.ganador === 'si');
  
  // Extraemos las URLs de las fotos si el producto las tiene
  const images = item.productos?.fotos?.map((f: any) => f.fotoUrl).filter(Boolean) ?? [];

  return {
    id: item.identificador.toString(),
    auctionId: subastaId,
    title: item.productos?.descripcionCatalogo ?? '',
    description: item.productos?.descripcionCompleta ?? '',
    startingPrice: Number(item.precioBase),
    currentPrice,
    winnerId: winnerPuja ? winnerPuja.asistente?.toString() ?? null : null,
    status: item.subastado === 'si' ? 'vendido' : 'pendiente',
    images: images.length > 0 ? images : ["https://via.placeholder.com/800"], // Fallback por si no posee
  };
}

export function mapSubasta(s: any) {
  const extra = s.extra_subastas?.[0];
  const items = (s.catalogos ?? []).flatMap((c: any) =>
    (c.itemsCatalogo ?? []).map((item: any) => mapItem(item, s.identificador.toString()))
  );
  return {
    id: s.identificador.toString(),
    title: extra?.titulo ?? 'Sin título',
    description: extra?.descripcion ?? null,
    fotoUrl: extra?.fotoUrl ?? null, // Expuesto para la interfaz
    startDate: mergeDateTime(s.fecha, s.hora),
    endDate: extra?.fechaFin ?? null,
    category: s.categoria ?? null,
    currency: 'pesos',
    status: deriveStatus(s),
    catalogItems: items,
  };
}

export const includeSubasta = {
  extra_subastas: true,
  catalogos: {
    include: {
      itemsCatalogo: {
        include: {
          productos: {
            include: {
              fotos: true
            }
          },
          pujos: true,
        },
      },
    },
  },
} as const;

export class SubastasService {
  async getAll() {
    const subastas = await prisma.subastas.findMany({
      include: includeSubasta,
      orderBy: { identificador: 'desc' },
    });
    return subastas.map(mapSubasta);
  }

  async getById(id: number) {
    const subasta = await prisma.subastas.findUnique({
      where: { identificador: id },
      include: includeSubasta,
    });
    if (!subasta) return null;
    return mapSubasta(subasta);
  }

  async create(data: { title: string; description?: string; fotoUrl?: string; startDate?: string; category?: string }) {
    const subasta = await prisma.subastas.create({
      data: {
        fecha: data.startDate ? new Date(data.startDate) : new Date(),
        hora: data.startDate ? new Date(data.startDate) : new Date(),
        estado: 'abierta',
        categoria: data.category ?? null,
        extra_subastas: {
          create: {
            titulo: data.title,
            descripcion: data.description ?? null,
            fotoUrl: data.fotoUrl ?? null,
          },
        },
        catalogos: {
          create: {
            descripcion: data.title,
            responsable: EMPLEADO_DEFAULT,
          },
        },
      },
      include: includeSubasta,
    });
    return mapSubasta(subasta);
  }

  async registerAttendee(subastaId: number, clienteId: number) {
    const subasta = await prisma.subastas.findUnique({ where: { identificador: subastaId } });
    if (!subasta) throw new Error('Auction not found');

    const existing = await prisma.asistentes.findFirst({
      where: { cliente: clienteId, subasta: subastaId },
    });
    if (existing) return { success: true, bidderNum: existing.numeroPostor };

    const count = await prisma.asistentes.count({ where: { subasta: subastaId } });
    const attendee = await prisma.asistentes.create({
      data: { cliente: clienteId, subasta: subastaId, numeroPostor: count + 1 },
    });

    return { success: true, bidderNum: attendee.numeroPostor };
  }
}