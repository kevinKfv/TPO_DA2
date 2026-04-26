import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

export const submitItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { title, description, basePrice, images, artist, history } = req.body;

    if (!title || !description || !basePrice || !images || !Array.isArray(images) || images.length < 1) {
      return res.status(400).json({ error: 'Missing required item details. At least 1 image is required.' });
    }

    const item = await prisma.item.create({
      data: {
        title,
        description,
        basePrice,
        images,
        artist,
        history,
        ownerId: userId,
        status: 'pending'
      }
    });

    return res.status(201).json({ message: 'Item submitted for review', item });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminReviewItem = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { accept, rejectionReason, auctionId } = req.body;

    if (accept) {
      if (!auctionId) return res.status(400).json({ error: 'Must provide auctionId to assign the accepted item.' });

      const item = await prisma.item.update({
        where: { id },
        data: { status: 'accepted', auctionId }
      });
      return res.json({ message: 'Item accepted and assigned to auction', item });
    } else {
      const item = await prisma.item.update({
        where: { id },
        data: { status: 'rejected', rejectionReason: rejectionReason || 'No reason provided' }
      });
      return res.json({ message: 'Item rejected', item });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
