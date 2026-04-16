import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fournisseursApi } from '@/api/fournisseurs';
import { CreateFournisseurDto, PaginationParams } from '@/types';
import { toast } from 'sonner';

export const useFournisseurs = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['fournisseurs', params],
    queryFn: () => fournisseursApi.getAll(params),
  });
};

export const useFournisseurDetails = (id: string | null) => {
  return useQuery({
    queryKey: ['fournisseurs', id, 'details'],
    queryFn: () => fournisseursApi.getDetails(id!),
    enabled: !!id, // Ne charge que si id existe
  });
};

export const useStatsFournisseurs = () => {
  return useQuery({
    queryKey: ['fournisseurs', 'stats'],
    queryFn: fournisseursApi.getStats,
  });
};

export const useCreateFournisseur = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFournisseurDto) => fournisseursApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] });
      toast.success('Fournisseur ajouté');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout');
    },
  });
};

export const useUpdateFournisseur = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFournisseurDto> }) =>
      fournisseursApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] });
      toast.success('Fournisseur mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useDeleteFournisseur = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fournisseursApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] });
      toast.success('Fournisseur supprimé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};
