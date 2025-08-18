import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { logService, type LogEntryWithRelations } from '@/services/log';
import { Search, Filter, Calendar, User, Database, RefreshCw } from 'lucide-react';

interface Usuario {
  id_usuario: number;
  nombre_usuario: string;
}

export default function LogModule() {
  const [logs, setLogs] = useState<LogEntryWithRelations[]>([]);
  const [tablas, setTablas] = useState<string[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    tabla_afectada: '',
    id_usuario: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsData, tablasData, usuariosData] = await Promise.all([
        logService.list(),
        logService.getTablas(),
        logService.getUsuarios()
      ]);
      setLogs(logsData);
      setTablas(tablasData);
      setUsuarios(usuariosData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const filterParams: any = {};
      
      if (filters.tabla_afectada) {
        filterParams.tabla_afectada = filters.tabla_afectada;
      }
      
      if (filters.id_usuario) {
        filterParams.id_usuario = parseInt(filters.id_usuario);
      }
      
      if (filters.fecha_desde) {
        filterParams.fecha_desde = filters.fecha_desde;
      }
      
      if (filters.fecha_hasta) {
        filterParams.fecha_hasta = filters.fecha_hasta;
      }

      const logsData = await logService.list(filterParams);
      setLogs(logsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al aplicar filtros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      tabla_afectada: '',
      id_usuario: '',
      fecha_desde: '',
      fecha_hasta: ''
    });
    loadData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionType = (acciones: string) => {
    try {
      const parsed = JSON.parse(acciones);
      return parsed.action || 'Acción';
    } catch {
      return 'Acción';
    }
  };

  const getActionColor = (acciones: string) => {
    const action = getActionType(acciones).toLowerCase();
    if (action.includes('insert') || action.includes('crear')) return 'bg-green-100 text-green-800';
    if (action.includes('update') || action.includes('actualizar')) return 'bg-blue-100 text-blue-800';
    if (action.includes('delete') || action.includes('eliminar')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registro de Actividad</h1>
          <p className="text-gray-600">
            Historial de todas las acciones realizadas en el sistema
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-gray-300"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button
            variant="outline"
            onClick={loadData}
            className="border-gray-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Filtros de Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tabla" className="text-gray-700">Tabla</Label>
                <Select value={filters.tabla_afectada} onValueChange={(value) => setFilters(prev => ({ ...prev, tabla_afectada: value }))}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Todas las tablas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las tablas</SelectItem>
                    {tablas.map((tabla) => (
                      <SelectItem key={tabla} value={tabla}>
                        {tabla}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usuario" className="text-gray-700">Usuario</Label>
                <Select value={filters.id_usuario} onValueChange={(value) => setFilters(prev => ({ ...prev, id_usuario: value }))}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Todos los usuarios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los usuarios</SelectItem>
                    {usuarios.map((usuario) => (
                      <SelectItem key={usuario.id_usuario} value={usuario.id_usuario.toString()}>
                        {usuario.nombre_usuario}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_desde" className="text-gray-700">Fecha desde</Label>
                <Input
                  id="fecha_desde"
                  type="date"
                  value={filters.fecha_desde}
                  onChange={(e) => setFilters(prev => ({ ...prev, fecha_desde: e.target.value }))}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_hasta" className="text-gray-700">Fecha hasta</Label>
                <Input
                  id="fecha_hasta"
                  type="date"
                  value={filters.fecha_hasta}
                  onChange={(e) => setFilters(prev => ({ ...prev, fecha_hasta: e.target.value }))}
                  className="border-gray-300"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpiar
              </Button>
              <Button onClick={applyFilters} className="bg-green-600 hover:bg-green-700">
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de logs */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Registro de Actividad ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay registros de actividad
            </p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id_log} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.acciones_realizadas)}`}>
                          {getActionType(log.acciones_realizadas)}
                        </span>
                        <div className="flex items-center text-sm text-gray-600">
                          <Database className="w-4 h-4 mr-1" />
                          {log.tabla_afectada}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="w-4 h-4 mr-1" />
                          {log.usuario_info?.nombre_usuario || 'Usuario desconocido'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(log.fecha_hora)}
                        </div>
                      </div>
                      
                      <div className="bg-gray-100 rounded p-3 mt-2">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                          {logService.formatLogAction(log.acciones_realizadas)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
