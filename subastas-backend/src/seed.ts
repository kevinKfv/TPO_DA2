import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.bid.deleteMany();
  await prisma.item.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users...');
  const password = await bcrypt.hash('123456', 10);
  
  // Normal User
  const user1 = await prisma.user.create({
    data: {
      email: 'comun@test.com',
      password,
      firstName: 'Juan',
      lastName: 'Pérez',
      documentFront: 'http://test.com/doc1.jpg',
      documentBack: 'http://test.com/doc2.jpg',
      address: 'Calle Falsa 123',
      country: 'Argentina',
      stage: 'stage2',
      category: 'comun',
      isVerified: true,
      paymentMethods: {
        create: { type: 'credit_card', details: 'Visa ending 1234', isVerified: true }
      }
    }
  });

  // Platino User
  const user2 = await prisma.user.create({
    data: {
      email: 'platino@test.com',
      password,
      firstName: 'Bruce',
      lastName: 'Wayne',
      documentFront: 'http://test.com/doc3.jpg',
      documentBack: 'http://test.com/doc4.jpg',
      address: 'Wayne Manor',
      country: 'USA',
      stage: 'stage2',
      category: 'platino',
      isVerified: true,
      paymentMethods: {
        create: { type: 'bank', details: 'Gotham Bank', isVerified: true }
      }
    }
  });

  console.log('Creating auction...');
  const auction = await prisma.auction.create({
    data: {
      title: 'Subasta de Arte Moderno',
      date: new Date(),
      categoryRequired: 'comun',
      status: 'active',
      auctioneer: 'Gavel Master',
      currency: 'ARS',
      items: {
        create: [
          {
            title: 'Cuadro Abstracto',
            description: 'Obra de arte en óleo',
            basePrice: 10000,
            images: ['http://test.com/img1.jpg'],
            artist: 'Picasso Jr.',
            status: 'in_auction',
            ownerId: user2.id 
          },
          {
            title: 'Juego de Té Vintage',
            description: 'Porcelana importada de 18 piezas',
            basePrice: 5000,
            images: ['http://test.com/img2.jpg'],
            history: 'Perteneció a la realeza',
            status: 'accepted',
            ownerId: user1.id 
          }
        ]
      }
    }
  });

  console.log('Seed completed successfully!');
  console.log('Test Users:');
  console.log('comun@test.com / 123456');
  console.log('platino@test.com / 123456');
  console.log(`Active Auction ID: ${auction.id}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
