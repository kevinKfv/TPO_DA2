import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server } from 'http';
import { verifyToken } from './utils/jwt';
import prisma from './utils/prisma';

// Category weight for comparisons
const CategoryWeight: Record<string, number> = {
  comun: 1,
  especial: 2,
  plata: 3,
  oro: 4,
  platino: 5
};

export const initSocket = (server: Server) => {
  const io = new SocketIOServer(server, {
    cors: { origin: '*' }
  });

  // Authentication Middleware for Sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['x-access-token'];
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = verifyToken(token);
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`User ${user.id} connected. Category: ${user.category}`);

    // Join Auction Room
    socket.on('join_auction', async (data: { auctionId: string }) => {
      try {
        const { auctionId } = data;
        
        // Validation: Ensure valid auction
        const auction = await prisma.auction.findUnique({
          where: { id: auctionId }
        });

        if (!auction) return socket.emit('auction_error', { message: 'Auction not found' });
        
        // Validation: Category
        const userWeight = CategoryWeight[user.category] || 1;
        const auctionWeight = CategoryWeight[auction.categoryRequired] || 1;

        // Validation: Payment Method
        const paymentMethods = await prisma.paymentMethod.findMany({
          where: { userId: user.id, isVerified: true }
        });

        if (userWeight < auctionWeight || paymentMethods.length === 0) {
           return socket.emit('auction_error', { 
             message: 'Cannot join. You either lack required category or verified payment methods.' 
           });
        }

        socket.join(`auction_${auctionId}`);
        socket.emit('joined_auction', { auctionId, message: 'Successfully joined auction.' });

      } catch (err) {
        socket.emit('auction_error', { message: 'Internal error joining auction' });
      }
    });

    // Place Bid
    socket.on('place_bid', async (data: { auctionId: string, itemId: string, amount: number }) => {
      try {
        const { auctionId, itemId, amount } = data;

        // Run this atomically as possible to prevent race conditions during bid reading
        const result = await prisma.$transaction(async (tx) => {
          const item = await tx.item.findUnique({ where: { id: itemId } });
          if (!item) throw new Error('Item not found');
          if (item.auctionId !== auctionId) throw new Error('Item not in this auction');
          if (item.status !== 'in_auction') throw new Error('Item is not currently being auctioned');

          // Find highest bid
          const highestBid = await tx.bid.findFirst({
            where: { itemId },
            orderBy: { amount: 'desc' }
          });

          const currentHighestAmount = highestBid ? highestBid.amount : 0;
          
          if (amount <= currentHighestAmount) {
             throw new Error(`Amount must be higher than the current highest bid: ${currentHighestAmount}`);
          }

          // +1% and +20% rules apply if user is NOT oro/platino
          if (user.category !== 'oro' && user.category !== 'platino') {
             // If there's a previous bid, the min next is current + 1% base, max is current + 20% base
             // The prompt says: "El monto de la puja debe ser al menos el mejor valor hasta el momento más el 1% del valor base del bien."
             const minAllowed = currentHighestAmount > 0 
                ? currentHighestAmount + (0.01 * item.basePrice) 
                : item.basePrice; // if no bids, min is base price
             
             const maxAllowed = currentHighestAmount > 0 
                ? currentHighestAmount + (0.20 * item.basePrice) 
                : item.basePrice + (0.20 * item.basePrice);

             if (amount < minAllowed) {
                 throw new Error(`Minimum bid required: ${minAllowed}`);
             }

             if (amount > maxAllowed) {
                 throw new Error(`Maximum bid allowed: ${maxAllowed}`);
             }
          } else {
             // For oro/platino, no max limit. But minimum should at least be >= base price if no bids
             if (!highestBid && amount < item.basePrice) {
                 throw new Error(`Minimum bid required: ${item.basePrice}`);
             }
          }

          // Verify funds if using a check (Simulation: we just check if balance < amount if they depend on check limit, but to keep simple as instructed, we assume if they have payment methods they can bid until they run out. We'll skip complex balance deduction for the sake of the base 50% MVP)
          
          // Place the bid
          const bid = await tx.bid.create({
            data: {
              amount,
              userId: user.id,
              itemId,
              auctionId
            },
            include: { user: { select: { firstName: true, lastName: true } } }
          });

          return bid;
        });

        // Broadcast to the room
        io.to(`auction_${auctionId}`).emit('nueva_puja', result);

      } catch (err: any) {
        // Send specific error message to the user trying to bid
        socket.emit('auction_error', { message: err.message || 'Bid failed' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${user.id} disconnected.`);
    });
  });

  return io;
};
