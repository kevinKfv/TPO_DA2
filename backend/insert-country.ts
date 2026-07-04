import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Check if country exists
  const count = await prisma.paises.count();
  if (count === 0) {
    await prisma.paises.create({
      data: {
        numero: 1,
        nombre: 'Argentina',
        nombreCorto: 'ARG',
        capital: 'Buenos Aires',
        nacionalidad: 'Argentino/a',
        idiomas: 'Español'
      }
    });
    console.log('País Argentina insertado con éxito.');
  } else {
    console.log('Ya existen países en la base de datos.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
