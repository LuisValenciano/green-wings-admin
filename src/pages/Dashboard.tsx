import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plane, 
  Users, 
  UserCheck, 
  Calendar, 
  MapPin, 
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react';

interface DashboardStats {
  vuelos: number;
  clientes: number;
  pasajeros: number;
  reservas: number;
  rutas: number;
  logs: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    vuelos: 0,
    clientes: 0,
    pasajeros: 0,
    reservas: 0,
    rutas: 0,
    logs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener estadísticas de todas las tablas
        const [
          { count: vuelos },
          { count: clientes },
          { count: pasajeros },
          { count: reservas },
          { count: rutas },
          { count: logs }
        ] = await Promise.all([
          supabase.from('vuelo').select('*', { count: 'exact', head: true }),
          supabase.from('cliente').select('*', { count: 'exact', head: true }),
          supabase.from('pasajeros').select('*', { count: 'exact', head: true }),
          supabase.from('reserva').select('*', { count: 'exact', head: true }),
          supabase.from('ruta').select('*', { count: 'exact', head: true }),
          supabase.from('log').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          vuelos: vuelos || 0,
          clientes: clientes || 0,
          pasajeros: pasajeros || 0,
          reservas: reservas || 0,
          rutas: rutas || 0,
          logs: logs || 0
        });
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Vuelos',
      value: stats.vuelos,
      icon: Plane,
      color: 'bg-blue-500',
      description: 'Vuelos programados'
    },
    {
      title: 'Clientes',
      value: stats.clientes,
      icon: Users,
      color: 'bg-green-500',
      description: 'Clientes registrados'
    },
    {
      title: 'Pasajeros',
      value: stats.pasajeros,
      icon: UserCheck,
      color: 'bg-purple-500',
      description: 'Pasajeros totales'
    },
    {
      title: 'Reservas',
      value: stats.reservas,
      icon: Calendar,
      color: 'bg-orange-500',
      description: 'Reservas activas'
    },
    {
      title: 'Rutas',
      value: stats.rutas,
      icon: MapPin,
      color: 'bg-red-500',
      description: 'Rutas disponibles'
    },
    {
      title: 'Logs',
      value: stats.logs,
      icon: FileText,
      color: 'bg-gray-500',
      description: 'Registros del sistema'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bienvenido al panel administrativo de GreenAirways</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Gestionar Vuelos</p>
                <p className="text-sm text-gray-600">Programar y administrar vuelos</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Clientes</p>
                <p className="text-sm text-gray-600">Administrar información de clientes</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Reservas</p>
                <p className="text-sm text-gray-600">Gestionar reservas de vuelos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Sistema iniciado</p>
                  <p className="text-xs text-gray-500">Hace unos momentos</p>
                </div>
              </div>
              <div className="flex items-center">
                <FileText className="w-4 h-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Logs del sistema</p>
                  <p className="text-xs text-gray-500">Registros de actividad</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}