import { Request, Response } from 'express';
import { CatalogoService } from './catalogo.service';

const catalogoService = new CatalogoService();

export const getCatalogByAuction = async (req: Request, res: Response) => {
  try {
    const subastaId = parseInt(req.params.subastaId);
    if (isNaN(subastaId)) {
      return res.status(400).json({ error: 'Identificador de subasta inválido' });
    }

    const items = await catalogoService.getItemsByAuctionId(subastaId);
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al recuperar el catálogo del servidor' });
  }
};