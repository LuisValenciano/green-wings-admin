import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { avionService, type Avion } from '@/services/avion';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function AvionModule() {
  const [aviones, setAviones] = useState<Avion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAvion, setEditingAvion] = useState<Avion | null>(null);
  const [formData, setFormData] = useState({
    modelo: '',
    capacidad: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  
  const { userSystem } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadAviones();
  }, []);

  const loadAviones = async () => {
    try {
      setLoading(true);
      const data = await avionService.list();
      setAviones(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los aviones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSystem) return;

    const capacidad = parseInt(formData.capacidad);
    if (isNaN(capacidad) || capacidad <= 0) {
      toast({
        title: "Error",
        description: "La capacidad debe ser un número mayor a 0",
        variant: "destructive",
      });
      return;
    }

    try {
      setFormLoading(true);
      
      if (editingAvion) {
        await avionService.update(editingAvion.id_avion!, {
          modelo: formData.modelo,
          capacidad
        }, userSystem.id_usuario);
        
        toast({
          title: "Éxito",
          description: "Avión actualizado correctamente",
        });
      } else {
        await avionService.create({
          modelo: formData.modelo,
          capacidad
        }, userSystem.id_usuario);
        
        toast({
          title: "Éxito",
          description: "Avión creado correctamente",
        });
      }

      await loadAviones();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar el avión",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (avion: Avion) => {
    if (!userSystem) return;

    try {
      await avionService.remove(avion.id_avion!, userSystem.id_usuario);
      await loadAviones();
      
      toast({
        title: "Éxito",
        description: "Avión eliminado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el avión",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ modelo: '', capacidad: '' });
    setEditingAvion(null);
  };

  const openEditDialog = (avion: Avion) => {
    setEditingAvion(avion);
    setFormData({
      modelo: avion.modelo,
      capacidad: avion.capacidad.toString()
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredAviones = aviones.filter(avion =>
    avion.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    avion.capacidad.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Aviones</h1>
          <p className="text-muted-foreground">
            Administra la flota de aviones de GreenAirways
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Avión
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAvion ? 'Editar Avión' : 'Nuevo Avión'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                  placeholder="Ej: Boeing 737"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capacidad">Capacidad (pasajeros)</Label>
                <Input
                  id="capacidad"
                  type="number"
                  min="1"
                  value={formData.capacidad}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacidad: e.target.value }))}
                  placeholder="Ej: 180"
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
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Guardando...' : (editingAvion ? 'Actualizar' : 'Crear')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Aviones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por modelo o capacidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de aviones */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Aviones ({filteredAviones.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAviones.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? 'No se encontraron aviones con ese criterio' : 'No hay aviones registrados'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">Modelo</th>
                    <th className="text-left py-3 px-4">Capacidad</th>
                    <th className="text-right py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAviones.map((avion) => (
                    <tr key={avion.id_avion} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono">{avion.id_avion}</td>
                      <td className="py-3 px-4 font-medium">{avion.modelo}</td>
                      <td className="py-3 px-4">{avion.capacidad} pasajeros</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(avion)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar avión?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el avión "{avion.modelo}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(avion)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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