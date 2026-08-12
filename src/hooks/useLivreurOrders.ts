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

/** Commande pour laquelle le serveur vient de détecter l'arrivée du livreur. */
export interface ArriveeSignalee {
  orderId: string;
  numero: string;
  adresseLivraison?: string;
}

interface UpdatePositionResponse {
  ok: boolean;
  arrivees: ArriveeSignalee[];
}

export const useUpdateLivreurPosition = () => {
  return useMutation<UpdatePositionResponse, unknown, { latitude: number; longitude: number }>({
    mutationFn: (position) =>
      livreurApiClient
        .put<UpdatePositionResponse>('/public/livreur/position', position)
        .then((res) => res.data),
  });
};
