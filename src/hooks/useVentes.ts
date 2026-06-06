import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ventesApi } from '@/api/ventes';
import { CreateVenteDto, VenteFilterParams } from '@/types';
import { toast } from 'sonner';

export const useVentes = (params?: VenteFilterParams) => {
  return useQuery({
    queryKey: ['ventes', params],
    queryFn: () => ventesApi.getAll(params),
    placeholderData: (previousData) => previousData, // Garde les données précédentes pendant le chargement
  });
};

export const useVente = (id: string) => {
  return useQuery({
    queryKey: ['ventes', id],
    queryFn: () => ventesApi.getById(id),
    enabled: !!id,
  });
};

export const useVenteVersements = (venteId: string | null, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['ventes', venteId, 'versements', page, limit],
    queryFn: () => ventesApi.getVersements(venteId!, page, limit),
    enabled: !!venteId,
    placeholderData: (previousData) => previousData, // Garde les données précédentes pendant le chargement
  });
};

export const useVentesStats = (params?: { mois?: number; annee?: number }) => {
  return useQuery({
    queryKey: ['ventes', 'stats', params],
    queryFn: () => ventesApi.getStats(params),
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

export const useMoisDisponibles = () => {
  return useQuery({
    queryKey: ['ventes', 'mois-disponibles'],
    queryFn: ventesApi.getMoisDisponibles,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
