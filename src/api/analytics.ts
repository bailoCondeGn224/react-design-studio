import { apiClient } from '@/lib/api-client';
import { DashboardAnalytics } from '@/types';

export interface VenteJourData {
  name: string;
  ventes: number;
  total: number;
  date: string;
}

export interface RevenuMoisData {
  name: string;
  montant: number;
  mois: number;
  annee: number;
}

export const analyticsApi = {
  getDashboard: async (): Promise<DashboardAnalytics> => {
    const response = await apiClient.get<DashboardAnalytics>('/analytics/dashboard');
    return response.data;
  },

  getVentesSemaine: async (): Promise<VenteJourData[]> => {
    const response = await apiClient.get<VenteJourData[]>('/analytics/ventes-semaine');
    return response.data;
  },

  getRevenusMois: async (): Promise<RevenuMoisData[]> => {
    const response = await apiClient.get<RevenuMoisData[]>('/analytics/revenus-mois');
    return response.data;
  },
};
