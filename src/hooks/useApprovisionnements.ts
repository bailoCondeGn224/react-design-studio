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

export const useApproLignes = (approId: string | null, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['approvisionnements', approId, 'lignes', page, limit],
    queryFn: () => approvisionnementsApi.getLignes(approId!, page, limit),
    enabled: !!approId,
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
      // Invalider TOUS les caches liés (exact: false force l'invalidation de toutes les sous-clés)
      queryClient.invalidateQueries({ queryKey: ['approvisionnements'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['stock'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['mouvements'], exact: false });

      // Forcer le refetch immédiat du stock
      queryClient.refetchQueries({ queryKey: ['stock'] });

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
      queryClient.invalidateQueries({ queryKey: ['approvisionnements'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['stock'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['mouvements'], exact: false });

      queryClient.refetchQueries({ queryKey: ['stock'] });

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
      queryClient.invalidateQueries({ queryKey: ['approvisionnements'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['stock'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['mouvements'], exact: false });

      queryClient.refetchQueries({ queryKey: ['stock'] });

      toast.success('Approvisionnement supprimé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};
