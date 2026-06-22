import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Package, Play } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost } from '@/app/lib/api';

// Sub-componentes en español
import { CabeceraSubasta } from '@/components/CabeceraSubasta';
import { TarjetaArticulo } from '@/components/TarjetaArticulo';

export default function AuctionDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isAuthenticated, user, token } = useAuth();
  
  const [subasta, setSubasta] = useState<any | null>(null);
  const [articulos, setArticulos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [registrando, setRegistrando] = useState(false);

  const rangoCategorias: Record<string, number> = {
    "comun": 1, "común": 1,
    "especial": 2,
    "plata": 3,
    "oro": 4,
    "platino": 5
  };

  // Efecto para hidratar la vista desde la Base de Datos real
  useEffect(() => {
    const cargarDatosSubasta = async () => {
      if (!id) return;
      try {
        setCargando(true);
        
        // 1. Llamada al endpoint de detalles de la subasta
        const datosSubasta = await apiGet(`/subastas/${id}`);
        
        if (datosSubasta) {
          const subastaMapeada = {
            id: datosSubasta.id,
            title: datosSubasta.title,
            date: new Date(datosSubasta.startDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }),
            time: new Date(datosSubasta.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: datosSubasta.location || "Buenos Aires, Argentina",
            category: datosSubasta.category || "comun",
            currency: datosSubasta.currency === 'pesos' ? 'ARS' : (datosSubasta.currency || 'USD'),
            auctioneer: datosSubasta.auctioneer || "Ricardo Martínez",
            description: datosSubasta.description || "Sin descripción disponible por el momento.",
            status: datosSubasta.status === 'ACTIVE' || datosSubasta.status === 'abierta' ? 'live' : 'upcoming'
          };
          setSubasta(subastaMapeada);
        }

        // 2. Llamada real a tu módulo aislado de catálogo
        const datosCatalogo = await apiGet(`/catalogos/subasta/${id}`);
        if (datosCatalogo && Array.isArray(datosCatalogo)) {
          setArticulos(datosCatalogo);
        }

      } catch (error) {
        console.warn("Error al cargar la información detallada:", error);
        Alert.alert("Error", "No se pudo recuperar el catálogo de esta subasta.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatosSubasta();
  }, [id]);

  const unirseASubasta = async () => {
    if (!token || !subasta) return;
    setRegistrando(true);
    try {
      await apiPost(`/subastas/${subasta.id}/registrar`, {}, token);
      router.push(`/subastas/en-vivo/${subasta.id}`);
    } catch (error: any) {
      if (error.message?.includes('already registered') || error.error?.includes('already registered')) {
        router.push(`/subastas/en-vivo/${subasta.id}`);
      } else {
        Alert.alert('Error', error.message || error.error || 'No se pudo registrar a la subasta');
      }
    } finally {
      setRegistrando(false);
    }
  };

  if (cargando) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6A4F99" />
      </View>
    );
  }

  if (!subasta) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-[#A08C79] text-base">La subasta seleccionada no existe.</Text>
      </View>
    );
  }

  // Reglas de negocio dinámicas 
  const nivelSubastaRequerido = rangoCategorias[subasta.category.toLowerCase()] || 1;
  const nivelUsuarioActual = rangoCategorias[(user?.category || "comun").toLowerCase()] || 1;
  const faltanRequisitosCategoria = nivelSubastaRequerido > nivelUsuarioActual;
  const noTieneMetodosPago = !user?.hasPaymentMethods;

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      
      <CabeceraSubasta
        titulo={subasta.title}
        categoria={subasta.category}
        moneda={subasta.currency}
        fecha={subasta.date}
        hora={subasta.time}
        ubicacion={subasta.location}
        rematador={subasta.auctioneer}
        alVolver={() => router.back()}
      />

      {/* Botonera de Acción e Inscripciones dinámicas */}
      <View className="px-4 -mt-4">
        {isAuthenticated ? (
          <View>
            {(noTieneMetodosPago || faltanRequisitosCategoria) ? (
              <View className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
                <Text className="text-red-800 text-sm font-semibold mb-1">No puedes participar en esta subasta</Text>
                {faltanRequisitosCategoria && (
                  <Text className="text-red-700 text-xs">• Requieres nivel {subasta.category} o superior (Tienes {user?.category || "Común"}).</Text>
                )}
                {noTieneMetodosPago && (
                  <Text className="text-red-700 text-xs">• Necesitas al menos un medio de pago verificado.</Text>
                )}
              </View>
            ) : (
              <TouchableOpacity 
                onPress={unirseASubasta} 
                disabled={registrando}
                className={`flex-row items-center justify-center gap-2 py-4 rounded-xl shadow-sm ${subasta.status === "live" ? 'bg-red-500' : 'bg-[#6A4F99]'}`}
              >
                {registrando ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Play color="white" size={20} />
                    <Text className="text-white font-bold text-lg">
                      {subasta.status === "live" ? 'Unirse a la Subasta EN VIVO' : 'Participar en Subasta'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View>
            <TouchableOpacity 
              onPress={() => router.push(`/subastas/en-vivo/${subasta.id}`)}
              className="flex-row items-center justify-center gap-2 py-4 rounded-xl bg-gray-600/80 border border-gray-400"
            >
              <Play color="white" size={20} />
              <Text className="text-white font-bold text-lg">Entrar como Espectador</Text>
            </TouchableOpacity>
            <Text className="text-gray-500 text-xs text-center mt-2">No podrás ver precios ni pujar sin iniciar sesión.</Text>
          </View>
        )}
      </View>

      {/* Descripción de la Subasta */}
      <View className="p-4 bg-white my-4 border-y border-gray-200">
        <Text className="text-xl font-bold text-[#333F48] mb-2">Descripción</Text>
        <Text className="text-[#A08C79] leading-6">{subasta.description}</Text>
      </View>

      {/* Listado del Catálogo */}
      <View className="px-4 pb-8">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-[#333F48]">Catálogo de Artículos</Text>
          <View className="flex-row items-center gap-1">
            <Package color="#A08C79" size={18} />
            <Text className="text-[#A08C79]">{articulos.length} art.</Text>
          </View>
        </View>

        <View className="gap-6">
          {articulos.map((articulo) => (
            <TarjetaArticulo
              key={articulo.id}
              titulo={articulo.title || articulo.name}
              descripcion={articulo.description}
              precioBase={`${subasta.currency === 'ARS' ? '$' : 'USD'} ${(articulo.startingPrice || articulo.basePrice || 0).toLocaleString('es-AR')}`}
              imagen={articulo.images?.[0] || articulo.fotoUrl || null}
              artista={articulo.artist}
              estaAutenticado={isAuthenticated}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
