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
import { usuarioSistemaService, type UsuarioSistema, type UsuarioSistemaWithRelations } from '@/services/usuario-sistema';
import { Plus, Edit, Trash2, Search, User, Shield, Mail } from 'lucide-react';

interface Rol {
  id_rol: number;
  nombre_rol: string;
}

export default function UsuarioSistemaModule() {
  const [usuarios, setUsuarios] = useState<UsuarioSistemaWithRelations[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<UsuarioSistemaWithRelations | null>(null);
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    rol: '',
    correo: '',
    contraseña: ''
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
      const [usuariosData, rolesData] = await Promise.all([
        usuarioSistemaService.list(),
        usuarioSistemaService.getRoles()
      ]);
      setUsuarios(usuariosData);
      setRoles(rolesData);
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
    if (!formData.nombre_usuario.trim() || !formData.rol || !formData.correo.trim() || !formData.contraseña.trim()) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      toast({
        title: "Error",
        description: "El formato del correo electrónico no es válido",
        variant: "destructive",
      });
      return;
    }

    try {
      setFormLoading(true);
      
      const usuarioData = {
        nombre_usuario: formData.nombre_usuario.trim(),
        rol: parseInt(formData.rol),
        correo: formData.correo.trim(),
        contraseña: formData.contraseña.trim()
      };
      
      if (editingUsuario) {
        await usuarioSistemaService.update(editingUsuario.id_usuario!, usuarioData, user.id_usuario);
        
        toast({
          title: "Éxito",
          description: "Usuario actualizado correctamente",
        });
      } else {
        await usuarioSistemaService.create(usuarioData, user.id_usuario);
        
        toast({
          title: "Éxito",
          description: "Usuario creado correctamente",
        });
      }

      await loadData();
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar el usuario",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (usuario: UsuarioSistemaWithRelations) => {
    if (!user) return;

    try {
      await usuarioSistemaService.remove(usuario.id_usuario!, user.id_usuario);
      await loadData();
      
      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el usuario",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_usuario: '',
      rol: '',
      correo: '',
      contraseña: ''
    });
    setEditingUsuario(null);
  };

  const openEditDialog = (usuario: UsuarioSistemaWithRelations) => {
    setEditingUsuario(usuario);
    setFormData({
      nombre_usuario: usuario.nombre_usuario,
      rol: usuario.rol.toString(),
      correo: usuario.correo,
      contraseña: usuario.contraseña
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredUsuarios = usuarios.filter(usuario => {
    const searchLower = searchTerm.toLowerCase();
    return (
      usuario.nombre_usuario.toLowerCase().includes(searchLower) ||
      usuario.correo.toLowerCase().includes(searchLower) ||
      usuario.rol_info?.nombre_rol.toLowerCase().includes(searchLower)
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios del Sistema</h1>
          <p className="text-gray-600">
            Administra los usuarios del sistema de GreenAirways
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_usuario" className="text-gray-700">Nombre de usuario *</Label>
                <Input
                  id="nombre_usuario"
                  value={formData.nombre_usuario}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre_usuario: e.target.value }))}
                  placeholder="Ej: admin"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol" className="text-gray-700">Rol *</Label>
                <Select value={formData.rol} onValueChange={(value) => setFormData(prev => ({ ...prev, rol: value }))}>
                  <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((rol) => (
                      <SelectItem key={rol.id_rol} value={rol.id_rol.toString()}>
                        {rol.nombre_rol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo" className="text-gray-700">Correo electrónico *</Label>
                <Input
                  id="correo"
                  type="email"
                  value={formData.correo}
                  onChange={(e) => setFormData(prev => ({ ...prev, correo: e.target.value }))}
                  placeholder="Ej: admin@greenairways.com"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contraseña" className="text-gray-700">Contraseña *</Label>
                <Input
                  id="contraseña"
                  type="password"
                  value={formData.contraseña}
                  onChange={(e) => setFormData(prev => ({ ...prev, contraseña: e.target.value }))}
                  placeholder="Contraseña"
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
                  {formLoading ? 'Guardando...' : (editingUsuario ? 'Actualizar' : 'Crear')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Búsqueda */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Buscar Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, correo o rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuarios */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Lista de Usuarios ({filteredUsuarios.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsuarios.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Usuario</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Rol</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Correo</th>
                    <th className="text-right py-3 px-4 text-gray-700 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id_usuario} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-gray-600">{usuario.id_usuario}</td>
                      <td className="py-3 px-4 text-gray-700">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1 text-blue-600" />
                          <span className="font-medium">{usuario.nombre_usuario}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 mr-1 text-purple-600" />
                          <span>{usuario.rol_info?.nombre_rol}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1 text-green-600" />
                          <span>{usuario.correo}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(usuario)}
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
                                <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el usuario "{usuario.nombre_usuario}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(usuario)}
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
