import { createServer } from 'http';
import app from './app';
import { initSocket } from './socket';
import dotenv from 'dotenv';
import prisma from './utils/prisma';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = createServer(app);

// Init WebSockets
const io = initSocket(server);

server.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error('Error connecting to the database', error);
  }
});
