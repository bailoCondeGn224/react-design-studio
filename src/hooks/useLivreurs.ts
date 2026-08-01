import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Livreur, CreateLivreurDto, UpdateLivreurDto } from '@/types/livreur';
import { toast } from 'sonner';

export const useLivreurs = () => {
  return useQuery<Livreur[]>({
    queryKey: ['livreurs'],
    queryFn: () => apiClient.get('/livreurs').then((res) => res.data),
  });
};

export const useCreateLivreur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLivreurDto) => apiClient.post('/livreurs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livreurs'] });
      toast.success('Livreur créé');
    },
    onError: () => toast.error('Erreur lors de la création'),
  });
};

export const useUpdateLivreur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLivreurDto }) =>
      apiClient.put(`/livreurs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livreurs'] });
      toast.success('Livreur modifié');
    },
    onError: () => toast.error('Erreur lors de la modification'),
  });
};

export const useDeleteLivreur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/livreurs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livreurs'] });
      toast.success('Livreur supprimé');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });
};

export const useDispatchOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      livreurId,
    }: {
      orderId: string;
      livreurId: string;
    }) => apiClient.put(`/online-orders/${orderId}/dispatch/${livreurId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-orders'] });
      toast.success('Commande assignée au livreur');
    },
    onError: () => toast.error("Erreur lors de l'assignation"),
  });
};
