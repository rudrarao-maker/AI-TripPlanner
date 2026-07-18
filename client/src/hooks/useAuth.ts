import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { LoginCredentials, RegisterData } from '../types';
import { useUserStore } from '../store/userStore';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const setUser = useUserStore((state) => state.setUser);
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      setUser(data.data.user);
      toast.success('Logged in successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Login failed');
    }
  });
};

export const useRegister = () => {
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      setUser(data.data.user);
      toast.success('Registration successful!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Registration failed');
    }
  });
};
