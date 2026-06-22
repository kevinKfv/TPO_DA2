import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Lock } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Link } from 'expo-router';

interface TarjetaArticuloProps {
  titulo: string;
  descripcion: string;
  precioBase: string;
  imagen: string;
  artista?: string;
  estaAutenticado: boolean;
}

export const TarjetaArticulo: React.FC<TarjetaArticuloProps> = ({
  titulo, descripcion, precioBase, imagen, artista, estaAutenticado
}) => (
  <Card className="overflow-hidden border-gray-200 bg-white shadow-sm rounded-xl">
    {imagen ? (
      <Image source={{ uri: imagen }} className="w-full h-56" contentFit="cover" />
    ) : (
      <View className="w-full h-56 bg-gray-200 items-center justify-center">
        <Text className="text-gray-400">Sin Imagen Disponible</Text>
      </View>
    )}
    <View className="p-5">
      <Text className="text-xl font-bold text-[#333F48] mb-1">{titulo}</Text>
      
      <View className="flex-row justify-between mb-4">
        <View>
          <Text className="text-sm text-[#A08C79] mb-1">Precio Base</Text>
          {estaAutenticado ? (
            <Text className="text-xl font-bold text-[#C9A063]">{precioBase}</Text>
          ) : (
            <View className="flex-row items-center gap-1">
              <Lock color="#A08C79" size={14} />
              <Link href="/(autenticacion)/iniciar-sesion" asChild>
                <TouchableOpacity>
                  <Text className="text-[#6A4F99] underline text-sm">Inicia sesión</Text>
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </View>
        {artista && (
          <View className="items-end">
            <Text className="text-sm text-[#A08C79] mb-1">Artista</Text>
            <Text className="font-semibold text-[#333F48]">{artista}</Text>
          </View>
        )}
      </View>

      <Text className="text-[#A08C79] mb-2 leading-5">{descripcion}</Text>
    </View>
  </Card>
);