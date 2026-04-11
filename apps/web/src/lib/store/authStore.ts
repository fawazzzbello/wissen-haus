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
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  setHydrated: (hydrated: boolean) => void;
}

const initialState = {
  user: null,
  token: null,
  isHydrated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      setToken: (token) => set({ token }),

      logout: () => set({ user: null, token: null }),

      isAuthenticated: () => {
        const { user, token } = get();
        return !!user && !!token;
      },

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'auth-store',
      onRehydrateStorage: () => (state) => {
        // Mark as hydrated after loading from storage
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);
