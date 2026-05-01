import { apiClient } from '@/lib/api-client';
import { Plan, CreatePlanDto, UpdatePlanDto, PaginatedResponse } from '@/types';

// Obtenir tous les plans (SUPER_ADMIN only)
export const getAllPlans = async (): Promise<Plan[]> => {
  const response = await apiClient.get<Plan[]>('/plans');
  return response.data;
};

// Obtenir un plan par ID
export const getPlanById = async (id: string): Promise<Plan> => {
  const response = await apiClient.get<Plan>(`/plans/${id}`);
  return response.data;
};

// Créer un nouveau plan (SUPER_ADMIN only)
export const createPlan = async (data: CreatePlanDto): Promise<Plan> => {
  const response = await apiClient.post<Plan>('/plans', data);
  return response.data;
};

// Mettre à jour un plan (SUPER_ADMIN only)
export const updatePlan = async (id: string, data: UpdatePlanDto): Promise<Plan> => {
  const response = await apiClient.patch<Plan>(`/plans/${id}`, data);
  return response.data;
};

// Supprimer un plan (SUPER_ADMIN only)
export const deletePlan = async (id: string): Promise<void> => {
  await apiClient.delete(`/plans/${id}`);
};
