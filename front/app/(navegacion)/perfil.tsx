import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { User, Mail, MapPin, Globe, Shield, CreditCard, Award, Package, FileText, ShoppingBag, LogOut, UploadCloud } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/app/lib/api';

export default function Profile() {
  const router = useRouter();
  const { logout, user, token } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      
      const fetchProfileAndStats = async () => {
        if (!token) {
          setLoading(false);
          return;
        }
        try {
          // Consultamos en paralelo el perfil de usuario y las estadísticas optimizadas del back
          const [resUser, resStats] = await Promise.all([
            apiGet('/usuarios/yo', token),
            apiGet('/usuarios/yo/estadisticas', token).catch(() => null)
          ]);

          if (resUser && resUser.user) {
            setProfileData({
              firstName: resUser.user.firstName,
              lastName: resUser.user.lastName,
              email: resUser.user.email,
              address: resUser.user.address || "No especificado",
              country: resUser.user.country || "No especificado",
              category: resUser.user.category ? resUser.user.category.charAt(0).toUpperCase() + resUser.user.category.slice(1).toLowerCase() : "Común",
              verified: resUser.user.isApproved,
              memberSince: resUser.user.createdAt ? resUser.user.createdAt.split('-').reverse().join('/') : 'Reciente',
              totalBids: resStats?.totalBids ?? 0,
              wonAuctions: resStats?.auctionsWon ?? 0,
              totalSpent: resStats?.totalSpent 
                ? `$${resStats.totalSpent.toLocaleString('es-AR')}` 
                : "$0",
            });
          }
        } catch (e) {
          console.warn('Error al cargar el perfil y métricas', e);
          if (user) {
            setProfileData({
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email,
              address: "No especificado",
              country: "No especificado",
              category: user.category || "Común",
              verified: user.verified || false,
              memberSince: "Reciente",
              totalBids: 0,
              wonAuctions: 0,
              totalSpent: "$0",
            });
          }
        } finally {
          setLoading(false);
        }
      };

      fetchProfileAndStats();
    }, [token, user])
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6A4F99" />
      </View>
    );
  }

  const categoryColors: Record<string, string> = {
    "Común": "#A08C79",
    "Especial": "#6A4F99",
    "Plata": "#C0C0C0",
    "Oro": "#C9A063",
    "Platino": "#E2C3BC",
  };

  const currentCategory = profileData?.category || "Común";
  const catColor = categoryColors[currentCategory] || categoryColors["Común"];

  const stats = [
    { label: "Pujas Totales", value: profileData?.totalBids ?? 0 },
    { label: "Subastas Ganadas", value: profileData?.wonAuctions ?? 0 },
    { label: "Total Invertido", value: profileData?.totalSpent ?? "$0", highlight: true },
  ];

  return (
    <ScrollView ref={scrollRef} className="flex-1 bg-gray-50 px-4 py-4" showsVerticalScrollIndicator={false}>
      <View className="mb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-3xl font-bold text-[#333F48] mb-1">Mi Perfil</Text>
          <Text className="text-[#A08C79]">Información de tu cuenta</Text>
        </View>
        <TouchableOpacity 
          onPress={async () => {
            await logout();
            router.replace('/(autenticacion)/iniciar-sesion');
          }} 
          className="p-2 bg-red-100 rounded-full"
        >
          <LogOut color="#ef4444" size={20} />
        </TouchableOpacity>
      </View>

      {/* Tarjeta de Categoría */}
      <View className="bg-[#6A4F99] rounded-2xl shadow-lg p-6 mb-6">
        <View className="items-center mb-2">
          <View 
            className="w-20 h-20 rounded-full mb-3 items-center justify-center border-4 border-white"
            style={{ backgroundColor: catColor }}
          >
            <Award color="white" size={36} />
          </View>
          <Text className="text-2xl font-bold text-white mb-1">Categoría {currentCategory}</Text>
          {profileData?.verified && (
            <View className="flex-row items-center gap-1 px-3 py-1 bg-white/20 rounded-full mt-1">
              <Shield color="white" size={14} />
              <Text className="text-white text-xs">Cuenta Verificada</Text>
            </View>
          )}
        </View>
      </View>

      {/* Información Personal */}
      <Card className="mb-6 border-gray-200 p-5 bg-white rounded-2xl shadow-sm">
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-lg font-bold text-[#333F48]">Información Personal</Text>
          <Link href="/perfil/editar" asChild>
            <TouchableOpacity>
              <Text className="text-[#6A4F99] font-semibold">Editar</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View className="gap-y-4">
          <View className="flex-row items-center gap-3">
            <User color="#A08C79" size={20} />
            <View>
              <Text className="text-xs text-[#A08C79] mb-0.5">Nombre Completo</Text>
              <Text className="font-semibold text-[#333F48]">{profileData?.firstName} {profileData?.lastName}</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <Mail color="#A08C79" size={20} />
            <View>
              <Text className="text-xs text-[#A08C79] mb-0.5">Correo Electrónico</Text>
              <Text className="font-semibold text-[#333F48]">{profileData?.email}</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <MapPin color="#A08C79" size={20} />
            <View>
              <Text className="text-xs text-[#A08C79] mb-0.5">Domicilio Legal</Text>
              <Text className="font-semibold text-[#333F48]">{profileData?.address}</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <Globe color="#A08C79" size={20} />
            <View>
              <Text className="text-xs text-[#A08C79] mb-0.5">País de Origen</Text>
              <Text className="font-semibold text-[#333F48]">{profileData?.country}</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <Shield color="#A08C79" size={20} />
            <View>
              <Text className="text-xs text-[#A08C79] mb-0.5">Miembro Desde</Text>
              <Text className="font-semibold text-[#333F48]">{profileData?.memberSince}</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Estadísticas vinculadas con datos reales del Back */}
      <View className="mb-6">
        <Text className="text-lg font-bold text-[#333F48] mb-3">Estadísticas de Cuenta</Text>
        <View className="flex-row gap-2">
          {stats.map((stat, index) => (
            <View
              key={index}
              className={`flex-1 p-4 rounded-xl border ${stat.highlight ? 'bg-[#C9A063] border-[#C9A063]' : 'bg-white border-gray-200 shadow-sm'}`}
            >
              <View style={{ height: 28 }} className="mb-1">
                <Text numberOfLines={2} className={`text-[10px] font-semibold ${stat.highlight ? 'text-white/90' : 'text-[#A08C79]'}`}>{stat.label}</Text>
              </View>
              <Text 
                className={`text-sm font-bold ${stat.highlight ? 'text-white' : 'text-[#333F48]'}`} 
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {stat.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Acciones Rápidas */}
      <Card className="mb-8 border-gray-200 p-2 bg-white rounded-2xl shadow-sm">
        <Text className="text-lg font-bold text-[#333F48] mb-2 px-3 pt-3">Acciones Rápidas</Text>
        
        <Link href="/perfil/medios-de-pago" asChild>
          <TouchableOpacity className="flex-row items-center gap-3 p-3 border-b border-gray-100">
            <CreditCard color="#6A4F99" size={20} />
            <Text className="text-[#333F48] font-medium">Medios de Pago</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/perfil/subir-articulo" asChild>
          <TouchableOpacity className="flex-row items-center gap-3 p-3 border-b border-gray-100">
            <UploadCloud color="#6A4F99" size={20} />
            <Text className="text-[#333F48] font-medium">Subir Artículo</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/perfil/mis-compras" asChild>
          <TouchableOpacity className="flex-row items-center gap-3 p-3 border-b border-gray-100">
            <ShoppingBag color="#6A4F99" size={20} />
            <Text className="text-[#333F48] font-medium">Mis Compras</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/perfil/mis-ventas" asChild>
          <TouchableOpacity className="flex-row items-center gap-3 p-3 border-b border-gray-100">
            <Package color="#6A4F99" size={20} />
            <Text className="text-[#333F48] font-medium">Mis Ventas</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/perfil/mis-documentos" asChild>
          <TouchableOpacity className="flex-row items-center gap-3 p-3">
            <FileText color="#6A4F99" size={20} />
            <Text className="text-[#333F48] font-medium">Mis Documentos</Text>
          </TouchableOpacity>
        </Link>
      </Card>
      
      <View className="h-10" />
    </ScrollView>
  );
}