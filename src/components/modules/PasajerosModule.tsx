import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { pasajerosService, type Pasajero, type PasajeroWithRelations } from '@/services/pasajeros';
import { Plus, Edit, Trash2, Search, User, Calendar, Plane } from 'lucide-react';

interface Reserva {
  id_reserva: number;
  codigo_reserva: string;
  cliente_info?: {
    nombre: string;
  };
  vuelo_info?: {
    fecha_salida: string;
    ruta_info?: {
      origen: string;
      destino: string;
    };
  };
}

export default function PasajerosModule() {
  const [pasajeros, setPasajeros] = useState<PasajeroWithRelations[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPasajero, setEditingPasajero] = useState<PasajeroWithRelations | null>(null);
  const [formData, setFormData] = useState({
    id_reserva: '',
    nombre: '',
    identificacion: ''
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
      const [pasajerosData, reservasData] = await Promise.all([
        pasajerosService.list(),
        pasajerosService.getReservas()
      ]);
      setPasajeros(pasajerosData);
      setReservas(reservasData);
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
    if (!formData.id_reserva || !formData.nombre.trim() || !formData.identificacion.trim()) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      setFormLoading(true);
      
      const pasajeroData = {
        id_reserva: parseInt(formData.id_reserva),
        nombre: formData.nombre.trim(),
        identificacion: formData.identificacion.trim()
      };
      
      if (editingPasajero) {
        await pasajerosService.update(editingPasajero.id_pasajeros!, pasajeroData, user.id_usuario);
        
        toast({
          title: "Éxito",
          description: "Pasajero actualizado correctamente",
        });
      } else {
        await pasajerosService.create(pasajeroData, user.id_usuario);
        
        toast({
          title: "Éxito",
          description: "Pasajero creado correctamente",
        });
      }

      await loadData();
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar el pasajero",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (pasajero: PasajeroWithRelations) => {
    if (!user) return;

    try {
      await pasajerosService.remove(pasajero.id_pasajeros!, user.id_usuario);
      await loadData();
      
      toast({
        title: "Éxito",
        description: "Pasajero eliminado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el pasajero",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      id_reserva: '',
      nombre: '',
      identificacion: ''
    });
    setEditingPasajero(null);
  };

  const openEditDialog = (pasajero: PasajeroWithRelations) => {
    setEditingPasajero(pasajero);
    setFormData({
      id_reserva: pasajero.id_reserva.toString(),
      nombre: pasajero.nombre,
      identificacion: pasajero.identificacion
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredPasajeros = pasajeros.filter(pasajero => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pasajero.nombre.toLowerCase().includes(searchLower) ||
      pasajero.identificacion.toLowerCase().includes(searchLower) ||
      pasajero.reserva_info?.codigo_reserva.toLowerCase().includes(searchLower) ||
      pasajero.reserva_info?.cliente_info?.nombre.toLowerCase().includes(searchLower)
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pasajeros</h1>
          <p className="text-gray-600">
            Administra los pasajeros de las reservas de GreenAirways
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Pasajero
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPasajero ? 'Editar Pasajero' : 'Nuevo Pasajero'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id_reserva" className="text-gray-700">Reserva *</Label>
                <Select value={formData.id_reserva} onValueChange={(value) => setFormData(prev => ({ ...prev, id_reserva: value }))}>
                  <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Seleccionar reserva" />
                  </SelectTrigger>
                  <SelectContent>
                    {reservas.map((reserva) => (
                      <SelectItem key={reserva.id_reserva} value={reserva.id_reserva.toString()}>
                        {reserva.codigo_reserva} - {reserva.cliente_info?.nombre} - {reserva.vuelo_info?.ruta_info?.origen} → {reserva.vuelo_info?.ruta_info?.destino}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-gray-700">Nombre completo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: María González"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="identificacion" className="text-gray-700">Identificación *</Label>
                <Input
                  id="identificacion"
                  value={formData.identificacion}
                  onChange={(e) => setFormData(prev => ({ ...prev, identificacion: e.target.value }))}
                  placeholder="Ej: 123456789"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
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
                  {formLoading ? 'Guardando...' : (editingPasajero ? 'Actualizar' : 'Crear')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Búsqueda */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Buscar Pasajeros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, identificación o código de reserva..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de pasajeros */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Lista de Pasajeros ({filteredPasajeros.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPasajeros.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? 'No se encontraron pasajeros con ese criterio' : 'No hay pasajeros registrados'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Pasajero</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Identificación</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Reserva</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Cliente</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Vuelo</th>
                    <th className="text-right py-3 px-4 text-gray-700 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPasajeros.map((pasajero) => (
                    <tr key={pasajero.id_pasajeros} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-gray-600">{pasajero.id_pasajeros}</td>
                      <td className="py-3 px-4 text-gray-700">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1 text-blue-600" />
                          <span className="font-medium">{pasajero.nombre}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{pasajero.identificacion}</td>
                      <td className="py-3 px-4 text-gray-700">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">
                          {pasajero.reserva_info?.codigo_reserva}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {pasajero.reserva_info?.cliente_info?.nombre || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        <div className="flex items-center">
                          <Plane className="w-4 h-4 mr-1 text-green-600" />
                          <span>
                            {pasajero.reserva_info?.vuelo_info?.ruta_info?.origen} → {pasajero.reserva_info?.vuelo_info?.ruta_info?.destino}
                            <br />
                            <span className="text-sm text-gray-500">
                              {pasajero.reserva_info?.vuelo_info?.fecha_salida ? 
                                new Date(pasajero.reserva_info.vuelo_info.fecha_salida).toLocaleDateString('es-CR') : '-'
                              }
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(pasajero)}
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
                                <AlertDialogTitle>¿Eliminar pasajero?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el pasajero "{pasajero.nombre}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(pasajero)}
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
