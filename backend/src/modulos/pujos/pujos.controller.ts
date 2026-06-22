import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middlewares/autenticacion';
import { processUserBids } from './pujos.service';

const prisma = new PrismaClient();

// ... mantener intactas las funciones placeBid y getBidsByItem ...

export const getMyBids = async (req: AuthRequest, res: Response) => {
  try {
    const clienteId = parseInt(req.user?.id?.toString() ?? '0');
    if (!clienteId) return res.status(401).json({ error: 'Unauthorized' });

    const filter = req.query.filter?.toString() ?? 'todas';

    // 1. Buscamos los datos puros de la Base de Datos
    const pujos = await prisma.pujos.findMany({
      where: {
        asistentes: { cliente: clienteId },
      },
      orderBy: { identificador: 'desc' },
      include: {
        itemsCatalogo: {
          include: {
            productos: true,
            pujos: true,
            catalogos: {
              include: {
                subastas: {
                  include: { extra_subastas: true },
                },
              },
            },
          },
        },
      },
    });

    // 2. Delegamos TODO el procesamiento, agrupación y filtrado al servicio
    const processedBids = processUserBids(pujos, filter);

    return res.json(processedBids);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error fetching user bids' });
  }
};