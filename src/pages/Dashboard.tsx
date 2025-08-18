import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Search, Plane, Users, Calendar, UserCheck } from 'lucide-react';

interface DashboardStats {
  vuelos: number;
  reservas: number;
  clientes: number;
  aviones: number;
}

interface ProximoVuelo {
  id_vuelo: number;
  fecha_salida: string;
  hora_salida: string;
  precio: number;
  ruta?: {
    origen: string;
    destino: string;
  };
  avion?: {
    modelo: string;
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    vuelos: 0,
    reservas: 0,
    clientes: 0,
    aviones: 0
  });
  const [proximosVuelos, setProximosVuelos] = useState<ProximoVuelo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Obtener estadísticas
      const [vuelosRes, reservasRes, clientesRes, avionesRes] = await Promise.all([
        supabase.from('vuelo').select('id_vuelo', { count: 'exact', head: true }),
        supabase.from('reserva').select('id_reserva', { count: 'exact', head: true }),
        supabase.from('cliente').select('id_cliente', { count: 'exact', head: true }),
        supabase.from('avion').select('id_avion', { count: 'exact', head: true })
      ]);

      setStats({
        vuelos: vuelosRes.count || 0,
        reservas: reservasRes.count || 0,
        clientes: clientesRes.count || 0,
        aviones: avionesRes.count || 0
      });

      // Obtener próximos vuelos
      const { data: vuelos } = await supabase
        .from('vuelo')
        .select(`
          id_vuelo,
          fecha_salida,
          hora_salida,
          precio,
          ruta:ruta!inner(origen, destino),
          avion:avion!inner(modelo)
        `)
        .gte('fecha_salida', new Date().toISOString().split('T')[0])
        .order('fecha_salida', { ascending: true })
        .order('hora_salida', { ascending: true })
        .limit(10);

      setProximosVuelos(vuelos || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVuelos = proximosVuelos.filter(vuelo => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      vuelo.ruta?.origen.toLowerCase().includes(searchLower) ||
      vuelo.ruta?.destino.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general del sistema GreenAirways
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vuelos</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vuelos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reservas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clientes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aviones</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aviones}</div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos vuelos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Vuelos</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por origen o destino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSearchTerm('')}
              disabled={!searchTerm}
            >
              Limpiar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredVuelos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? 'No se encontraron vuelos con ese criterio' : 'No hay vuelos programados'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Fecha</th>
                    <th className="text-left py-3 px-4">Hora</th>
                    <th className="text-left py-3 px-4">Ruta</th>
                    <th className="text-left py-3 px-4">Avión</th>
                    <th className="text-right py-3 px-4">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVuelos.map((vuelo) => (
                    <tr key={vuelo.id_vuelo} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        {new Date(vuelo.fecha_salida).toLocaleDateString('es-CR')}
                      </td>
                      <td className="py-3 px-4">{vuelo.hora_salida}</td>
                      <td className="py-3 px-4">
                        {vuelo.ruta?.origen} → {vuelo.ruta?.destino}
                      </td>
                      <td className="py-3 px-4">{vuelo.avion?.modelo}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        ₡{vuelo.precio.toLocaleString('es-CR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}