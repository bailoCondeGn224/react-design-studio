import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ventesApi } from '@/api/ventes';
import { CreateVenteDto, VenteFilterParams } from '@/types';
import { toast } from 'sonner';

export const useVentes = (params?: VenteFilterParams) => {
  return useQuery({
    queryKey: ['ventes', params],
    queryFn: () => ventesApi.getAll(params),
  });
};

export const useVente = (id: string) => {
  return useQuery({
    queryKey: ['ventes', id],
    queryFn: () => ventesApi.getById(id),
    enabled: !!id,
  });
};

export const useVentesStats = () => {
  return useQuery({
    queryKey: ['ventes', 'stats'],
    queryFn: ventesApi.getStats,
  });
};

// Alias pour compatibilité
export const useStatsVentes = useVentesStats;

export const useVentesRecent = () => {
  return useQuery({
    queryKey: ['ventes', 'recent'],
    queryFn: ventesApi.getRecent,
  });
};

export const useCreateVente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVenteDto) => ventesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventes'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Vente enregistrée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    },
  });
};

export const useUpdateVente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVenteDto> }) =>
      ventesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventes'] });
      toast.success('Vente mise à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useDeleteVente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ventesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventes'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      toast.success('Vente annulée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
    },
  });
};
