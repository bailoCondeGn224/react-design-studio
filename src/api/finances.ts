import { apiClient } from '@/lib/api-client';
import {
  Tresorerie,
  RecettesMois,
  DepensesMois,
  ChargeBreakdown,
  Transaction,
  RapportMensuel,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const financesApi = {
  getTresorerie: async (): Promise<Tresorerie> => {
    const response = await apiClient.get<Tresorerie>('/finances/tresorerie');
    return response.data;
  },

  getRecettesMois: async (): Promise<RecettesMois> => {
    const response = await apiClient.get<RecettesMois>('/finances/recettes-mois');
    return response.data;
  },

  getDepensesMois: async (): Promise<DepensesMois> => {
    const response = await apiClient.get<DepensesMois>('/finances/depenses-mois');
    return response.data;
  },

  getChargesBreakdown: async (): Promise<ChargeBreakdown[]> => {
    const response = await apiClient.get<ChargeBreakdown[]>('/finances/charges-breakdown');
    return response.data;
  },

  getTransactions: async (params?: PaginationParams): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<PaginatedResponse<Transaction>>('/finances/transactions', { params });
    return response.data;
  },

  getRapportMensuel: async (): Promise<RapportMensuel> => {
    const response = await apiClient.get<RapportMensuel>('/finances/rapport-mensuel');
    return response.data;
  },

  getStatsPeriode: async (debut: string, fin: string): Promise<any> => {
    const response = await apiClient.get(`/finances/stats-periode?debut=${debut}&fin=${fin}`);
    return response.data;
  },
};
