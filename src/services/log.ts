import { supabase } from '@/integrations/supabase/client';

export interface LogEntry {
  id_log?: number;
  id_usuario: number;
  tabla_afectada: string;
  acciones_realizadas: string;
  fecha_hora?: string;
}

export const logService = {
  async create(entry: Omit<LogEntry, 'id_log' | 'fecha_hora'>) {
    try {
      const { error } = await supabase
        .from('log')
        .insert({
          ...entry,
          fecha_hora: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error creating log entry:', error);
      }
    } catch (error) {
      console.error('Error creating log entry:', error);
    }
  },

  async list(filters?: {
    id_usuario?: number;
    tabla_afectada?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }) {
    let query = supabase
      .from('log')
      .select(`
        *,
        usuario_sistema!inner(nombre_usuario)
      `)
      .order('fecha_hora', { ascending: false });

    if (filters?.id_usuario) {
      query = query.eq('id_usuario', filters.id_usuario);
    }

    if (filters?.tabla_afectada) {
      query = query.eq('tabla_afectada', filters.tabla_afectada);
    }

    if (filters?.fecha_inicio) {
      query = query.gte('fecha_hora', filters.fecha_inicio);
    }

    if (filters?.fecha_fin) {
      query = query.lte('fecha_hora', filters.fecha_fin);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  }
};

// Helper para registrar cambios automáticamente
export const createLogEntry = (
  userId: number,
  tableName: string,
  action: 'INSERT' | 'UPDATE' | 'DELETE',
  data?: any
) => {
  const actionText = {
    INSERT: 'Crear',
    UPDATE: 'Actualizar', 
    DELETE: 'Eliminar'
  }[action];

  const acciones_realizadas = JSON.stringify({
    action: actionText,
    timestamp: new Date().toISOString(),
    data: data ? (typeof data === 'object' ? data : { id: data }) : undefined
  });

  return logService.create({
    id_usuario: userId,
    tabla_afectada: tableName,
    acciones_realizadas
  });
};