import { apiClient } from '@/lib/api-client';
import {
  GlobalStats,
  OrganizationsByPlan,
  GrowthStats,
  OrganizationDetails,
  RecentActivity,
  Organization,
} from '@/types';

// Obtenir les statistiques globales de la plateforme (SUPER_ADMIN only)
export const getGlobalStats = async (): Promise<GlobalStats> => {
  const response = await apiClient.get<GlobalStats>('/admin-dashboard/stats/global');
  return response.data;
};

// Obtenir toutes les organizations (SUPER_ADMIN only)
export const getAllOrganizationsAdmin = async (): Promise<Organization[]> => {
  const response = await apiClient.get<Organization[]>('/admin-dashboard/organizations');
  return response.data;
};

// Obtenir les détails d'une organization avec statistiques (SUPER_ADMIN only)
export const getOrganizationDetails = async (
  id: string
): Promise<OrganizationDetails> => {
  const response = await apiClient.get<OrganizationDetails>(
    `/admin-dashboard/organizations/${id}`
  );
  return response.data;
};

// Obtenir la répartition des organizations par plan (SUPER_ADMIN only)
export const getOrganizationsByPlan = async (): Promise<OrganizationsByPlan[]> => {
  const response = await apiClient.get<OrganizationsByPlan[]>(
    '/admin-dashboard/stats/by-plan'
  );
  return response.data;
};

// Obtenir l'activité récente (nouvelles orgs et utilisateurs) (SUPER_ADMIN only)
export const getRecentActivity = async (): Promise<RecentActivity> => {
  const response = await apiClient.get<RecentActivity>(
    '/admin-dashboard/activity/recent'
  );
  return response.data;
};

// Obtenir les statistiques de croissance (SUPER_ADMIN only)
export const getGrowthStats = async (): Promise<GrowthStats> => {
  const response = await apiClient.get<GrowthStats>('/admin-dashboard/stats/growth');
  return response.data;
};
