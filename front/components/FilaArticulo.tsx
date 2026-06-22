import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

interface FilaArticuloProps {
  puja: any;
}

export default function FilaArticulo({ puja }: FilaArticuloProps) {
  const obtenerConfiguracionEstado = (status: string) => {
    switch (status) {
      case 'winning':
        return { texto: 'Ganando', estilos: 'text-green-600' };
      case 'won':
        return { texto: 'Ganada ✓', estilos: 'text-green-600 font-bold' };
      case 'outbid':
        return { texto: 'Superada', estilos: 'text-red-500' };
      case 'lost':
        return { texto: 'Perdida', estilos: 'text-red-400' };
      default:
        return { texto: 'Pendiente', estilos: 'text-gray-500' };
    }
  };

  const configuracion = obtenerConfiguracionEstado(puja.status);

  return (
    <Link href={`/subastas/${puja.catalogItem.auctionId}`} asChild>
      <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-gray-100 active:bg-gray-50 px-2">
        <View className="w-[65%] pr-2">
          <Text className="font-semibold text-sm text-[#333F48]" numberOfLines={1}>
            {puja.catalogItem.title}
          </Text>
          <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>
            {puja.catalogItem.auctionTitle}
          </Text>
        </View>
        
        <View className="w-[35%] items-end">
          <Text className="text-sm font-bold text-[#333F48]">
            ${Number(puja.amount).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
          </Text>
          <Text className={`text-xs mt-1 ${configuracion.estilos}`}>
            {configuracion.texto}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}