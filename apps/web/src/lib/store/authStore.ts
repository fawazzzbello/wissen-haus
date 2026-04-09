import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'editor';
  status: 'active' | 'inactive' | 'suspended';
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setUser: (user) => set({ user }),

      setToken: (token) => set({ token }),

      logout: () => set({ user: null, token: null }),

      isAuthenticated: () => {
        const { user, token } = get();
        return !!user && !!token;
      },
    }),
    {
      name: 'auth-store',
    }
  )
);
