import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { signToken } from '../utils/jwt';

// Stage 1 Registration: Users submit data
export const registerStage1 = async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, documentFront, documentBack, address, country } = req.body;

    if (!email || !firstName || !lastName || !documentFront || !documentBack || !address || !country) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        documentFront,
        documentBack,
        address,
        country,
        stage: 'stage1',
      },
    });

    // In a real application, an admin reviews this and then triggers an email.
    // We will simulate that email process here or in an admin mock endpoint.
    return res.status(201).json({ 
      message: 'Stage 1 registration successful. Awaiting verification.',
      user: { id: newUser.id, email: newUser.email, stage: newUser.stage }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin endpoint to verify user and transition to wait for stage 2 (Simulator)
export const mockAdminVerifyUser = async (req: Request, res: Response) => {
  try {
    const { userId, category } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await prisma.user.update({
      where: { id: userId },
      data: { category, isVerified: true, stage: 'stage2' } // Ready for stage 2
    });

    // Generate a temporary token to send via "Email"
    const tempToken = signToken({ id: user.id }, '24h');
    
    console.log(`[EMAIL SPY] Send to: ${user.email} -> Verification successful. Your category is ${category}. Complete your registration with this link: /api/auth/register-stage2?token=${tempToken}`);

    return res.json({ message: 'User verified and email sent (check console)' });
  } catch(error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Stage 2 Registration: Set password
export const registerStage2 = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    // We assume they provide the tempToken in headers or body, let's use the standard auth header approach which the frontend will use.
    // But since it's stage 2, maybe we should enforce this via the auth middleware.
    // For now, let's assume req.user is set by auth middleware
    const user = (req as any).user; 

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.stage !== 'stage2') {
      return res.status(400).json({ error: 'User not eligible for Stage 2 processing' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, stage: 'stage2' } // Kept as stage2 but now they have password, meaning fully registered essentially. Or we could add a `completed` stage.
    });

    return res.json({ message: 'Registration complete. You can now login.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ id: user.id, category: user.category });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        category: user.category,
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
