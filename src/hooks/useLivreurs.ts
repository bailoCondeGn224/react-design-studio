// src/hooks/useLivreurs.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Livreur, CreateLivreurDto, UpdateLivreurDto } from '@/types';
import { toast } from 'sonner';

// ========== Backoffice Hooks ==========

export const useLivreurs = () => {
  return useQuery({
    queryKey: ['livreurs'],
    queryFn: async () => {
      const { data } = await api.get<Livreur[]>('/livreurs');
      return data;
    },
  });
};

export const useActiveLivreurs = () => {
  return useQuery({
    queryKey: ['livreurs', 'active'],
    queryFn: async () => {
      const { data } = await api.get<Livreur[]>('/livreurs/active');
      return data;
    },
  });
};

export const useLivreur = (id: string) => {
  return useQuery({
    queryKey: ['livreurs', id],
    queryFn: async () => {
      const { data } = await api.get<Livreur>(`/livreurs/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateLivreur = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateLivreurDto) => {
      const { data } = await api.post<Livreur>('/livreurs', dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livreurs'] });
      toast.success('Livreur créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });
};

export const useUpdateLivreur = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateLivreurDto }) => {
      const { data } = await api.put<Livreur>(`/livreurs/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livreurs'] });
      toast.success('Livreur modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    },
  });
};

export const useDeleteLivreur = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/livreurs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livreurs'] });
      toast.success('Livreur supprimé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};

// ========== Dispatch Hook ==========

export const useDispatchOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, livreurId }: { orderId: string; livreurId: string }) => {
      const { data } = await api.patch(`/online-orders/${orderId}/dispatch`, { livreurId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-orders'] });
      toast.success('Livreur assigné, commande en livraison');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du dispatch');
    },
  });
};

// ========== Tracking Hook ==========

export const useOrderTracking = (orderId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['order-tracking', orderId],
    queryFn: async () => {
      const { data } = await api.get(`/online-orders/${orderId}/tracking`);
      return data;
    },
    enabled: enabled && !!orderId,
    refetchInterval: 30000, // Polling every 30 seconds
  });
};
