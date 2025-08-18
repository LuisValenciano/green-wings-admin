import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type GAUser = {
  id_usuario: number;
  nombre_usuario: string;
  rol: number;          // 1 = Admin
  correo: string;
};

type Ctx = {
  user: GAUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Ctx>({
  user: null, loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GAUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // restaurar nuestra caché
    const raw = localStorage.getItem("ga_user");
    if (raw) {
      try {
        const userData = JSON.parse(raw);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem("ga_user");
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Verificar credenciales directamente en usuario_sistema
      const { data, error: usError } = await supabase
        .from("usuario_sistema")
        .select("id_usuario,nombre_usuario,rol,correo,contraseña")
        .eq("correo", email)
        .eq("contraseña", password)
        .eq("rol", 1)
        .maybeSingle();

      if (usError) {
        console.error("Error en consulta:", usError);
        return { error: "Error de conexión con la base de datos" };
      }

      if (!data) {
        return { error: "Credenciales incorrectas o acceso denegado. Solo administradores (rol 1) pueden ingresar." };
      }

      // Verificar que el rol sea 1 (admin)
      if (data.rol !== 1) {
        return { error: "Acceso denegado. Solo administradores (rol 1) pueden ingresar." };
      }

      // Crear objeto de usuario sin la contraseña
      const userData: GAUser = {
        id_usuario: data.id_usuario,
        nombre_usuario: data.nombre_usuario,
        rol: data.rol,
        correo: data.correo
      };

      setUser(userData);
      localStorage.setItem("ga_user", JSON.stringify(userData));
      return { error: null };
    } catch (error) {
      console.error("Error en autenticación:", error);
      return { error: "Error interno del sistema" };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("ga_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
