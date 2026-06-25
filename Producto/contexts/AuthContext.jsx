'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

// =========================================================================
// MODO BYPASS DE CONTINGENCIA LOCAL (FÁCIL DE DESACTIVAR O ELIMINAR)
// =========================================================================
// Cambia ENABLE_OFFLINE_BYPASS a `false` cuando recuperes el acceso 2FA de GitHub
// para volver a utilizar la autenticación real de Supabase Auth.
const ENABLE_OFFLINE_BYPASS = true;

const BYPASS_EMAIL = 'evaluador@cognimirror.com';
const BYPASS_PASSWORD = 'clinica2026';
const BYPASS_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  email: BYPASS_EMAIL,
  user_metadata: {
    full_name: 'Ps. Evaluador de Prueba'
  }
};
const BYPASS_SESSION = {
  user: BYPASS_USER,
  access_token: 'bypass-mock-token-1234567890',
  refresh_token: 'bypass-mock-token-1234567890'
};
// =========================================================================

const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener la sesión activa al inicializar
    const getInitialSession = async () => {
      try {
        if (ENABLE_OFFLINE_BYPASS) {
          const stored = localStorage.getItem('cognimirror_bypass_session');
          if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed.user);
            setLoading(false);
            return;
          }
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ?? null);
      } catch (e) {
        console.error('[AuthContext] Error obteniendo sesión inicial:', e.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 2. Suscribirse a cambios en el estado de autenticación (login, logout, token refrescado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (ENABLE_OFFLINE_BYPASS && localStorage.getItem('cognimirror_bypass_session')) {
        // Mantener la sesión de bypass activa
        const stored = localStorage.getItem('cognimirror_bypass_session');
        if (stored) {
          setUser(JSON.parse(stored).user);
          setLoading(false);
          return;
        }
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      if (ENABLE_OFFLINE_BYPASS) {
        // 1. Verificar la cuenta por defecto de evaluador
        if (email === BYPASS_EMAIL && password === BYPASS_PASSWORD) {
          localStorage.setItem('cognimirror_bypass_session', JSON.stringify(BYPASS_SESSION));
          setUser(BYPASS_USER);
          return { data: { user: BYPASS_USER, session: BYPASS_SESSION }, error: null };
        }

        // 2. Verificar si la cuenta fue creada localmente en este navegador o auto-crearla en bypass
        const storedUsers = localStorage.getItem('cognimirror_bypass_users');
        const users = storedUsers ? JSON.parse(storedUsers) : [];
        let found = users.find(u => u.email === email);
        
        // Si no existe, lo creamos para que no se quede atrapado
        if (!found) {
          found = {
            id: 'user-' + Math.random().toString(36).substr(2, 9),
            email,
            password,
            fullName: email.split('@')[0]
          };
          users.push(found);
          localStorage.setItem('cognimirror_bypass_users', JSON.stringify(users));
        }

        const matchedUser = {
          id: found.id,
          email: found.email,
          user_metadata: {
            full_name: found.fullName || found.email.split('@')[0]
          }
        };
        const session = {
          user: matchedUser,
          access_token: 'bypass-mock-token-' + found.id,
          refresh_token: 'bypass-mock-token-' + found.id
        };
        localStorage.setItem('cognimirror_bypass_session', JSON.stringify(session));
        setUser(matchedUser);
        return { data: { user: matchedUser, session }, error: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[AuthContext] Error al iniciar sesión:', error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, fullName) => {
    setLoading(true);
    try {
      if (ENABLE_OFFLINE_BYPASS) {
        if (email === BYPASS_EMAIL) {
          return { data: null, error: { message: 'Esta cuenta de prueba ya está registrada y lista para usarse localmente.' } };
        }

        const storedUsers = localStorage.getItem('cognimirror_bypass_users');
        const users = storedUsers ? JSON.parse(storedUsers) : [];
        
        // Comprobar si ya existe registrado localmente
        if (users.some(u => u.email === email)) {
          return { data: null, error: { message: 'El correo electrónico ingresado ya está registrado.' } };
        }

        // Crear y guardar el nuevo usuario de prueba
        const newUserId = 'user-' + Math.random().toString(36).substr(2, 9);
        const newUser = {
          id: newUserId,
          email,
          password,
          fullName
        };
        users.push(newUser);
        localStorage.setItem('cognimirror_bypass_users', JSON.stringify(users));

        const userObj = {
          id: newUserId,
          email,
          user_metadata: {
            full_name: fullName
          }
        };

        // Retornar indicando que no requiere confirmación por correo para agilizar localmente
        return { data: { user: userObj, session: null, isMock: true }, error: null };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[AuthContext] Error al registrar usuario:', error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (ENABLE_OFFLINE_BYPASS) {
        localStorage.removeItem('cognimirror_bypass_session');
      }
      setUser(null);
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // Ignorar si no hay sesión real de Supabase
      }
    } catch (error) {
      console.error('[AuthContext] Error al cerrar sesión:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
