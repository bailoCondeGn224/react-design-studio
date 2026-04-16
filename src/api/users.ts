import { apiClient } from '@/lib/api-client';
import { User, CreateUserDto, UpdateUserDto, PaginatedResponse, UserFilterParams } from '@/types';

export const usersApi = {
  getAll: async (params?: UserFilterParams): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  assignRole: async (userId: string, roleId: string): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${userId}/assign-role`, { roleId });
    return response.data;
  },
};
