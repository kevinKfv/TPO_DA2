import React from 'react';
import { View, Text } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';

export default function GraficoTorta() {
  // Los valores de strokeDasharray y strokeDashoffset calculan las porciones exactas:
  // Joyería (45%), Arte (30%), Relojes (15%), Otros (10%)
  return (
    <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
      <Text className="text-lg font-bold text-[#333F48] mb-4">Distribución por Categoría</Text>
      
      <View className="items-center justify-center py-4">
        {/* Contenedor del Gráfico de Torta */}
        <Svg width="160" height="160" viewBox="0 0 40 40">
          <G transform="rotate(-90 20 20)">
            {/* Joyería 45% (Color Morado) */}
            <Circle 
              cx="20" 
              cy="20" 
              r="15.915" 
              fill="transparent" 
              stroke="#6A4F99" 
              strokeWidth="6" 
              strokeDasharray="45 55" 
              strokeDashoffset="0" 
            />
            {/* Arte 30% (Color Dorado) */}
            <Circle 
              cx="20" 
              cy="20" 
              r="15.915" 
              fill="transparent" 
              stroke="#C9A063" 
              strokeWidth="6" 
              strokeDasharray="30 70" 
              strokeDashoffset="-45" 
            />
            {/* Relojes 15% (Color Grisáceo) */}
            <Circle 
              cx="20" 
              cy="20" 
              r="15.915" 
              fill="transparent" 
              stroke="#9E8E7D" 
              strokeWidth="6" 
              strokeDasharray="15 85" 
              strokeDashoffset="-75" 
            />
            {/* Otros 10% (Color Rosa Suave) */}
            <Circle 
              cx="20" 
              cy="20" 
              r="15.915" 
              fill="transparent" 
              stroke="#E5CDCD" 
              strokeWidth="6" 
              strokeDasharray="10 90" 
              strokeDashoffset="-90" 
            />
          </G>
        </Svg>

        {/* Leyendas explicativas debajo del gráfico */}
        <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-2 mt-6">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-[#6A4F99] mr-1.5" />
            <Text className="text-xs text-gray-600 font-medium">Joyería 45%</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-[#C9A063] mr-1.5" />
            <Text className="text-xs text-gray-600 font-medium">Arte 30%</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-[#9E8E7D] mr-1.5" />
            <Text className="text-xs text-gray-600 font-medium">Relojes 15%</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-[#E5CDCD] mr-1.5" />
            <Text className="text-xs text-gray-600 font-medium">Otros 10%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}