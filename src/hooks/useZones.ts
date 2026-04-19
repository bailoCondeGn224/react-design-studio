import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zonesApi, ZoneFilterParams, CreateZoneDto, UpdateZoneDto } from '@/api/zones';
import { toast } from 'sonner';

// Hook pour récupérer toutes les zones avec pagination
export const useZones = (params?: ZoneFilterParams) => {
  return useQuery({
    queryKey: ['zones', params],
    queryFn: () => zonesApi.getAll(params),
  });
};

// Hook pour récupérer uniquement les zones actives
export const useZonesActive = () => {
  return useQuery({
    queryKey: ['zones', 'actives'],
    queryFn: () => zonesApi.getActives(),
  });
};

// Hook pour récupérer une zone par ID
export const useZone = (id: string) => {
  return useQuery({
    queryKey: ['zones', id],
    queryFn: () => zonesApi.getById(id),
    enabled: !!id,
  });
};

// Hook pour créer une zone
export const useCreateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateZoneDto) => zonesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast.success('Zone créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la zone');
    },
  });
};

// Hook pour modifier une zone
export const useUpdateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateZoneDto }) =>
      zonesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast.success('Zone modifiée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification de la zone');
    },
  });
};

// Hook pour supprimer une zone
export const useDeleteZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => zonesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast.success('Zone supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression de la zone');
    },
  });
};
