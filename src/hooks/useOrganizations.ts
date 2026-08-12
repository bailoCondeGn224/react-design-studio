import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  toggleOrganizationStatus,
  getPendingOrganizations,
  approveOrganization,
  rejectOrganization,
  suspendOrganization,
  reactivateOrganization,
  updateMyOrganizationPosition,
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

/** Position de sa propre boutique, modifiable par son admin. */
export const useUpdateMyOrganizationPosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyOrganizationPosition,
    onSuccess: () => {
      // La vitrine expose la position en lecture: elle doit se rafraîchir aussi
      queryClient.invalidateQueries({ queryKey: ['storefront-config'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Position de la boutique enregistrée');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          'Erreur lors de l’enregistrement de la position',
      );
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

export const usePendingOrganizations = () => {
  return useQuery({
    queryKey: ['organizations', 'pending'],
    queryFn: getPendingOrganizations,
  });
};

export const useApproveOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveOrganization(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-organizations'] });
      toast.success(data.message || 'Organisation approuvée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'approbation");
    },
  });
};

export const useRejectOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) =>
      rejectOrganization(id, motif),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-organizations'] });
      toast.success(data.message || 'Organisation rejetée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du rejet');
    },
  });
};

export const useSuspendOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) =>
      suspendOrganization(id, motif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-organizations'] });
      toast.success('Organisation suspendue');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suspension');
    },
  });
};

export const useReactivateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reactivateOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-organizations'] });
      toast.success('Organisation réactivée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la réactivation');
    },
  });
};
