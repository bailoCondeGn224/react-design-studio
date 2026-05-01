import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  toggleOrganizationStatus,
} from '@/api/organizations';
import { CreateOrganizationDto, UpdateOrganizationDto } from '@/types';
import { toast } from 'sonner';

export const useOrganizations = () => {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: getAllOrganizations,
  });
};

export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: () => getOrganizationById(id),
    enabled: !!id,
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationDto) => createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-organizations'] });
      toast.success('Organization ajoutée avec succès');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de l'ajout de l'organization"
      );
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationDto }) =>
      updateOrganization(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-organizations'] });
      toast.success('Organization mise à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-organizations'] });
      toast.success('Organization supprimée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};

export const useToggleOrganizationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, actif }: { id: string; actif: boolean }) =>
      toggleOrganizationStatus(id, actif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-organizations'] });
      toast.success('Statut mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    },
  });
};
