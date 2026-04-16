import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { versementsApi } from '@/api/versements';
import { CreateVersementDto, PaginationParams } from '@/types';
import { toast } from 'sonner';

export const useVersements = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['versements', params],
    queryFn: () => versementsApi.getAll(params),
  });
};

export const useVersement = (id: string) => {
  return useQuery({
    queryKey: ['versements', id],
    queryFn: () => versementsApi.getById(id),
    enabled: !!id,
  });
};

export const useMontantsMois = () => {
  return useQuery({
    queryKey: ['versements', 'montants-mois'],
    queryFn: versementsApi.getMontantsMois,
  });
};

export const useCreateVersement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVersementDto) => versementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versements'] });
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] });
      toast.success('Versement enregistré');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    },
  });
};

export const useUpdateVersement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVersementDto> }) =>
      versementsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versements'] });
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] });
      toast.success('Versement modifié');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    },
  });
};

export const useDeleteVersement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => versementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versements'] });
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] });
      toast.success('Versement annulé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
    },
  });
};
