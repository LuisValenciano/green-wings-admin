import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { rutaService, type Ruta } from '@/services/ruta';
import { Plus, Edit, Trash2, Search, MapPin } from 'lucide-react';

export default function RutaModule() {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRuta, setEditingRuta] = useState<Ruta | null>(null);
  const [formData, setFormData] = useState({
    origen: '',
    destino: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadRutas();
  }, []);

  const loadRutas = async () => {
    try {
      setLoading(true);
      const data = await rutaService.list();
      setRutas(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar las rutas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.origen.trim()) {
      toast({
        title: "Error",
        description: "El origen es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (!formData.destino.trim()) {
      toast({
        title: "Error",
        description: "El destino es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (formData.origen.trim().toLowerCase() === formData.destino.trim().toLowerCase()) {
      toast({
        title: "Error",
        description: "El origen y destino no pueden ser iguales",
        variant: "destructive",
      });
      return;
    }

    try {
      setFormLoading(true);
      
      if (editingRuta) {
        await rutaService.update(editingRuta.id_ruta!, {
          origen: formData.origen.trim(),
          destino: formData.destino.trim()
        }, user.id_usuario);
        
        toast({
          title: "Éxito",
          description: "Ruta actualizada correctamente",
        });
      } else {
        await rutaService.create({
          origen: formData.origen.trim(),
          destino: formData.destino.trim()
        }, user.id_usuario);
        
        toast({
          title: "Éxito",
          description: "Ruta creada correctamente",
        });
      }

      await loadRutas();
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar la ruta",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (ruta: Ruta) => {
    if (!user) return;

    try {
      await rutaService.remove(ruta.id_ruta!, user.id_usuario);
      await loadRutas();
      
      toast({
        title: "Éxito",
        description: "Ruta eliminada correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar la ruta",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ origen: '', destino: '' });
    setEditingRuta(null);
  };

  const openEditDialog = (ruta: Ruta) => {
    setEditingRuta(ruta);
    setFormData({
      origen: ruta.origen,
      destino: ruta.destino
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredRutas = rutas.filter(ruta =>
    ruta.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ruta.destino.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Rutas</h1>
          <p className="text-gray-600">
            Administra las rutas de vuelo de GreenAirways
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Ruta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingRuta ? 'Editar Ruta' : 'Nueva Ruta'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="origen" className="text-gray-700">Origen *</Label>
                <Input
                  id="origen"
                  value={formData.origen}
                  onChange={(e) => setFormData(prev => ({ ...prev, origen: e.target.value }))}
                  placeholder="Ej: San José"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="destino" className="text-gray-700">Destino *</Label>
                <Input
                  id="destino"
                  value={formData.destino}
                  onChange={(e) => setFormData(prev => ({ ...prev, destino: e.target.value }))}
                  placeholder="Ej: Liberia"
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
                  {formLoading ? 'Guardando...' : (editingRuta ? 'Actualizar' : 'Crear')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Búsqueda */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Buscar Rutas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por origen o destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de rutas */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Lista de Rutas ({filteredRutas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRutas.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? 'No se encontraron rutas con ese criterio' : 'No hay rutas registradas'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Origen</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Destino</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Ruta</th>
                    <th className="text-right py-3 px-4 text-gray-700 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRutas.map((ruta) => (
                    <tr key={ruta.id_ruta} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-gray-600">{ruta.id_ruta}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{ruta.origen}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{ruta.destino}</td>
                      <td className="py-3 px-4 text-gray-700">
                        <span className="flex items-center">
                          <span>{ruta.origen}</span>
                          <MapPin className="w-4 h-4 mx-2 text-green-600" />
                          <span>{ruta.destino}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(ruta)}
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
                                <AlertDialogTitle>¿Eliminar ruta?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente la ruta "{ruta.origen} → {ruta.destino}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(ruta)}
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
