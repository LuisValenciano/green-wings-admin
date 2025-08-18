import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { rolesService, type Rol } from '@/services/roles';
import { Plus, Edit, Trash2, Search, Shield } from 'lucide-react';

export default function RolesModule() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [formData, setFormData] = useState({
    nombre_rol: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await rolesService.list();
      setRoles(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.nombre_rol.trim()) {
      toast({
        title: "Error",
        description: "El nombre del rol es obligatorio",
        variant: "destructive",
      });
      return;
    }

    try {
      setFormLoading(true);
      
      if (editingRol) {
        await rolesService.update(editingRol.id_rol!, {
          nombre_rol: formData.nombre_rol.trim()
        }, user.id_usuario);
        
        toast({
          title: "Éxito",
          description: "Rol actualizado correctamente",
        });
      } else {
        await rolesService.create({
          nombre_rol: formData.nombre_rol.trim()
        }, user.id_usuario);
        
        toast({
          title: "Éxito",
          description: "Rol creado correctamente",
        });
      }

      await loadRoles();
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar el rol",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (rol: Rol) => {
    if (!user) return;

    try {
      await rolesService.remove(rol.id_rol!, user.id_usuario);
      await loadRoles();
      
      toast({
        title: "Éxito",
        description: "Rol eliminado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el rol",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ nombre_rol: '' });
    setEditingRol(null);
  };

  const openEditDialog = (rol: Rol) => {
    setEditingRol(rol);
    setFormData({
      nombre_rol: rol.nombre_rol
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredRoles = roles.filter(rol =>
    rol.nombre_rol.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Roles</h1>
          <p className="text-gray-600">
            Administra los roles del sistema de GreenAirways
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Rol
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingRol ? 'Editar Rol' : 'Nuevo Rol'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_rol" className="text-gray-700">Nombre del rol *</Label>
                <Input
                  id="nombre_rol"
                  value={formData.nombre_rol}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre_rol: e.target.value }))}
                  placeholder="Ej: Administrador"
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
                  {formLoading ? 'Guardando...' : (editingRol ? 'Actualizar' : 'Crear')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Búsqueda */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Buscar Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre del rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de roles */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Lista de Roles ({filteredRoles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRoles.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? 'No se encontraron roles con ese criterio' : 'No hay roles registrados'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Nombre del Rol</th>
                    <th className="text-right py-3 px-4 text-gray-700 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((rol) => (
                    <tr key={rol.id_rol} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-gray-600">{rol.id_rol}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{rol.nombre_rol}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(rol)}
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
                                <AlertDialogTitle>¿Eliminar rol?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el rol "{rol.nombre_rol}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(rol)}
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
