// src/contexts/CustomerAuthContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CustomerAccount, RegisterCustomerDto, LoginCustomerDto, UpdateCustomerDto } from '@/types';
import { customerAuthApi } from '@/api/customer-auth';

interface CustomerAuthContextType {
  customer: CustomerAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginCustomerDto) => Promise<void>;
  register: (data: RegisterCustomerDto) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateCustomerDto) => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TOKEN: 'customer_token',
  CUSTOMER: 'customer_data',
};

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<CustomerAccount | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!customer && !!localStorage.getItem(STORAGE_KEYS.TOKEN);

  useEffect(() => {
    if (customer) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(customer));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOMER);
    }
  }, [customer]);

  const login = async (data: LoginCustomerDto) => {
    setIsLoading(true);
    try {
      const response = await customerAuthApi.login(data);
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token);
      setCustomer(response.customer);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterCustomerDto) => {
    setIsLoading(true);
    try {
      const response = await customerAuthApi.register(data);
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token);
      setCustomer(response.customer);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER);
    setCustomer(null);
  };

  const updateProfile = async (data: UpdateCustomerDto) => {
    const updated = await customerAuthApi.updateProfile(data);
    setCustomer(updated);
  };

  return (
    <CustomerAuthContext.Provider
      value={{ customer, isAuthenticated, isLoading, login, register, logout, updateProfile }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
};
