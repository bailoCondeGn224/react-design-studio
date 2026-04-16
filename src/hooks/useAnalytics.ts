import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';

export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsApi.getDashboard,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
