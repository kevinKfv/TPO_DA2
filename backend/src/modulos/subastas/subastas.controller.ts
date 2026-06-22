import { Request, Response } from 'express';
import { SubastasService } from './subastas.service';
import { AuthRequest } from '../../middlewares/autenticacion';

const subastasService = new SubastasService();

export const getAuctions = async (req: Request, res: Response) => {
  try {
    const subastas = await subastasService.getAll();
    res.json(subastas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching auctions' });
  }
};

export const getAuctionById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const subasta = await subastasService.getById(id);
    if (!subasta) return res.status(404).json({ error: 'Auction not found' });

    res.json(subasta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching auction' });
  }
};

export const createAuction = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, fotoUrl, startDate, category } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const nuevaSubasta = await subastasService.create({
      title,
      description,
      fotoUrl, // Pasamos el nuevo campo de la URL de la imagen
      startDate,
      category
    });

    res.status(201).json(nuevaSubasta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating auction' });
  }
};

export const registerForAuction = async (req: AuthRequest, res: Response) => {
  try {
    const subastaId = parseInt(req.params.id);
    const clienteId = parseInt(req.user?.id?.toString() ?? '0');
    
    if (isNaN(subastaId) || !clienteId) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const registro = await subastasService.registerAttendee(subastaId, clienteId);
    res.json(registro);
  } catch (error: any) {
    console.error(error);
    if (error.message === 'Auction not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error registering for auction' });
  }
};