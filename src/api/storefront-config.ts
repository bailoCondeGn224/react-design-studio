// src/api/storefront-config.ts
import { apiClient } from '@/lib/api-client';

export interface StorefrontConfig {
  id: string;
  organizationId: string;
  slug: string;
  isActive: boolean;
  description?: string;
  logoUrl?: string;
  whatsappNumber?: string;
  horaires?: string;
  fraisLivraison: number;
  adresse?: string;
  /**
   * Position de la boutique, point de départ des livraisons.
   * En lecture seule ici: elle est portée par l'organisation et se modifie
   * via les paramètres de l'organisation.
   */
  latitude?: number;
  longitude?: number;
  organizationNom: string;
  fullUrl: string;
}

export interface UpdateStorefrontConfigDto {
  isActive?: boolean;
  description?: string;
  whatsappNumber?: string;
  horaires?: string;
  fraisLivraison?: number;
  adresse?: string;
}

export const storefrontConfigApi = {
  get: async (): Promise<StorefrontConfig> => {
    const response = await apiClient.get<StorefrontConfig>('/storefront');
    return response.data;
  },

  update: async (data: UpdateStorefrontConfigDto): Promise<StorefrontConfig> => {
    const response = await apiClient.put<StorefrontConfig>('/storefront', data);
    return response.data;
  },

  getQrCodeUrl: (): string => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/storefront/qrcode`;
  },
};
