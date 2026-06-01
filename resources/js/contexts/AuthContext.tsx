import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

type User = {
  id: number;
  name: string;
  email: string;
  registration_status: string;
  roll_number?: string;
  department?: string;
  batch?: number;
  gender?: string;
  phone?: string;
  roles?: string[];
};

type AuthContextType = {
  user: User | null;
  roles: string[];
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User, roles: string[]) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await api.get('/api/auth/user');
      setUser(response.data.user);
      setRoles(response.data.roles);
      setPermissions(response.data.permissions);
    } catch (error) {
      setUser(null);
      setRoles([]);
      setPermissions([]);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }

    const handleUnauthorized = () => {
      setUser(null);
      setRoles([]);
      setPermissions([]);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = (token: string, user: User, roles: string[]) => {
    localStorage.setItem('auth_token', token);
    setUser(user);
    setRoles(roles);
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setRoles([]);
      setPermissions([]);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        permissions,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
