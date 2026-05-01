import { apiClient } from '@/lib/api-client';
import {
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

// Obtenir toutes les organizations (SUPER_ADMIN only)
export const getAllOrganizations = async (
  params?: PaginationParams
): Promise<Organization[]> => {
  const response = await apiClient.get<Organization[]>('/organizations', { params });
  return response.data;
};

// Obtenir une organization par ID
export const getOrganizationById = async (id: string): Promise<Organization> => {
  const response = await apiClient.get<Organization>(`/organizations/${id}`);
  return response.data;
};

// Créer une nouvelle organization (SUPER_ADMIN only)
export const createOrganization = async (
  data: CreateOrganizationDto
): Promise<Organization> => {
  const response = await apiClient.post<Organization>('/organizations', data);
  return response.data;
};

// Mettre à jour une organization (SUPER_ADMIN only)
export const updateOrganization = async (
  id: string,
  data: UpdateOrganizationDto
): Promise<Organization> => {
  const response = await apiClient.patch<Organization>(`/organizations/${id}`, data);
  return response.data;
};

// Supprimer une organization (SUPER_ADMIN only)
export const deleteOrganization = async (id: string): Promise<void> => {
  await apiClient.delete(`/organizations/${id}`);
};

// Activer/Désactiver une organization (SUPER_ADMIN only)
export const toggleOrganizationStatus = async (
  id: string,
  actif: boolean
): Promise<Organization> => {
  const response = await apiClient.patch<Organization>(`/organizations/${id}`, { actif });
  return response.data;
};
