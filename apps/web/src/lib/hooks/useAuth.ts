'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { getCurrentUser } from '@/lib/api-client';

export function useAuth() {
  const { user, token, setUser, logout, isHydrated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for store to be hydrated from localStorage
    if (!isHydrated) {
      return;
    }

    const initializeAuth = async () => {
      try {
        // Check if user is already in store
        if (user && token) {
          setIsLoading(false);
          return;
        }

        // Try to fetch current user if we have a token
        if (token && !user) {
          const response = await getCurrentUser();
          if (response.user) {
            setUser(response.user);
          } else {
            logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isHydrated, token, user, setUser, logout]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    logout,
  };
}
