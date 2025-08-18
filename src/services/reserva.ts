import { supabase } from '@/integrations/supabase/client';
import { createLogEntry } from './log';

export interface Reserva {
  id_reserva?: number;
  id_cliente: number;
  id_vuelo: number;
  fecha_reserva: string;
  codigo_reserva: string;
  observaciones?: string;
}

export interface ReservaWithRelations extends Reserva {
  cliente_info?: {
    nombre: string;
    identificacion: string;
  };
  vuelo_info?: {
    fecha_salida: string;
    hora_salida: string;
    ruta_info?: {
      origen: string;
      destino: string;
    };
  };
}

export const reservaService = {
  async list() {
    const { data, error } = await supabase
      .from('reserva')
      .select(`
        *,
        cliente_info:cliente(nombre, identificacion),
        vuelo_info:vuelo(
          fecha_salida,
          hora_salida,
          ruta_info:ruta(origen, destino)
        )
      `)
      .order('fecha_reserva', { ascending: false });

    if (error) throw error;
    return data as ReservaWithRelations[];
  },

  async create(reserva: Omit<Reserva, 'id_reserva'>, userId: number) {
    // Generar código de reserva si está vacío
    let codigoReserva = reserva.codigo_reserva;
    if (!codigoReserva || codigoReserva.trim() === '') {
      const timestamp = Date.now().toString().slice(-6);
      codigoReserva = `GRN-${timestamp}`;
    }

    const reservaData = {
      ...reserva,
      codigo_reserva: codigoReserva
    };

    const { data, error } = await supabase
      .from('reserva')
      .insert(reservaData)
      .select()
      .single();

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'reserva', 'INSERT', data);
    
    return data;
  },

  async update(id: number, reserva: Partial<Omit<Reserva, 'id_reserva'>>, userId: number) {
    // Generar código de reserva si está vacío
    let codigoReserva = reserva.codigo_reserva;
    if (codigoReserva !== undefined && (!codigoReserva || codigoReserva.trim() === '')) {
      const timestamp = Date.now().toString().slice(-6);
      codigoReserva = `GRN-${timestamp}`;
    }

    const updateData = {
      ...reserva,
      ...(codigoReserva && { codigo_reserva: codigoReserva })
    };

    const { data, error } = await supabase
      .from('reserva')
      .update(updateData)
      .eq('id_reserva', id)
      .select()
      .single();

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'reserva', 'UPDATE', { id_reserva: id, ...updateData });
    
    return data;
  },

  async remove(id: number, userId: number) {
    const { error } = await supabase
      .from('reserva')
      .delete()
      .eq('id_reserva', id);

    if (error) throw error;

    // Registrar en log
    await createLogEntry(userId, 'reserva', 'DELETE', { id_reserva: id });
  },

  // Métodos auxiliares para obtener opciones de selects
  async getClientes() {
    const { data, error } = await supabase
      .from('cliente')
      .select('id_cliente, nombre, identificacion')
      .order('nombre');

    if (error) throw error;
    return data;
  },

  async getVuelos() {
    const { data, error } = await supabase
      .from('vuelo')
      .select(`
        id_vuelo,
        fecha_salida,
        hora_salida,
        ruta_info:ruta(origen, destino)
      `)
      .gte('fecha_salida', new Date().toISOString().split('T')[0])
      .order('fecha_salida', { ascending: true })
      .order('hora_salida', { ascending: true });

    if (error) throw error;
    return data;
  }
};
