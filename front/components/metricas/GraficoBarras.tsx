import React from 'react';
import { View, Text } from 'react-native';

interface DatosMes {
  mes: string;
  total: number;
}

interface GraficoBarrasProps {
  datos: DatosMes[];
}

export default function GraficoBarras({ datos }: GraficoBarrasProps) {
  // Buscamos el monto máximo para armar una escala porcentual de alturas (evita desbordes)
  const montoMaximo = Math.max(...datos.map((d) => d.total), 1);

  return (
    <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-5">
      <Text className="text-lg font-bold text-[#333F48] mb-6">Inversión Mensual</Text>
      
      <View className="h-48 flex-row items-end justify-around border-b border-l border-gray-200 pb-2 pl-2">
        {datos.map((item, index) => {
          // Calculamos el porcentaje real de altura respecto al mes con mayor inversión
          const porcentajeAltura = Math.min(Math.round((item.total / montoMaximo) * 100), 100);
          
          return (
            <View key={index} className="items-center w-16 h-full justify-end">
              {/* Mostramos el valor abreviado arriba de la barra si es mayor a cero */}
              {item.total > 0 && (
                <Text className="text-[10px] font-bold text-[#6A4F99] mb-1">
                  ${item.total >= 1000 ? `${(item.total / 1000).toFixed(1)}k` : item.total}
                </Text>
              )}
              <View 
                style={{ height: `${porcentajeAltura * 0.85}%` }} // Dejamos un margen del 15% superior para los textos
                className="w-10 bg-[#6A4F99] rounded-t-lg transition-all" 
              />
              <Text className="text-xs text-gray-400 mt-2 font-medium">{item.mes}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}