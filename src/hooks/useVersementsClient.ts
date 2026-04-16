import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { versementsClientApi } from '@/api/versements-client';
import { CreateVersementClientDto, VersementClientFilterParams } from '@/types';
import { toast } from 'sonner';

export const useVersementsClient = (params?: VersementClientFilterParams) => {
  return useQuery({
    queryKey: ['versements-client', params],
    queryFn: () => versementsClientApi.getAll(params),
  });
};

export const useVersementClient = (id: string) => {
  return useQuery({
    queryKey: ['versements-client', id],
    queryFn: () => versementsClientApi.getById(id),
    enabled: !!id,
  });
};

export const useVersementsClientByClient = (clientId: string) => {
  return useQuery({
    queryKey: ['versements-client', 'client', clientId],
    queryFn: () => versementsClientApi.getByClient(clientId),
    enabled: !!clientId,
  });
};

export const useCreateVersementClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVersementClientDto) => versementsClientApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versements-client'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['ventes'] });
      toast.success('Paiement enregistré avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement du paiement');
    },
  });
};

export const useUpdateVersementClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVersementClientDto> }) =>
      versementsClientApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versements-client'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['ventes'] });
      toast.success('Paiement modifié');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    },
  });
};

export const useDeleteVersementClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => versementsClientApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versements-client'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['ventes'] });
      toast.success('Paiement annulé - dette restaurée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
    },
  });
};
