import api from './api';
import { getTabToken, setTabToken } from './tabSession';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, GetCurrentUserResponse, GetUsersResponse } from '../types';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    if (response.data.success) {
      if (!response.data.data.token) {
        throw new Error('Server belum mendukung sesi per tab. Silakan coba lagi setelah deployment selesai.');
      }
      setTabToken(response.data.data.token);
    }
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  changePassword: async (data: { old_password: string; new_password: string }): Promise<{ success: boolean; message: string }> => {
    const response = await api.put<{ success: boolean; message: string }>('/auth/change-password', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<GetCurrentUserResponse> => {
    if (!getTabToken()) throw new Error('Tab ini belum login');
    const response = await api.get<GetCurrentUserResponse>('/auth/me');
    return response.data;
  },

  getAllUsers: async (): Promise<GetUsersResponse> => {
    const response = await api.get<GetUsersResponse>('/user');
    return response.data;
  },
  
  deleteUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/user/${userId}`);
    return response.data;
  },
};
