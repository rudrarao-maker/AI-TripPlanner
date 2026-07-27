import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { LoginCredentials, RegisterData } from '../types';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const setCredentials = useAuthStore((state) => state.setCredentials);
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setCredentials(data.data.user, data.data.accessToken, data.data.refreshToken);
      toast.success('Logged in successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Login failed');
    }
  });
};

export const useRegister = () => {
  const setCredentials = useAuthStore((state) => state.setCredentials);

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      setCredentials(data.data.user, data.data.accessToken, data.data.refreshToken);
      toast.success('Registration successful!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Registration failed');
    }
  });
};
