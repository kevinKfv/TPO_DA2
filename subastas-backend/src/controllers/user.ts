import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        paymentMethods: true,
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Exclude password
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const addPaymentMethod = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { type, details, limit } = req.body;

    if (!type || !details) {
      return res.status(400).json({ error: 'Missing payment method details' });
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId,
        type,      // "bank", "credit_card", "check"
        details,
        limit,     // applies for checks mainly
        isVerified: true // simulating auto-verification for simplification
      }
    });

    return res.status(201).json({ message: 'Payment method added', paymentMethod });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserBids = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const bids = await prisma.bid.findMany({
      where: { userId },
      include: {
        item: true,
        auction: { select: { title: true, currency: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(bids);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
