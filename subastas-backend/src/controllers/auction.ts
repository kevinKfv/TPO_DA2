import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

export const getAvailableAuctions = async (req: AuthRequest, res: Response) => {
  try {
    // Both active and planned
    const auctions = await prisma.auction.findMany({
      where: { status: { in: ['active', 'planned'] } },
      orderBy: { date: 'asc' }
    });

    return res.json(auctions);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAuctionCatalog = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        items: true
      }
    });

    if (!auction) return res.status(404).json({ error: 'Auction not found' });

    // Note: Registered users can see basePrice. The user is authenticated here.
    return res.json(auction);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminCreateAuction = async (req: Request, res: Response) => {
  try {
    const { title, date, categoryRequired, currency, auctioneer } = req.body;
    
    const auction = await prisma.auction.create({
      data: {
        title,
        date: new Date(date),
        categoryRequired,
        currency,
        auctioneer
      }
    });

    return res.status(201).json(auction);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
