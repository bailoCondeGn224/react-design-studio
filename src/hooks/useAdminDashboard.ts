import { useQuery } from '@tanstack/react-query';
import {
  getGlobalStats,
  getAllOrganizationsAdmin,
  getOrganizationDetails,
  getOrganizationsByPlan,
  getRecentActivity,
  getGrowthStats,
} from '@/api/admin-dashboard';

export const useGlobalStats = () => {
  return useQuery({
    queryKey: ['admin-global-stats'],
    queryFn: getGlobalStats,
  });
};

export const useAllOrganizationsAdmin = () => {
  return useQuery({
    queryKey: ['admin-all-organizations'],
    queryFn: getAllOrganizationsAdmin,
  });
};

export const useOrganizationDetails = (id: string) => {
  return useQuery({
    queryKey: ['admin-organization-details', id],
    queryFn: () => getOrganizationDetails(id),
    enabled: !!id,
  });
};

export const useOrganizationsByPlan = () => {
  return useQuery({
    queryKey: ['admin-organizations-by-plan'],
    queryFn: getOrganizationsByPlan,
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: getRecentActivity,
  });
};

export const useGrowthStats = () => {
  return useQuery({
    queryKey: ['admin-growth-stats'],
    queryFn: getGrowthStats,
  });
};
