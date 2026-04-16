import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '@/api/clients';
import { CreateClientDto, ClientFilterParams, ClientHistoriqueParams } from '@/types';
import { toast } from 'sonner';

export const useClients = (params?: ClientFilterParams) => {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => clientsApi.getAll(params),
  });
};

export const useClient = (id: string) => {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsApi.getById(id),
    enabled: !!id,
  });
};

export const useClientsCredits = () => {
  return useQuery({
    queryKey: ['clients', 'credits'],
    queryFn: clientsApi.getCredits,
  });
};

export const useTopClients = (limit: number = 10) => {
  return useQuery({
    queryKey: ['clients', 'top', limit],
    queryFn: () => clientsApi.getTop(limit),
  });
};

export const useStatsClients = () => {
  return useQuery({
    queryKey: ['clients', 'stats'],
    queryFn: clientsApi.getStats,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientDto) => clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client ajouté avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du client');
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientDto> }) =>
      clientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client supprimé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};

export const useClientHistorique = (id: string, params?: ClientHistoriqueParams) => {
  return useQuery({
    queryKey: ['clients', id, 'historique', params],
    queryFn: () => clientsApi.getHistorique(id, params),
    enabled: !!id,
  });
};
