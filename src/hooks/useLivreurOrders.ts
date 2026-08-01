import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { livreurApiClient } from '@/lib/livreur-api-client';
import { OnlineOrder } from '@/types';
import { toast } from 'sonner';

export const useLivreurOrders = () => {
  return useQuery<OnlineOrder[]>({
    queryKey: ['livreur-orders'],
    queryFn: () =>
      livreurApiClient.get('/public/livreur/orders').then((res) => res.data),
    refetchInterval: 30000,
  });
};

export const useMarkDelivered = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      livreurApiClient.put(`/public/livreur/orders/${orderId}/deliver`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livreur-orders'] });
      toast.success('Commande livrée');
    },
    onError: () => toast.error('Erreur'),
  });
};

export const useUpdateLivreurPosition = () => {
  return useMutation({
    mutationFn: (position: { latitude: number; longitude: number }) =>
      livreurApiClient.put('/public/livreur/position', position),
  });
};
