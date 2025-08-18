import { supabase } from '@/integrations/supabase/client';
import { createLogEntry } from './log';

export interface Pasajero {
  id_pasajeros?: number;
  id_reserva: number;
  nombre: string;
  identificacion: string;
}

export interface PasajeroWithRelations extends Pasajero {
  reserva_info?: {
    codigo_reserva: string;
    cliente_info?: {
      nombre: string;
    };
    vuelo_info?: {
      fecha_salida: string;
      ruta_info?: {
        origen: string;
        destino: string;
      };
    };
  };
}

export const pasajerosService = {
  async list() {
    const { data, error } = await supabase
      .from('pasajeros')
      .select(`
        *,
        reserva_info:reserva(
          codigo_reserva,
          cliente_info:cliente(nombre),
          vuelo_info:vuelo(
            fecha_salida,
            ruta_info:ruta(origen, destino)
          )
        )
      `)
      .order('nombre');

    if (error) throw error;
    return data as PasajeroWithRelations[];
  },

  async create(pasajero: Omit<Pasajero, 'id_pasajeros'>, userId: number) {
    const { data, error } = await supabase
      .from('pasajeros')
      .insert(pasajero)
      .select()
      .single();

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'pasajeros', 'INSERT', data);
    
    return data;
  },

  async update(id: number, pasajero: Partial<Omit<Pasajero, 'id_pasajeros'>>, userId: number) {
    const { data, error } = await supabase
      .from('pasajeros')
      .update(pasajero)
      .eq('id_pasajeros', id)
      .select()
      .single();

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'pasajeros', 'UPDATE', { id_pasajeros: id, ...pasajero });
    
    return data;
  },

  async remove(id: number, userId: number) {
    const { error } = await supabase
      .from('pasajeros')
      .delete()
      .eq('id_pasajeros', id);

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'pasajeros', 'DELETE', { id_pasajeros: id });
  },

  // Método auxiliar para obtener opciones de reservas
  async getReservas() {
    const { data, error } = await supabase
      .from('reserva')
      .select(`
        id_reserva,
        codigo_reserva,
        cliente_info:cliente(nombre),
        vuelo_info:vuelo(
          fecha_salida,
          ruta_info:ruta(origen, destino)
        )
      `)
      .order('fecha_reserva', { ascending: false });

    if (error) throw error;
    return data;
  }
};
