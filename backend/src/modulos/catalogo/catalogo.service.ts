import { PrismaClient } from '@prisma/client';
import { mapItem } from '../subastas/subastas.service';

const prisma = new PrismaClient();

export class CatalogoService {
  async getItemsByAuctionId(subastaId: number) {
    // Buscamos directamente a través de las relaciones del catálogo vinculadas a la subasta
    const catalogos = await prisma.catalogos.findMany({
      where: { subasta: subastaId },
      include: {
        itemsCatalogo: {
          include: {
            productos: {
              include: {
                fotos: true // Permite extraer las strings/URLs de imágenes asignadas
              }
            },
            pujos: true
          }
        }
      }
    });

    // Mapeamos los sub-elementos planos respetando el modelo de negocio
    return catalogos.flatMap(c => 
      c.itemsCatalogo.map(item => mapItem(item, subastaId.toString()))
    );
  }
}