import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, MapPin, Users, ChevronLeft } from 'lucide-react-native';

interface CabeceraProps {
  titulo: string;
  categoria: string;
  moneda: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  rematador: string;
  alVolver: () => void;
}

export const CabeceraSubasta: React.FC<CabeceraProps> = ({
  titulo, categoria, moneda, fecha, hora, ubicacion, rematador, alVolver
}) => (
  <View className="bg-[#6A4F99] pt-12 pb-8 px-4">
    <TouchableOpacity onPress={alVolver} className="flex-row items-center gap-2 mb-6">
      <ChevronLeft color="white" size={24} />
      <Text className="text-white text-base">Volver</Text>
    </TouchableOpacity>

    <View className="flex-row items-center gap-2 mb-4">
      <View className="px-3 py-1 bg-white/20 rounded-full">
        <Text className="text-white text-xs capitalize">{categoria}</Text>
      </View>
      <View className="px-3 py-1 bg-white/20 rounded-full">
        <Text className="text-white text-xs uppercase">{moneda}</Text>
      </View>
    </View>

    <Text className="text-3xl font-bold text-white mb-4">{titulo}</Text>
    
    <View className="space-y-3 mb-6">
      <View className="flex-row items-center gap-2">
        <Calendar color="white" size={18} />
        <Text className="text-white">{fecha} • {hora} hs</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <MapPin color="white" size={18} />
        <Text className="text-white">{ubicacion}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Users color="white" size={18} />
        <Text className="text-white">Rematador: {rematador}</Text>
      </View>
    </View>
  </View>
);