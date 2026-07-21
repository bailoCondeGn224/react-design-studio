// src/api/customer-auth.ts
import { apiClient } from '@/lib/api-client';
import { CustomerAccount, RegisterCustomerDto, LoginCustomerDto, UpdateCustomerDto } from '@/types';

// Client API avec token client séparé
const getCustomerToken = () => localStorage.getItem('customer_token');

const customerApiClient = {
  get: async <T>(url: string) => {
    const token = getCustomerToken();
    return apiClient.get<T>(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  patch: async <T>(url: string, data: unknown) => {
    const token = getCustomerToken();
    return apiClient.patch<T>(url, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};

export const customerAuthApi = {
  register: async (data: RegisterCustomerDto): Promise<{ access_token: string; customer: CustomerAccount }> => {
    const response = await apiClient.post('/public/customer/auth/register', data);
    return response.data;
  },

  login: async (data: LoginCustomerDto): Promise<{ access_token: string; customer: CustomerAccount }> => {
    const response = await apiClient.post('/public/customer/auth/login', data);
    return response.data;
  },

  getProfile: async (): Promise<CustomerAccount> => {
    const response = await customerApiClient.get<CustomerAccount>('/public/customer/auth/me');
    return response.data;
  },

  updateProfile: async (data: UpdateCustomerDto): Promise<CustomerAccount> => {
    const response = await customerApiClient.patch<CustomerAccount>('/public/customer/auth/me', data);
    return response.data;
  },
};
