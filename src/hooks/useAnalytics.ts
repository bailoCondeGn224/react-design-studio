import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';

export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsApi.getDashboard,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useVentesSemaine = () => {
  return useQuery({
    queryKey: ['analytics', 'ventes-semaine'],
    queryFn: analyticsApi.getVentesSemaine,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useRevenusMois = () => {
  return useQuery({
    queryKey: ['analytics', 'revenus-mois'],
    queryFn: analyticsApi.getRevenusMois,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
