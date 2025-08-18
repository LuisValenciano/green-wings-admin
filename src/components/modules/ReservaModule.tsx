import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { reservaService, type Reserva, type ReservaWithRelations } from '@/services/reserva';
import { Plus, Edit, Trash2, Search, Calendar, User, Plane } from 'lucide-react';

interface Cliente {
  id_cliente: number;
  nombre: string;
  identificacion: string;
}

interface Vuelo {
  id_vuelo: number;
  fecha_salida: string;
  hora_salida: string;
  ruta_info?: {
    origen: string;
    destino: string;
  };
}

export default function ReservaModule() {
  const [reservas, setReservas] = useState<ReservaWithRelations[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReserva, setEditingReserva] = useState<ReservaWithRelations | null>(null);
  const [formData, setFormData] = useState({
    id_cliente: '',
    id_vuelo: '',
    fecha_reserva: '',
    codigo_reserva: '',
    observaciones: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reservasData, clientesData, vuelosData] = await Promise.all([
        reservaService.list(),
        reservaService.getClientes(),
        reservaService.getVuelos()
      ]);
      setReservas(reservasData);
      setClientes(clientesData);
      setVuelos(vuelosData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validaciones
    if (!formData.id_cliente || !formData.id_vuelo || !formData.fecha_reserva) {
      toast({
        title: "Error",
        description: "Cliente, vuelo y fecha de reserva son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      setFormLoading(true);
      
      const reservaData = {
        id_cliente: parseInt(formData.id_cliente),
        id_vuelo: parseInt(formData.id_vuelo),
        fecha_reserva: formData.fecha_reserva,
        codigo_reserva: formData.codigo_reserva.trim(),
        observaciones: formData.observaciones.trim()
      };
      
      if (editingReserva) {
        await reservaService.update(editingReserva.id_reserva!, reservaData, user.id_usuario);
        
        toast({
          title: "Éxito",
          description: "Reserva actualizada correctamente",
        });
      } else {
        await reservaService.create(reservaData, user.id_usuario);
        
        toast({
          title: "Éxito",
          description: "Reserva creada correctamente",
        });
      }

      await loadData();
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar la reserva",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (reserva: ReservaWithRelations) => {
    if (!user) return;

    try {
      await reservaService.remove(reserva.id_reserva!, user.id_usuario);
      await loadData();
      
      toast({
        title: "Éxito",
        description: "Reserva eliminada correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar la reserva",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      id_cliente: '',
      id_vuelo: '',
      fecha_reserva: '',
      codigo_reserva: '',
      observaciones: ''
    });
    setEditingReserva(null);
  };

  const openEditDialog = (reserva: ReservaWithRelations) => {
    setEditingReserva(reserva);
    setFormData({
      id_cliente: reserva.id_cliente.toString(),
      id_vuelo: reserva.id_vuelo.toString(),
      fecha_reserva: reserva.fecha_reserva,
      codigo_reserva: reserva.codigo_reserva,
      observaciones: reserva.observaciones || ''
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    // Establecer fecha actual por defecto
    setFormData(prev => ({
      ...prev,
      fecha_reserva: new Date().toISOString().split('T')[0]
    }));
    setIsDialogOpen(true);
  };

  const filteredReservas = reservas.filter(reserva => {
    const searchLower = searchTerm.toLowerCase();
    return (
      reserva.codigo_reserva.toLowerCase().includes(searchLower) ||
      reserva.cliente_info?.nombre.toLowerCase().includes(searchLower) ||
      reserva.cliente_info?.identificacion.toLowerCase().includes(searchLower) ||
      reserva.vuelo_info?.ruta_info?.origen.toLowerCase().includes(searchLower) ||
      reserva.vuelo_info?.ruta_info?.destino.toLowerCase().includes(searchLower)
    );
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
          <p className="text-gray-600">
            Administra las reservas de vuelos de GreenAirways
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Reserva
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingReserva ? 'Editar Reserva' : 'Nueva Reserva'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id_cliente" className="text-gray-700">Cliente *</Label>
                  <Select value={formData.id_cliente} onValueChange={(value) => setFormData(prev => ({ ...prev, id_cliente: value }))}>
                    <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id_cliente} value={cliente.id_cliente.toString()}>
                          {cliente.nombre} ({cliente.identificacion})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_vuelo" className="text-gray-700">Vuelo *</Label>
                  <Select value={formData.id_vuelo} onValueChange={(value) => setFormData(prev => ({ ...prev, id_vuelo: value }))}>
                    <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Seleccionar vuelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vuelos.map((vuelo) => (
                        <SelectItem key={vuelo.id_vuelo} value={vuelo.id_vuelo.toString()}>
                          {vuelo.ruta_info?.origen} → {vuelo.ruta_info?.destino} - {new Date(vuelo.fecha_salida).toLocaleDateString('es-CR')} {vuelo.hora_salida}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_reserva" className="text-gray-700">Fecha de reserva *</Label>
                  <Input
                    id="fecha_reserva"
                    type="date"
                    value={formData.fecha_reserva}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_reserva: e.target.value }))}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigo_reserva" className="text-gray-700">Código de reserva</Label>
                  <Input
                    id="codigo_reserva"
                    value={formData.codigo_reserva}
                    onChange={(e) => setFormData(prev => ({ ...prev, codigo_reserva: e.target.value }))}
                    placeholder="Se genera automáticamente si está vacío"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones" className="text-gray-700">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Observaciones adicionales..."
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={formLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={formLoading} className="bg-green-600 hover:bg-green-700">
                  {formLoading ? 'Guardando...' : (editingReserva ? 'Actualizar' : 'Crear')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Búsqueda */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Buscar Reservas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por código, cliente o ruta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de reservas */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Lista de Reservas ({filteredReservas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReservas.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? 'No se encontraron reservas con ese criterio' : 'No hay reservas registradas'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Código</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Cliente</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Vuelo</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Fecha Reserva</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Observaciones</th>
                    <th className="text-right py-3 px-4 text-gray-700 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservas.map((reserva) => (
                    <tr key={reserva.id_reserva} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-gray-600">{reserva.id_reserva}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">
                          {reserva.codigo_reserva}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1 text-blue-600" />
                          <span>{reserva.cliente_info?.nombre}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        <div className="flex items-center">
                          <Plane className="w-4 h-4 mr-1 text-green-600" />
                          <span>
                            {reserva.vuelo_info?.ruta_info?.origen} → {reserva.vuelo_info?.ruta_info?.destino}
                            <br />
                            <span className="text-sm text-gray-500">
                              {new Date(reserva.vuelo_info?.fecha_salida || '').toLocaleDateString('es-CR')} {reserva.vuelo_info?.hora_salida}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-purple-600" />
                          <span>{new Date(reserva.fecha_reserva).toLocaleDateString('es-CR')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {reserva.observaciones ? (
                          <span className="text-sm">{reserva.observaciones}</span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(reserva)}
                            className="border-gray-300 hover:bg-green-50 hover:border-green-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="border-gray-300 hover:bg-red-50 hover:border-red-300">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar reserva?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente la reserva "{reserva.codigo_reserva}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(reserva)}
                                  className="bg-red-600 text-white hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
