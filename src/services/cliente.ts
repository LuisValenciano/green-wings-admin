import { supabase } from '@/integrations/supabase/client';
import { createLogEntry } from './log';

export interface Cliente {
  id_cliente?: number;
  nombre: string;
  identificacion: string;
  telefono: string;
  correo: string;
}

export const clienteService = {
  async list() {
    const { data, error } = await supabase
      .from('cliente')
      .select('*')
      .order('nombre');

    if (error) throw error;
    return data;
  },

  async create(cliente: Omit<Cliente, 'id_cliente'>, userId: number) {
    // Verificar que el correo no exista
    const { data: existingEmail } = await supabase
      .from('cliente')
      .select('id_cliente')
      .eq('correo', cliente.correo)
      .single();

    if (existingEmail) {
      throw new Error('Ya existe un cliente con ese correo electrónico');
    }

    // Verificar que el teléfono no exista
    const { data: existingPhone } = await supabase
      .from('cliente')
      .select('id_cliente')
      .eq('telefono', cliente.telefono)
      .single();

    if (existingPhone) {
      throw new Error('Ya existe un cliente con ese número de teléfono');
    }

    const { data, error } = await supabase
      .from('cliente')
      .insert(cliente)
      .select()
      .single();

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'cliente', 'INSERT', data);
    
    return data;
  },

  async update(id: number, cliente: Partial<Omit<Cliente, 'id_cliente'>>, userId: number) {
    // Verificar que el correo no exista en otro cliente
    if (cliente.correo) {
      const { data: existingEmail } = await supabase
        .from('cliente')
        .select('id_cliente')
        .eq('correo', cliente.correo)
        .neq('id_cliente', id)
        .single();

      if (existingEmail) {
        throw new Error('Ya existe un cliente con ese correo electrónico');
      }
    }

    // Verificar que el teléfono no exista en otro cliente
    if (cliente.telefono) {
      const { data: existingPhone } = await supabase
        .from('cliente')
        .select('id_cliente')
        .eq('telefono', cliente.telefono)
        .neq('id_cliente', id)
        .single();

      if (existingPhone) {
        throw new Error('Ya existe un cliente con ese número de teléfono');
      }
    }

    const { data, error } = await supabase
      .from('cliente')
      .update(cliente)
      .eq('id_cliente', id)
      .select()
      .single();

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'cliente', 'UPDATE', { id_cliente: id, ...cliente });
    
    return data;
  },

  async remove(id: number, userId: number) {
    const { error } = await supabase
      .from('cliente')
      .delete()
      .eq('id_cliente', id);

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'cliente', 'DELETE', { id_cliente: id });
  }
};
