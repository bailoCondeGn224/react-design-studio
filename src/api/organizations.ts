import { apiClient } from '@/lib/api-client';
import axios from 'axios';
import {
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  RegisterOrganizationDto,
  RegisterOrganizationResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

// URL de base de l'API (pour les endpoints publics)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

// ==================== ENDPOINTS PUBLICS ====================

// Inscription d'une nouvelle organisation (PUBLIC - pas besoin d'auth)
export const registerOrganization = async (
  data: RegisterOrganizationDto
): Promise<RegisterOrganizationResponse> => {
  const response = await axios.post<RegisterOrganizationResponse>(
    `${API_BASE_URL}/organizations/register`,
    data
  );
  return response.data;
};

// ==================== ENDPOINTS SUPER_ADMIN ====================

// Obtenir les organisations en attente d'approbation
export const getPendingOrganizations = async (): Promise<Organization[]> => {
  const response = await apiClient.get<Organization[]>('/organizations/pending');
  return response.data;
};

// Approuver une organisation
export const approveOrganization = async (
  id: string
): Promise<{ organization: Organization; message: string }> => {
  const response = await apiClient.patch<{ organization: Organization; message: string }>(
    `/organizations/${id}/approve`
  );
  return response.data;
};

// Rejeter une organisation
export const rejectOrganization = async (
  id: string,
  motif: string
): Promise<{ organization: Organization; message: string }> => {
  const response = await apiClient.patch<{ organization: Organization; message: string }>(
    `/organizations/${id}/reject`,
    { motif }
  );
  return response.data;
};

// Suspendre une organisation
export const suspendOrganization = async (
  id: string,
  motif: string
): Promise<Organization> => {
  const response = await apiClient.patch<Organization>(
    `/organizations/${id}/suspend`,
    { motif }
  );
  return response.data;
};

// Réactiver une organisation suspendue
export const reactivateOrganization = async (id: string): Promise<Organization> => {
  const response = await apiClient.patch<Organization>(`/organizations/${id}/reactivate`);
  return response.data;
};
