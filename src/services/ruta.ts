import { supabase } from '@/integrations/supabase/client';
import { createLogEntry } from './log';

export interface Ruta {
  id_ruta?: number;
  origen: string;
  destino: string;
}

export const rutaService = {
  async list() {
    const { data, error } = await supabase
      .from('ruta')
      .select('*')
      .order('origen');

    if (error) throw error;
    return data;
  },

  async create(ruta: Omit<Ruta, 'id_ruta'>, userId: number) {
    // Validar que origen ≠ destino
    if (ruta.origen.toLowerCase() === ruta.destino.toLowerCase()) {
      throw new Error('El origen y destino no pueden ser iguales');
    }

    const { data, error } = await supabase
      .from('ruta')
      .insert(ruta)
      .select()
      .single();

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'ruta', 'INSERT', data);
    
    return data;
  },

  async update(id: number, ruta: Partial<Omit<Ruta, 'id_ruta'>>, userId: number) {
    // Validar que origen ≠ destino si ambos están presentes
    if (ruta.origen && ruta.destino && ruta.origen.toLowerCase() === ruta.destino.toLowerCase()) {
      throw new Error('El origen y destino no pueden ser iguales');
    }

    const { data, error } = await supabase
      .from('ruta')
      .update(ruta)
      .eq('id_ruta', id)
      .select()
      .single();

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'ruta', 'UPDATE', { id_ruta: id, ...ruta });
    
    return data;
  },

  async remove(id: number, userId: number) {
    const { error } = await supabase
      .from('ruta')
      .delete()
      .eq('id_ruta', id);

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'ruta', 'DELETE', { id_ruta: id });
  }
};
