import { supabase } from '@/integrations/supabase/client';
import { createLogEntry } from './log';

export interface Rol {
  id_rol?: number;
  nombre_rol: string;
}

export const rolesService = {
  async list() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('nombre_rol');

    if (error) throw error;
    return data;
  },

  async create(rol: Omit<Rol, 'id_rol'>, userId: number) {
    // Verificar que el nombre del rol no exista
    const { data: existingRol } = await supabase
      .from('roles')
      .select('id_rol')
      .eq('nombre_rol', rol.nombre_rol)
      .single();

    if (existingRol) {
      throw new Error('Ya existe un rol con ese nombre');
    }

    const { data, error } = await supabase
      .from('roles')
      .insert(rol)
      .select()
      .single();

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'roles', 'INSERT', data);
    
    return data;
  },

  async update(id: number, rol: Partial<Omit<Rol, 'id_rol'>>, userId: number) {
    // Verificar que el nombre del rol no exista en otro rol
    if (rol.nombre_rol) {
      const { data: existingRol } = await supabase
        .from('roles')
        .select('id_rol')
        .eq('nombre_rol', rol.nombre_rol)
        .neq('id_rol', id)
        .single();

      if (existingRol) {
        throw new Error('Ya existe un rol con ese nombre');
      }
    }

    const { data, error } = await supabase
      .from('roles')
      .update(rol)
      .eq('id_rol', id)
      .select()
      .single();

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'roles', 'UPDATE', { id_rol: id, ...rol });
    
    return data;
  },

  async remove(id: number, userId: number) {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id_rol', id);

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'roles', 'DELETE', { id_rol: id });
  }
};
