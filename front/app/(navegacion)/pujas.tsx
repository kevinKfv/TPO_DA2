import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { TrendingUp, Award, DollarSign, BarChart2 } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/app/lib/api';
import SelectorDesplegable from '@/components/SelectorDesplegable';
import FilaArticulo from '@/components/FilaArticulo';
import TarjetaMetrica from '@/components/metricas/TarjetaMetrica';
import GraficoBarras from '@/components/metricas/GraficoBarras';
import GraficoTorta from '@/components/metricas/GraficoTorta';

type TipoFiltro = 'todas' | 'ganadas' | 'perdidas';

export default function Bids() {
  const { token } = useAuth();
  const [pujas, setPujas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(true);
  const [filtro, setFiltro] = useState<TipoFiltro>('todas');
  const [desplegableAbierto, setDesplegableAbierto] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => { 
      scrollRef.current?.scrollTo({ y: 0, animated: false }); 
    }, [])
  );
  
  const [metricas, setMetricas] = useState({
    totalBids: 0,
    auctionsWon: 0,
    totalSpent: 0,
    winRate: 0,
    monthlyInvestment: [] as Array<{ mes: string; total: number }>,
  });

  useEffect(() => {
    const obtenerEstadisticas = async () => {
      try {
        if (!token) return;
        setCargandoEstadisticas(true);
        const datos = await apiGet('/usuarios/yo/estadisticas', token);
        if (datos) {
          setMetricas({
            totalBids: datos.totalBids ?? 0,
            auctionsWon: datos.auctionsWon ?? 0,
            totalSpent: datos.totalSpent ?? 0,
            winRate: datos.winRate ?? 0,
            monthlyInvestment: datos.monthlyInvestment || []
          });
        }
      } catch (error) {
        console.warn("Error al traer estadísticas", error);
      } finally {
        setCargandoEstadisticas(false);
      }
    };
    obtenerEstadisticas();
  }, [token]);

  useEffect(() => {
    const obtenerPujas = async () => {
      try {
        if (!token) return;
        setCargando(true);
        const res = await apiGet(`/pujos/mis-pujos?filter=${filtro}`, token);
        if (res && Array.isArray(res)) {
          setPujas(res);
        }
      } catch (error) {
        console.warn("Error al filtrar las pujas", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerPujas();
  }, [token, filtro]);

  return (
    <ScrollView ref={scrollRef} className="flex-1 bg-white px-5" showsVerticalScrollIndicator={false}>
      
      {/* Encabezado */}
      <View className="mt-8 mb-6">
        <Text className="text-3xl font-bold text-[#333F48] tracking-tight">Mis Pujas</Text>
        <Text className="text-sm text-[#A08C79] mt-1.5">
          Historial completo de participaciones y estadísticas
        </Text>
      </View>

      {/* Grid de Métricas */}
      {cargandoEstadisticas ? (
        <ActivityIndicator size="small" color="#6A4F99" className="py-6" />
      ) : (
        <View className="mb-6">
          <View className="flex-row gap-3 mb-3">
            <TarjetaMetrica 
              titulo="Total Participaciones" 
              valor={metricas.totalBids} 
              icono={<TrendingUp size={20} color="#6A4F99" />} 
            />
            <TarjetaMetrica 
              titulo="Subastas Ganadas" 
              valor={metricas.auctionsWon} 
              icono={<Award size={20} color="#C9A063" />} 
            />
          </View>
          <View className="flex-row gap-3">
            <TarjetaMetrica 
              titulo="Total Invertido" 
              valor={`$${metricas.totalSpent.toLocaleString('es-AR')}`} 
              icono={<DollarSign size={20} color="#A08C79" />} 
            />
            <TarjetaMetrica 
              titulo="Tasa de Éxito" 
              valor={`${metricas.winRate}%`} 
              icono={<BarChart2 size={20} color="#6A4F99" />} 
            />
          </View>
        </View>
      )}

      {/* Gráficos Analíticos */}
      {!cargandoEstadisticas && metricas.monthlyInvestment.length > 0 && (
        <GraficoBarras datos={metricas.monthlyInvestment} />
      )}
      <GraficoTorta />

      {/* Historial de Pujas */}
      <View className="mb-12">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-[#333F48]">Historial de Pujas</Text>
          <SelectorDesplegable 
            filtroActual={filtro}
            desplegableAbierto={desplegableAbierto}
            onAlternarDesplegable={() => setDesplegableAbierto(!desplegableAbierto)}
            onSeleccionarFiltro={(f) => { setFiltro(f); setDesplegableAbierto(false); }}
            etiquetasFiltro={{ todas: 'Todas', ganadas: 'Ganadas', perdidas: 'Perdidas' }}
          />
        </View>

        <View className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
          <View className="flex-row justify-between py-3 px-2 border-b border-gray-50">
            <Text className="text-xs font-bold text-gray-400 uppercase w-[65%]">Artículo</Text>
            <Text className="text-xs font-bold text-gray-400 uppercase w-[35%] text-right">Tu Puja</Text>
          </View>

          {cargando ? (
            <ActivityIndicator size="small" color="#6A4F99" className="py-10" />
          ) : pujas.length === 0 ? (
            <Text className="text-center text-gray-400 py-8 text-sm">No hay registros.</Text>
          ) : (
            pujas.map((puja, index) => <FilaArticulo key={puja.id ?? index} puja={puja} />)
          )}
        </View>
      </View>
    </ScrollView>
  );
}