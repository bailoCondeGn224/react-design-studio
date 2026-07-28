// src/api/customer-auth.ts
import { apiClient } from '@/lib/api-client';
import {
  CustomerAccount,
  RegisterCustomerDto,
  LoginCustomerDto,
  UpdateCustomerDto,
} from '@/types/customer';

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
