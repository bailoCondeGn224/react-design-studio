import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { livreurApi } from '@/api/livreur';
import { OnlineOrder } from '@/types';
import { UpdateLivreurPositionResponse } from '@/types/livreur';
import { toast } from 'sonner';

export const useLivreurOrders = () => {
  return useQuery<OnlineOrder[]>({
    queryKey: ['livreur-orders'],
    queryFn: () => livreurApi.getOrders(),
    refetchInterval: 30000,
  });
};

export const useMarkDelivered = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => livreurApi.markDelivered(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livreur-orders'] });
      toast.success('Commande livrée');
    },
    onError: () => toast.error('Erreur'),
  });
};

export const useUpdateLivreurPosition = () => {
  return useMutation<UpdateLivreurPositionResponse, unknown, { latitude: number; longitude: number }>({
    mutationFn: (position) => livreurApi.updatePosition(position),
  });
};
