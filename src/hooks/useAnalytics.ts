import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';
import type { QueryToggle } from '@/types';

export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsApi.getDashboard,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useVentesSemaine = (options: QueryToggle = {}) => {
  return useQuery({
    enabled: options.enabled ?? true,
    queryKey: ['analytics', 'ventes-semaine'],
    queryFn: analyticsApi.getVentesSemaine,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useRevenusMois = (options: QueryToggle = {}) => {
  return useQuery({
    enabled: options.enabled ?? true,
    queryKey: ['analytics', 'revenus-mois'],
    queryFn: analyticsApi.getRevenusMois,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
