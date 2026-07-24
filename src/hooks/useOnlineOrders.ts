// src/hooks/useOnlineOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onlineOrdersApi } from '@/api/online-orders';
import { CreateOnlineOrderDto, OnlineOrderFilterParams } from '@/types';
import { toast } from 'sonner';

// Client hooks
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOnlineOrderDto) => onlineOrdersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      toast.success('Commande envoyée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la commande');
    },
  });
};

export const useCustomerOrders = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['customer-orders', params],
    queryFn: () => onlineOrdersApi.getMyOrders(params),
    placeholderData: (prev) => prev,
  });
};

export const useCustomerOrder = (id: string) => {
  return useQuery({
    queryKey: ['customer-order', id],
    queryFn: () => onlineOrdersApi.getMyOrder(id),
    enabled: !!id,
  });
};

// Back-office hooks
export const useOnlineOrders = (params?: OnlineOrderFilterParams) => {
  return useQuery({
    queryKey: ['online-orders', params],
    queryFn: () => onlineOrdersApi.getAll(params),
    placeholderData: (prev) => prev,
  });
};

export const useOnlineOrder = (id: string) => {
  return useQuery({
    queryKey: ['online-order', id],
    queryFn: () => onlineOrdersApi.getById(id),
    enabled: !!id,
  });
};

export const useConfirmOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => onlineOrdersApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-orders'] });
      queryClient.invalidateQueries({ queryKey: ['online-orders-stats'] });
      toast.success('Commande confirmée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur');
    },
  });
};

export const useMarkOrderReady = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => onlineOrdersApi.markReady(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-orders'] });
      queryClient.invalidateQueries({ queryKey: ['online-orders-stats'] });
      toast.success('Commande marquée prête');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur');
    },
  });
};

export const useMarkOrderDelivered = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => onlineOrdersApi.markDelivered(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-orders'] });
      queryClient.invalidateQueries({ queryKey: ['online-orders-stats'] });
      toast.success('Commande livrée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur');
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) => onlineOrdersApi.cancel(id, motif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-orders'] });
      queryClient.invalidateQueries({ queryKey: ['online-orders-stats'] });
      toast.success('Commande annulée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur');
    },
  });
};

export const useOnlineOrderStats = () => {
  return useQuery({
    queryKey: ['online-orders-stats'],
    queryFn: () => onlineOrdersApi.getStats(),
  });
};

export const usePendingOrderCount = () => {
  // Ne pas appeler si pas de token (page login)
  const hasToken = !!localStorage.getItem('access_token');

  return useQuery({
    queryKey: ['online-orders-pending-count'],
    queryFn: () => onlineOrdersApi.getPendingCount(),
    refetchInterval: hasToken ? 30000 : false,
    enabled: hasToken,
  });
};
