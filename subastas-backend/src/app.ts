import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import auctionRoutes from './routes/auction';
import itemRoutes from './routes/item';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/items', itemRoutes);

// Simple health check
app.get('/', (req, res) => res.send('Subastas API Running'));

export default app;
