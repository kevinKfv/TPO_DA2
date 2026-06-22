import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Filter } from 'lucide-react-native';

type TipoFiltro = 'todas' | 'ganadas' | 'perdidas';

interface SelectorDesplegableProps {
  filtroActual: TipoFiltro;
  desplegableAbierto: boolean;
  onAlternarDesplegable: () => void;
  onSeleccionarFiltro: (filtro: TipoFiltro) => void;
  etiquetasFiltro: Record<TipoFiltro, string>;
}

export default function SelectorDesplegable({
  filtroActual,
  desplegableAbierto,
  onAlternarDesplegable,
  onSeleccionarFiltro,
  etiquetasFiltro,
}: SelectorDesplegableProps) {
  return (
    <View className="relative">
      <TouchableOpacity 
        onPress={onAlternarDesplegable}
        className="flex-row items-center border border-gray-200 rounded-xl px-4 py-2 bg-white shadow-sm"
      >
        <Filter size={15} color="#A08C79" className="mr-2" />
        <Text className="text-sm font-semibold text-[#333F48]">
          {etiquetasFiltro[filtroActual]}
        </Text>
      </TouchableOpacity>

      {desplegableAbierto && (
        <View className="absolute right-0 top-12 bg-white border border-gray-100 rounded-xl shadow-xl w-36 z-50 overflow-hidden">
          {(['todas', 'ganadas', 'perdidas'] as TipoFiltro[]).map((tipo) => (
            <TouchableOpacity
              key={tipo}
              className={`p-3 border-b border-gray-50 active:bg-gray-100 ${filtroActual === tipo ? 'bg-purple-50' : ''}`}
              onPress={() => onSeleccionarFiltro(tipo)}
            >
              <Text className={`text-sm ${filtroActual === tipo ? 'font-bold text-[#6A4F99]' : 'text-gray-600'}`}>
                {etiquetasFiltro[tipo]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}