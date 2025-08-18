import { supabase } from '@/integrations/supabase/client';
import { createLogEntry } from './log';

export interface Avion {
  id_avion?: number;
  modelo: string;
  capacidad: number;
}

export const avionService = {
  async list() {
    const { data, error } = await supabase
      .from('avion')
      .select('*')
      .order('modelo');

    if (error) throw error;
    return data;
  },

  async create(avion: Omit<Avion, 'id_avion'>, userId: number) {
    const { data, error } = await supabase
      .from('avion')
      .insert(avion)
      .select()
      .single();

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'avion', 'INSERT', data);
    
    return data;
  },

  async update(id: number, avion: Partial<Omit<Avion, 'id_avion'>>, userId: number) {
    const { data, error } = await supabase
      .from('avion')
      .update(avion)
      .eq('id_avion', id)
      .select()
      .single();

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'avion', 'UPDATE', { id_avion: id, ...avion });
    
    return data;
  },

  async remove(id: number, userId: number) {
    const { error } = await supabase
      .from('avion')
      .delete()
      .eq('id_avion', id);

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'avion', 'DELETE', { id_avion: id });
  }
};