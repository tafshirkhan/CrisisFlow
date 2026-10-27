
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import axios from 'axios';
import { getCurrentUser } from '../api/authApi';
import type { AuthUser } from '../types/auth.types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'crisisflow_access_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    const token = sessionStorage.getItem(TOKEN_KEY);

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const currentUser = await getCurrentUser(token);
      setUser(currentUser);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
        setUser(null);
        return;
      }

      // Preserve the token if the API is temporarily unavailable.
      throw error;
    }
  }

  
useEffect(() => {
  let cancelled = false;

  async function initialiseAuth() {
    try {
      await refreshUser();
    } catch (error) {
      if (!cancelled) {
        console.error('Unable to restore session:', error);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void initialiseAuth();

  return () => {
    cancelled = true;
  };
}, []);


  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: user !== null,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider.');
  }

  return context;
}

// AuthProvider manages authentication state across the application.
// refreshUser() calls the backend's /me endpoint to retrieve the current user.
// logout() clears the current session.
// useAuth() lets components access the user and authentication methods.