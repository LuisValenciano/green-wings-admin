import { supabase } from '@/integrations/supabase/client';

export interface LogEntry {
  id_log: number;
  id_usuario: number;
  acciones_realizadas: string;
  tabla_afectada: string;
  fecha_hora: string;
}

export interface LogEntryWithRelations extends LogEntry {
  usuario_info?: {
    nombre_usuario: string;
  };
}

export const logService = {
  async list(filters?: {
    tabla_afectada?: string;
    id_usuario?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
  }) {
    let query = supabase
      .from('log')
      .select(`
        *,
        usuario_info:usuario_sistema(nombre_usuario)
      `)
      .order('fecha_hora', { ascending: false });

    // Aplicar filtros
    if (filters?.tabla_afectada) {
      query = query.eq('tabla_afectada', filters.tabla_afectada);
    }

    if (filters?.id_usuario) {
      query = query.eq('id_usuario', filters.id_usuario);
    }

    if (filters?.fecha_desde) {
      query = query.gte('fecha_hora', filters.fecha_desde);
    }

    if (filters?.fecha_hasta) {
      query = query.lte('fecha_hora', filters.fecha_hasta);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as LogEntryWithRelations[];
  },

  async getTablas() {
    const { data, error } = await supabase
      .from('log')
      .select('tabla_afectada')
      .order('tabla_afectada');

    if (error) throw error;
    
    // Obtener valores únicos
    const tablasUnicas = [...new Set(data.map(item => item.tabla_afectada))];
    return tablasUnicas;
  },

  async getUsuarios() {
    const { data, error } = await supabase
      .from('usuario_sistema')
      .select('id_usuario, nombre_usuario')
      .order('nombre_usuario');

    if (error) throw error;
    return data;
  },

  // Función auxiliar para formatear JSON legible
  formatLogAction(acciones: string): string {
    try {
      const parsed = JSON.parse(acciones);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return acciones;
    }
  }
};

// Función para crear entradas de log (usada por otros servicios)
export const createLogEntry = async (
  userId: number, 
  tabla: string, 
  action: string, 
  data: any
) => {
  const logData = {
    id_usuario: userId,
    tabla_afectada: tabla,
    acciones_realizadas: JSON.stringify({
      action,
      data,
      timestamp: new Date().toISOString()
    }),
    fecha_hora: new Date().toISOString()
  };

  const { error } = await supabase
    .from('log')
    .insert(logData);

  if (error) {
    console.error('Error al crear log:', error);
  }
};