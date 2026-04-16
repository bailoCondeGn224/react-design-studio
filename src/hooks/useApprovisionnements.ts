import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approvisionnementsApi } from '@/api/approvisionnements';
import { CreateApprovisionnementDto, PaginationParams } from '@/types';
import { toast } from 'sonner';

export const useApprovisionnements = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['approvisionnements', params],
    queryFn: () => approvisionnementsApi.getAll(params),
  });
};

export const useApprovisionnement = (id: string) => {
  return useQuery({
    queryKey: ['approvisionnements', id],
    queryFn: () => approvisionnementsApi.getById(id),
    enabled: !!id,
  });
};

export const useApprovisionnementsStats = () => {
  return useQuery({
    queryKey: ['approvisionnements', 'stats'],
    queryFn: approvisionnementsApi.getStats,
  });
};

export const useApprovisionnementsByFournisseur = (fournisseurId: string) => {
  return useQuery({
    queryKey: ['approvisionnements', 'fournisseur', fournisseurId],
    queryFn: () => approvisionnementsApi.getByFournisseur(fournisseurId),
    enabled: !!fournisseurId,
  });
};

export const useCreateApprovisionnement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApprovisionnementDto) => approvisionnementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvisionnements'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] });
      toast.success('Approvisionnement enregistré - Stock mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    },
  });
};

export const useUpdateApprovisionnement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateApprovisionnementDto> }) =>
      approvisionnementsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvisionnements'] });
      toast.success('Approvisionnement mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useDeleteApprovisionnement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approvisionnementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvisionnements'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      toast.success('Approvisionnement annulé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
    },
  });
};
