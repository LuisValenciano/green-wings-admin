import { supabase } from '@/integrations/supabase/client';
import { createLogEntry } from './log';

export interface UsuarioSistema {
  id_usuario?: number;
  nombre_usuario: string;
  rol: number;
  correo: string;
  contraseña: string;
}

export interface UsuarioSistemaWithRelations extends UsuarioSistema {
  rol_info?: {
    nombre_rol: string;
  };
}

export const usuarioSistemaService = {
  async list() {
    const { data, error } = await supabase
      .from('usuario_sistema')
      .select(`
        *,
        rol_info:roles(nombre_rol)
      `)
      .order('nombre_usuario');

    if (error) throw error;
    return data as UsuarioSistemaWithRelations[];
  },

  async create(usuario: Omit<UsuarioSistema, 'id_usuario'>, userId: number) {
    // Verificar que el correo no exista
    const { data: existingEmail } = await supabase
      .from('usuario_sistema')
      .select('id_usuario')
      .eq('correo', usuario.correo)
      .single();

    if (existingEmail) {
      throw new Error('Ya existe un usuario con ese correo electrónico');
    }

    const { data, error } = await supabase
      .from('usuario_sistema')
      .insert(usuario)
      .select()
      .single();

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'usuario_sistema', 'INSERT', data);
    
    return data;
  },

  async update(id: number, usuario: Partial<Omit<UsuarioSistema, 'id_usuario'>>, userId: number) {
    // Verificar que el correo no exista en otro usuario
    if (usuario.correo) {
      const { data: existingEmail } = await supabase
        .from('usuario_sistema')
        .select('id_usuario')
        .eq('correo', usuario.correo)
        .neq('id_usuario', id)
        .single();

      if (existingEmail) {
        throw new Error('Ya existe un usuario con ese correo electrónico');
      }
    }

    const { data, error } = await supabase
      .from('usuario_sistema')
      .update(usuario)
      .eq('id_usuario', id)
      .select()
      .single();

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'usuario_sistema', 'UPDATE', { id_usuario: id, ...usuario });
    
    return data;
  },

  async remove(id: number, userId: number) {
    const { error } = await supabase
      .from('usuario_sistema')
      .delete()
      .eq('id_usuario', id);

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'usuario_sistema', 'DELETE', { id_usuario: id });
  },

  // Método auxiliar para obtener opciones de roles
  async getRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('id_rol, nombre_rol')
      .order('nombre_rol');

    if (error) throw error;
    return data;
  }
};
