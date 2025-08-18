import { supabase } from '@/integrations/supabase/client';
import { createLogEntry } from './log';

export interface Vuelo {
  id_vuelo?: number;
  ruta: number;
  avion_id: number;
  fecha_salida: string;
  hora_salida: string;
  hora_llegada: string;
  precio: number;
}

export interface VueloWithRelations extends Vuelo {
  ruta_info?: {
    origen: string;
    destino: string;
  };
  avion_info?: {
    modelo: string;
    capacidad: number;
  };
}

export const vueloService = {
  async list() {
    const { data, error } = await supabase
      .from('vuelo')
      .select(`
        *,
        ruta_info:ruta(origen, destino),
        avion_info:avion(modelo, capacidad)
      `)
      .order('fecha_salida', { ascending: true })
      .order('hora_salida', { ascending: true });

    if (error) throw error;
    return data as VueloWithRelations[];
  },

  async create(vuelo: Omit<Vuelo, 'id_vuelo'>, userId: number) {
    // Validar que hora_llegada > hora_salida
    if (vuelo.hora_llegada <= vuelo.hora_salida) {
      throw new Error('La hora de llegada debe ser posterior a la hora de salida');
    }

    // Validar que precio > 0
    if (vuelo.precio <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }

    const { data, error } = await supabase
      .from('vuelo')
      .insert(vuelo)
      .select()
      .single();

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'vuelo', 'INSERT', data);
    
    return data;
  },

  async update(id: number, vuelo: Partial<Omit<Vuelo, 'id_vuelo'>>, userId: number) {
    // Validar que hora_llegada > hora_salida si ambos están presentes
    if (vuelo.hora_llegada && vuelo.hora_salida && vuelo.hora_llegada <= vuelo.hora_salida) {
      throw new Error('La hora de llegada debe ser posterior a la hora de salida');
    }

    // Validar que precio > 0 si está presente
    if (vuelo.precio !== undefined && vuelo.precio <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }

    const { data, error } = await supabase
      .from('vuelo')
      .update(vuelo)
      .eq('id_vuelo', id)
      .select()
      .single();

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'vuelo', 'UPDATE', { id_vuelo: id, ...vuelo });
    
    return data;
  },

  async remove(id: number, userId: number) {
    const { error } = await supabase
      .from('vuelo')
      .delete()
      .eq('id_vuelo', id);

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'vuelo', 'DELETE', { id_vuelo: id });
  },

  // Métodos auxiliares para obtener opciones de selects
  async getRutas() {
    const { data, error } = await supabase
      .from('ruta')
      .select('id_ruta, origen, destino')
      .order('origen');

    if (error) throw error;
    return data;
  },

  async getAviones() {
    const { data, error } = await supabase
      .from('avion')
      .select('id_avion, modelo, capacidad')
      .order('modelo');

    if (error) throw error;
    return data;
  }
};
