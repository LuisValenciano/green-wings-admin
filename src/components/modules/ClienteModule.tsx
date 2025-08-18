import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { clienteService, type Cliente } from '@/services/cliente';
import { Plus, Edit, Trash2, Search, User } from 'lucide-react';

export default function ClienteModule() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    identificacion: '',
    telefono: '',
    correo: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteService.list();
      setClientes(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validaciones básicas
    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (!formData.identificacion.trim()) {
      toast({
        title: "Error",
        description: "La identificación es obligatoria",
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
      
      if (editingCliente) {
        await clienteService.update(editingCliente.id_cliente!, {
          nombre: formData.nombre.trim(),
          identificacion: formData.identificacion.trim(),
          telefono: formData.telefono.trim(),
          correo: formData.correo.trim()
        }, user.id_usuario);
        
        toast({
          title: "Éxito",
          description: "Cliente actualizado correctamente",
        });
      } else {
        await clienteService.create({
          nombre: formData.nombre.trim(),
          identificacion: formData.identificacion.trim(),
          telefono: formData.telefono.trim(),
          correo: formData.correo.trim()
        }, user.id_usuario);
        
        toast({
          title: "Éxito",
          description: "Cliente creado correctamente",
        });
      }

      await loadClientes();
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar el cliente",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (cliente: Cliente) => {
    if (!user) return;

    try {
      await clienteService.remove(cliente.id_cliente!, user.id_usuario);
      await loadClientes();
      
      toast({
        title: "Éxito",
        description: "Cliente eliminado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el cliente",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', identificacion: '', telefono: '', correo: '' });
    setEditingCliente(null);
  };

  const openEditDialog = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nombre: cliente.nombre,
      identificacion: cliente.identificacion,
      telefono: cliente.telefono,
      correo: cliente.correo
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.identificacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.correo.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600">
            Administra la información de los clientes de GreenAirways
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-gray-700">Nombre completo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Juan Pérez"
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

              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-gray-700">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                  placeholder="Ej: +506 8888-8888"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo" className="text-gray-700">Correo electrónico *</Label>
                <Input
                  id="correo"
                  type="email"
                  value={formData.correo}
                  onChange={(e) => setFormData(prev => ({ ...prev, correo: e.target.value }))}
                  placeholder="Ej: juan@email.com"
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
                  {formLoading ? 'Guardando...' : (editingCliente ? 'Actualizar' : 'Crear')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Búsqueda */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Buscar Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, identificación o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Lista de Clientes ({filteredClientes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClientes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? 'No se encontraron clientes con ese criterio' : 'No hay clientes registrados'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Nombre</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Identificación</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Teléfono</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Correo</th>
                    <th className="text-right py-3 px-4 text-gray-700 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClientes.map((cliente) => (
                    <tr key={cliente.id_cliente} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-gray-600">{cliente.id_cliente}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{cliente.nombre}</td>
                      <td className="py-3 px-4 text-gray-700">{cliente.identificacion}</td>
                      <td className="py-3 px-4 text-gray-700">{cliente.telefono || '-'}</td>
                      <td className="py-3 px-4 text-gray-700">{cliente.correo}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(cliente)}
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
                                <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el cliente "{cliente.nombre}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(cliente)}
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
