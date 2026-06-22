import { prisma } from '../../configuracion/baseDatos';

export class UsersService {
  async getUserProfile(userId: string) {
    const id = parseInt(userId, 10);
    const persona = await prisma.personas.findUnique({
      where: { identificador: id },
      include: {
        clientes: {
          include: {
            extra_credencialesCliente: true,
            paises: true,
          },
        },
      },
    });

    if (!persona) {
      throw new Error('Usuario no encontrado');
    }

    return {
      id: persona.identificador.toString(),
      firstName: persona.nombre.split(' ')[0] || '',
      lastName: persona.nombre.split(' ').slice(1).join(' ') || '',
      email: persona.clientes?.extra_credencialesCliente?.email ?? '',
      numeroPais: persona.clientes?.numeroPais ?? null,
      country: persona.clientes?.paises?.nombre || '',
      address: persona.direccion || '',
      category: persona.clientes?.categoria || 'comun',
      isApproved: persona.clientes?.admitido === 'si',
      foto: persona.foto ? Buffer.from(persona.foto).toString('base64') : null,
      documentFront: persona.foto ? 'base64-image' : null,
      documentBack: null,
      createdAt: persona.clientes?.extra_credencialesCliente?.fechaRegistro?.toISOString().split('T')[0] ?? null,
    };
  }

  async updateProfile(userId: string, data: any) {
    const id = parseInt(userId, 10);

    const personaData: any = {
      nombre: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      direccion: data.address || null,
    };
    if (data.foto) {
      personaData.foto = Buffer.from(data.foto, 'base64');
    }

    const persona = await prisma.personas.update({
      where: { identificador: id },
      data: personaData,
      include: {
        clientes: { include: { extra_credencialesCliente: true, paises: true } },
      },
    });

    if (data.numeroPais) {
      await prisma.clientes.update({
        where: { identificador: id },
        data: { numeroPais: parseInt(data.numeroPais) },
      });
    }

    return {
      id: persona.identificador.toString(),
      firstName: persona.nombre.split(' ')[0] || '',
      lastName: persona.nombre.split(' ').slice(1).join(' ') || '',
      email: persona.clientes?.extra_credencialesCliente?.email ?? '',
      numeroPais: data.numeroPais ?? persona.clientes?.numeroPais,
      country: persona.clientes?.paises?.nombre || '',
      address: persona.direccion || '',
      category: persona.clientes?.categoria || 'comun',
    };
  }

  async uploadDocuments(userId: string, frontUrl: string, backUrl: string) {
    return { message: "Simulación de subida de documento completa." };
  }

  async getUserStats(userId: string) {
    const id = parseInt(userId, 10);
    if (isNaN(id)) {
      return { totalBids: 0, auctionsWon: 0, totalSpent: 0, winRate: 0, monthlyInvestment: [] };
    }

    // 1. Total de participaciones (Este se sigue midiendo desde la tabla de pujos/pujas activos)
    const totalBids = await prisma.pujos.count({
      where: { 
        asistentes: { 
          cliente: id 
        } 
      }
    });

    // 2. Subastas Ganadas (Ahora es exacto: cuántas veces aparece en el registro definitivo)
    const auctionsWon = await prisma.registroDeSubasta.count({
      where: { 
        cliente: id 
      }
    });

    // 3. Total Invertido (Suma directa de los importes finales del registro)
    const registrosGanados = await prisma.registroDeSubasta.findMany({
      where: { 
        cliente: id 
      },
      select: { 
        importe: true 
      }
    });
    
    const totalSpent = registrosGanados.reduce((acc, curr) => acc + Number(curr.importe), 0);
    const winRate = totalBids > 0 ? parseFloat(((auctionsWon / totalBids) * 100).toFixed(1)) : 0;

    // 4. Historial de Inversión Mensual (Últimos 3 meses basados en la fecha de la subasta)
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const monthlyInvestment = [];

    for (let i = 2; i >= 0; i--) {
      const fechaTarget = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const primerDiaMes = new Date(fechaTarget.getFullYear(), fechaTarget.getMonth(), 1);
      const ultimoDiaMes = new Date(fechaTarget.getFullYear(), fechaTarget.getMonth() + 1, 0, 23, 59, 59);

      // Buscamos en los registros definitivos filtrando por la fecha de la subasta asociada
      const registrosMes = await prisma.registroDeSubasta.findMany({
        where: {
          cliente: id,
          subastas: {
            // NOTA: Ajustá 'fecha_fin' o 'fecha' según cómo se llame el campo de fecha en tu modelo 'subastas'
            fecha: { 
              gte: primerDiaMes,
              lte: ultimoDiaMes
            }
          }
        },
        select: { 
          importe: true 
        }
      });

      const totalMes = registrosMes.reduce((acc, curr) => acc + Number(curr.importe), 0);

      monthlyInvestment.push({
        mes: nombresMeses[primerDiaMes.getMonth()],
        total: totalMes
      });
    }

    return {
      totalBids,
      auctionsWon,
      totalSpent,
      winRate,
      monthlyInvestment
    };
  }

  async getUserById(id: string) {
    return prisma.personas.findUnique({ where: { identificador: parseInt(id, 10) } });
  }

  async getUserCategory(id: string): Promise<string> {
    const cliente = await prisma.clientes.findUnique({ where: { identificador: parseInt(id, 10) }, select: { categoria: true } });
    if (!cliente) return 'comun';
    return cliente.categoria || 'comun';
  }
}

export const usersService = new UsersService();
