// src/hooks/useLivreurs.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Livreur, CreateLivreurDto, UpdateLivreurDto } from '@/types';
import { toast } from 'sonner';

// ========== Backoffice Hooks ==========

export const useLivreurs = () => {
  return useQuery({
    queryKey: ['livreurs'],
    queryFn: async () => {
      const { data } = await apiClient.get<Livreur[]>('/livreurs');
      return data;
    },
  });
};

export const useActiveLivreurs = () => {
  return useQuery({
    queryKey: ['livreurs', 'active'],
    queryFn: async () => {
      const { data } = await apiClient.get<Livreur[]>('/livreurs/active');
      return data;
    },
  });
};

export const useLivreur = (id: string) => {
  return useQuery({
    queryKey: ['livreurs', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Livreur>(`/livreurs/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateLivreur = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateLivreurDto) => {
      const { data } = await apiClient.post<Livreur>('/livreurs', dto);
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
      const { data } = await apiClient.put<Livreur>(`/livreurs/${id}`, dto);
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
      await apiClient.delete(`/livreurs/${id}`);
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
      const { data } = await apiClient.patch(`/online-orders/${orderId}/dispatch`, { livreurId });
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
      const { data } = await apiClient.get(`/online-orders/${orderId}/tracking`);
      return data;
    },
    enabled: enabled && !!orderId,
    refetchInterval: 30000, // Polling every 30 seconds
  });
};

// ========== Livreur App Hooks (for authenticated livreur on storefront) ==========

const LIVREUR_TOKEN_KEY = 'livreur_token';

const getLivreurToken = () => localStorage.getItem(LIVREUR_TOKEN_KEY);

// Hook pour récupérer les commandes assignées au livreur connecté
export const useLivreurOrders = () => {
  const token = getLivreurToken();

  return useQuery({
    queryKey: ['livreur-orders'],
    queryFn: async () => {
      const { data } = await apiClient.get('/livreur/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    enabled: !!token,
    refetchInterval: 30000, // Polling every 30 seconds
  });
};

// Hook pour mettre à jour la position GPS du livreur
export const useUpdateLivreurPosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (position: { latitude: number; longitude: number }) => {
      const token = getLivreurToken();
      const { data } = await apiClient.put('/livreur/position', position, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livreur-orders'] });
    },
  });
};

// Hook pour démarrer la livraison (activer le suivi GPS)
export const useStartDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = getLivreurToken();
      const { data } = await apiClient.post('/livreur/start-delivery', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livreur-orders'] });
      toast.success('Suivi GPS activé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'activation du suivi');
    },
  });
};

// Hook pour arrêter la livraison (désactiver le suivi GPS)
export const useStopDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = getLivreurToken();
      const { data } = await apiClient.post('/livreur/stop-delivery', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livreur-orders'] });
      toast.success('Suivi GPS désactivé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la désactivation du suivi');
    },
  });
};

// Hook pour marquer une commande comme livrée (par le livreur)
export const useMarkOrderDelivered = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const token = getLivreurToken();
      const { data } = await apiClient.patch(`/livreur/orders/${orderId}/delivered`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livreur-orders'] });
      toast.success('Commande marquée comme livrée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};
