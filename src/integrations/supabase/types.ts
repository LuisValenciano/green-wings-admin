export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      avion: {
        Row: {
          capacidad: number
          id_avion: number
          modelo: string
        }
        Insert: {
          capacidad: number
          id_avion?: number
          modelo: string
        }
        Update: {
          capacidad?: number
          id_avion?: number
          modelo?: string
        }
        Relationships: []
      }
      cliente: {
        Row: {
          correo: string | null
          id_cliente: number
          identificacion: string
          nombre: string
          telefono: string | null
        }
        Insert: {
          correo?: string | null
          id_cliente?: number
          identificacion: string
          nombre: string
          telefono?: string | null
        }
        Update: {
          correo?: string | null
          id_cliente?: number
          identificacion?: string
          nombre?: string
          telefono?: string | null
        }
        Relationships: []
      }
      log: {
        Row: {
          acciones_realizadas: string | null
          fecha_hora: string | null
          id_log: number
          id_usuario: number | null
          tabla_afectada: string | null
        }
        Insert: {
          acciones_realizadas?: string | null
          fecha_hora?: string | null
          id_log?: number
          id_usuario?: number | null
          tabla_afectada?: string | null
        }
        Update: {
          acciones_realizadas?: string | null
          fecha_hora?: string | null
          id_log?: number
          id_usuario?: number | null
          tabla_afectada?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "log_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuario_sistema"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      pasajeros: {
        Row: {
          id_pasajeros: number
          id_reserva: number | null
          identificacion: string
          nombre: string
        }
        Insert: {
          id_pasajeros?: number
          id_reserva?: number | null
          identificacion: string
          nombre: string
        }
        Update: {
          id_pasajeros?: number
          id_reserva?: number | null
          identificacion?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "pasajeros_id_reserva_fkey"
            columns: ["id_reserva"]
            isOneToOne: false
            referencedRelation: "reserva"
            referencedColumns: ["id_reserva"]
          },
        ]
      }
      reserva: {
        Row: {
          codigo_reserva: string
          fecha_reserva: string | null
          id_cliente: number | null
          id_reserva: number
          id_vuelo: number | null
          observaciones: string | null
        }
        Insert: {
          codigo_reserva: string
          fecha_reserva?: string | null
          id_cliente?: number | null
          id_reserva?: number
          id_vuelo?: number | null
          observaciones?: string | null
        }
        Update: {
          codigo_reserva?: string
          fecha_reserva?: string | null
          id_cliente?: number | null
          id_reserva?: number
          id_vuelo?: number | null
          observaciones?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reserva_id_cliente_fkey"
            columns: ["id_cliente"]
            isOneToOne: false
            referencedRelation: "cliente"
            referencedColumns: ["id_cliente"]
          },
          {
            foreignKeyName: "reserva_id_vuelo_fkey"
            columns: ["id_vuelo"]
            isOneToOne: false
            referencedRelation: "vuelo"
            referencedColumns: ["id_vuelo"]
          },
        ]
      }
      roles: {
        Row: {
          id_rol: number
          nombre_rol: string
        }
        Insert: {
          id_rol?: number
          nombre_rol: string
        }
        Update: {
          id_rol?: number
          nombre_rol?: string
        }
        Relationships: []
      }
      ruta: {
        Row: {
          destino: string
          id_ruta: number
          origen: string
        }
        Insert: {
          destino: string
          id_ruta?: number
          origen: string
        }
        Update: {
          destino?: string
          id_ruta?: number
          origen?: string
        }
        Relationships: []
      }
      usuario_sistema: {
        Row: {
          contraseña: string
          correo: string
          id_usuario: number
          nombre_usuario: string
          rol: number | null
        }
        Insert: {
          contraseña: string
          correo: string
          id_usuario?: number
          nombre_usuario: string
          rol?: number | null
        }
        Update: {
          contraseña?: string
          correo?: string
          id_usuario?: number
          nombre_usuario?: string
          rol?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "usuario_sistema_rol_fkey"
            columns: ["rol"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id_rol"]
          },
        ]
      }
      vuelo: {
        Row: {
          avion_id: number | null
          fecha_salida: string
          hora_llegada: string
          hora_salida: string
          id_vuelo: number
          precio: number
          ruta: number | null
        }
        Insert: {
          avion_id?: number | null
          fecha_salida: string
          hora_llegada: string
          hora_salida: string
          id_vuelo?: number
          precio: number
          ruta?: number | null
        }
        Update: {
          avion_id?: number | null
          fecha_salida?: string
          hora_llegada?: string
          hora_salida?: string
          id_vuelo?: number
          precio?: number
          ruta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vuelo_avion_id_fkey"
            columns: ["avion_id"]
            isOneToOne: false
            referencedRelation: "avion"
            referencedColumns: ["id_avion"]
          },
          {
            foreignKeyName: "vuelo_ruta_fkey"
            columns: ["ruta"]
            isOneToOne: false
            referencedRelation: "ruta"
            referencedColumns: ["id_ruta"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
