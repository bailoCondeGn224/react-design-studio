// src/api/customer-auth.ts
import { apiClient } from '@/lib/api-client';

export interface RegisterCustomerDto {
  nom: string;
  telephone: string;
  email?: string;
  password: string;
}

export interface LoginCustomerDto {
  telephone: string;
  password: string;
}

export interface UpdateCustomerDto {
  nom?: string;
  telephone?: string;
  email?: string;
}

export interface CustomerAccount {
  id: string;
  nom: string;
  telephone: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  customer: CustomerAccount;
}

export const customerAuthApi = {
  register: (data: RegisterCustomerDto): Promise<AuthResponse> =>
    apiClient.post('/public/auth/register', data).then(res => res.data),

  login: (data: LoginCustomerDto): Promise<AuthResponse> =>
    apiClient.post('/public/auth/login', data).then(res => res.data),

  getProfile: (): Promise<CustomerAccount> =>
    apiClient.get('/public/auth/me').then(res => res.data),

  updateProfile: (data: UpdateCustomerDto): Promise<CustomerAccount> =>
    apiClient.put('/public/auth/profile', data).then(res => res.data),
};
