import { apiClient } from '@/lib/api-client';
import { DashboardAnalytics } from '@/types';

export const analyticsApi = {
  getDashboard: async (): Promise<DashboardAnalytics> => {
    const response = await apiClient.get<DashboardAnalytics>('/analytics/dashboard');
    return response.data;
  },
};
