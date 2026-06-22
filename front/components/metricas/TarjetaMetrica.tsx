import React from 'react';
import { View, Text } from 'react-native';

interface TarjetaMetricaProps {
  titulo: string;
  valor: string | number;
  icono: React.ReactNode;
}

export default function TarjetaMetrica({ titulo, valor, icono }: TarjetaMetricaProps) {
  return (
    <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm min-h-[105px] justify-between">
      {/* Contenedor del Icono con fondo sutil */}
      <View className="bg-gray-50 self-start p-2 rounded-xl">
        {icono}
      </View>
      
      {/* Textos e Información de la Métrica */}
      <View className="mt-2">
        <Text 
          className="text-2xl font-bold text-[#333F48] tracking-tight" 
          numberOfLines={1} 
          adjustsFontSizeToFit
        >
          {valor}
        </Text>
        <Text className="text-[11px] font-semibold text-[#A08C79] mt-0.5 leading-4">
          {titulo}
        </Text>
      </View>
    </View>
  );
}