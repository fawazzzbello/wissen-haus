'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { getCurrentUser } from '@/lib/api-client';

export function useAuth() {
  const { user, token, setUser, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already in store
    if (user && token) {
      setIsLoading(false);
      return;
    }

    // Try to fetch current user if we have a token
    if (token && !user) {
      getCurrentUser()
        .then((response) => {
          setUser(response.user);
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [token, user, setUser, logout]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    logout,
  };
}
