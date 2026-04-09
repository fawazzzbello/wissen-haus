import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from './store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let axiosInstance: AxiosInstance | null = null;

function getAxiosInstance(): AxiosInstance {
  if (!axiosInstance) {
    // If API_URL already includes /api, don't double it
    const baseURL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

    axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    axiosInstance.interceptors.request.use(
      (config) => {
        const { token } = useAuthStore.getState();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle 401 errors
    axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear auth state and redirect to login
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  return axiosInstance;
}

// Auth endpoints
export async function loginUser(email: string, password: string) {
  try {
    const response = await getAxiosInstance().post('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Login failed');
  }
}

export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role?: string
) {
  try {
    const response = await getAxiosInstance().post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
      role,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Registration failed');
  }
}

export async function getCurrentUser() {
  try {
    const response = await getAxiosInstance().get('/auth/me');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Failed to fetch user');
  }
}

export async function logoutUser() {
  try {
    await getAxiosInstance().post('/auth/logout');
  } catch (error: any) {
    console.error('Logout error:', error);
  }
}

export async function refreshToken(refreshToken: string) {
  try {
    const response = await getAxiosInstance().post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Token refresh failed');
  }
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
) {
  try {
    const response = await getAxiosInstance().post('/auth/change-password', {
      oldPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Password change failed');
  }
}

// Helper function to get axios instance for direct API calls
export function getApiClient(): AxiosInstance {
  return getAxiosInstance();
}
