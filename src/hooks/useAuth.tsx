import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserSystemData {
  id_usuario: number;
  nombre_usuario: string;
  rol: number;
  correo: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userSystem: UserSystemData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userSystem, setUserSystem] = useState<UserSystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user system data after auth
          setTimeout(async () => {
            await fetchUserSystemData(session.user.email!);
          }, 0);
        } else {
          setUserSystem(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserSystemData(session.user.email!);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserSystemData = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('usuario_sistema')
        .select('*')
        .eq('correo', email)
        .single();

      if (error || !data) {
        toast({
          title: "Acceso denegado",
          description: "Usuario no autorizado en GreenAirways",
          variant: "destructive",
        });
        await signOut();
        return;
      }

      // Verificar que el usuario sea Administrador (rol = 1)
      if (data.rol !== 1) {
        toast({
          title: "Acceso denegado",
          description: "Solo administradores pueden ingresar a GreenAirways",
          variant: "destructive",
        });
        await signOut();
        return;
      }

      setUserSystem(data);
    } catch (error) {
      console.error('Error fetching user system data:', error);
      await signOut();
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: 'Error inesperado al iniciar sesión' };
    }
  };

  const signOut = async () => {
    setUserSystem(null);
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    userSystem,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};