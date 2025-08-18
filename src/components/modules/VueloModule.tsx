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
import { vueloService, type Vuelo, type VueloWithRelations } from '@/services/vuelo';
import { Plus, Edit, Trash2, Search, Plane, MapPin } from 'lucide-react';

interface Ruta {
  id_ruta: number;
  origen: string;
  destino: string;
}

interface Avion {
  id_avion: number;
  modelo: string;
  capacidad: number;
}

export default function VueloModule() {
  const [vuelos, setVuelos] = useState<VueloWithRelations[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [aviones, setAviones] = useState<Avion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVuelo, setEditingVuelo] = useState<VueloWithRelations | null>(null);
  const [formData, setFormData] = useState({
    ruta: '',
    avion_id: '',
    fecha_salida: '',
    hora_salida: '',
    hora_llegada: '',
    precio: ''
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
      const [vuelosData, rutasData, avionesData] = await Promise.all([
        vueloService.list(),
        vueloService.getRutas(),
        vueloService.getAviones()
      ]);
      setVuelos(vuelosData);
      setRutas(rutasData);
      setAviones(avionesData);
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
    if (!formData.ruta || !formData.avion_id || !formData.fecha_salida || 
        !formData.hora_salida || !formData.hora_llegada || !formData.precio) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    const precio = parseFloat(formData.precio);
    if (isNaN(precio) || precio <= 0) {
      toast({
        title: "Error",
        description: "El precio debe ser un número mayor a 0",
        variant: "destructive",
      });
      return;
    }

    if (formData.hora_llegada <= formData.hora_salida) {
      toast({
        title: "Error",
        description: "La hora de llegada debe ser posterior a la hora de salida",
        variant: "destructive",
      });
      return;
    }

    try {
      setFormLoading(true);
      
      const vueloData = {
        ruta: parseInt(formData.ruta),
        avion_id: parseInt(formData.avion_id),
        fecha_salida: formData.fecha_salida,
        hora_salida: formData.hora_salida,
        hora_llegada: formData.hora_llegada,
        precio
      };
      
      if (editingVuelo) {
        await vueloService.update(editingVuelo.id_vuelo!, vueloData, user.id_usuario);
        
        toast({
          title: "Éxito",
          description: "Vuelo actualizado correctamente",
        });
      } else {
        await vueloService.create(vueloData, user.id_usuario);
        
        toast({
          title: "Éxito",
          description: "Vuelo creado correctamente",
        });
      }

      await loadData();
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar el vuelo",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (vuelo: VueloWithRelations) => {
    if (!user) return;

    try {
      await vueloService.remove(vuelo.id_vuelo!, user.id_usuario);
      await loadData();
      
      toast({
        title: "Éxito",
        description: "Vuelo eliminado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el vuelo",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      ruta: '',
      avion_id: '',
      fecha_salida: '',
      hora_salida: '',
      hora_llegada: '',
      precio: ''
    });
    setEditingVuelo(null);
  };

  const openEditDialog = (vuelo: VueloWithRelations) => {
    setEditingVuelo(vuelo);
    setFormData({
      ruta: vuelo.ruta.toString(),
      avion_id: vuelo.avion_id.toString(),
      fecha_salida: vuelo.fecha_salida,
      hora_salida: vuelo.hora_salida,
      hora_llegada: vuelo.hora_llegada,
      precio: vuelo.precio.toString()
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredVuelos = vuelos.filter(vuelo => {
    const searchLower = searchTerm.toLowerCase();
    return (
      vuelo.ruta_info?.origen.toLowerCase().includes(searchLower) ||
      vuelo.ruta_info?.destino.toLowerCase().includes(searchLower) ||
      vuelo.avion_info?.modelo.toLowerCase().includes(searchLower) ||
      vuelo.fecha_salida.includes(searchTerm)
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Vuelos</h1>
          <p className="text-gray-600">
            Administra los vuelos de GreenAirways
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Vuelo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingVuelo ? 'Editar Vuelo' : 'Nuevo Vuelo'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ruta" className="text-gray-700">Ruta *</Label>
                  <Select value={formData.ruta} onValueChange={(value) => setFormData(prev => ({ ...prev, ruta: value }))}>
                    <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Seleccionar ruta" />
                    </SelectTrigger>
                    <SelectContent>
                      {rutas.map((ruta) => (
                        <SelectItem key={ruta.id_ruta} value={ruta.id_ruta.toString()}>
                          {ruta.origen} → {ruta.destino}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avion_id" className="text-gray-700">Avión *</Label>
                  <Select value={formData.avion_id} onValueChange={(value) => setFormData(prev => ({ ...prev, avion_id: value }))}>
                    <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Seleccionar avión" />
                    </SelectTrigger>
                    <SelectContent>
                      {aviones.map((avion) => (
                        <SelectItem key={avion.id_avion} value={avion.id_avion.toString()}>
                          {avion.modelo} ({avion.capacidad} pax)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_salida" className="text-gray-700">Fecha de salida *</Label>
                <Input
                  id="fecha_salida"
                  type="date"
                  value={formData.fecha_salida}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha_salida: e.target.value }))}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hora_salida" className="text-gray-700">Hora de salida *</Label>
                  <Input
                    id="hora_salida"
                    type="time"
                    value={formData.hora_salida}
                    onChange={(e) => setFormData(prev => ({ ...prev, hora_salida: e.target.value }))}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hora_llegada" className="text-gray-700">Hora de llegada *</Label>
                  <Input
                    id="hora_llegada"
                    type="time"
                    value={formData.hora_llegada}
                    onChange={(e) => setFormData(prev => ({ ...prev, hora_llegada: e.target.value }))}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio" className="text-gray-700">Precio (₡) *</Label>
                <Input
                  id="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData(prev => ({ ...prev, precio: e.target.value }))}
                  placeholder="Ej: 50000"
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
                  {formLoading ? 'Guardando...' : (editingVuelo ? 'Actualizar' : 'Crear')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Búsqueda */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Buscar Vuelos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por ruta, avión o fecha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de vuelos */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Lista de Vuelos ({filteredVuelos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVuelos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? 'No se encontraron vuelos con ese criterio' : 'No hay vuelos registrados'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Ruta</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Avión</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Fecha</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Horario</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Precio</th>
                    <th className="text-right py-3 px-4 text-gray-700 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVuelos.map((vuelo) => (
                    <tr key={vuelo.id_vuelo} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-gray-600">{vuelo.id_vuelo}</td>
                      <td className="py-3 px-4 text-gray-700">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-green-600" />
                          <span>{vuelo.ruta_info?.origen} → {vuelo.ruta_info?.destino}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        <div className="flex items-center">
                          <Plane className="w-4 h-4 mr-1 text-blue-600" />
                          <span>{vuelo.avion_info?.modelo}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {new Date(vuelo.fecha_salida).toLocaleDateString('es-CR')}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {vuelo.hora_salida} - {vuelo.hora_llegada}
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-medium">
                        ₡{vuelo.precio.toLocaleString('es-CR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(vuelo)}
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
                                <AlertDialogTitle>¿Eliminar vuelo?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el vuelo.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(vuelo)}
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
