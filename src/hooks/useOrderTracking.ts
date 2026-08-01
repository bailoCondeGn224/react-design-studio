import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { TrackingInfo } from '@/types/livreur';

export const useOrderTracking = (orderId: string) => {
  return useQuery<TrackingInfo | null>({
    queryKey: ['order-tracking', orderId],
    queryFn: () =>
      apiClient.get(`/public/orders/${orderId}/tracking`).then((res) => res.data),
    refetchInterval: 30000,
    enabled: !!orderId,
  });
};
