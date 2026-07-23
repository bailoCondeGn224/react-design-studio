import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { retoursClientsApi, retoursFournisseursApi } from '@/api/retours';
import { CreateRetourClientDto, CreateRetourFournisseurDto, PaginationParams } from '@/types';
import { toast } from 'sonner';

export const useCreateRetourClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRetourClientDto) => retoursClientsApi.create(data),
    onSuccess: () => {
      // Invalider TOUTES les requêtes liées aux ventes (y compris détails individuels et stats)
      queryClient.invalidateQueries({ queryKey: ['ventes'] });
      // Forcer le refetch immédiat des ventes
      queryClient.refetchQueries({ queryKey: ['ventes'], type: 'active' });
      // Invalider les autres ressources affectées
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['mouvements-stock'] });
      queryClient.invalidateQueries({ queryKey: ['retours-clients'] });
      queryClient.invalidateQueries({ queryKey: ['retours-clients-stats'] });
      toast.success('Retour client enregistré avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement du retour');
    },
  });
};

export const useCreateRetourFournisseur = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRetourFournisseurDto) => retoursFournisseursApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvisionnements'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] });
      queryClient.invalidateQueries({ queryKey: ['mouvements-stock'] });
      queryClient.invalidateQueries({ queryKey: ['retours-fournisseurs'] });
      queryClient.invalidateQueries({ queryKey: ['retours-fournisseurs-stats'] });
      toast.success('Retour fournisseur enregistré avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement du retour');
    },
  });
};

// Hooks pour récupérer l'historique
export const useRetoursClients = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['retours-clients', params],
    queryFn: () => retoursClientsApi.getAll(params),
    placeholderData: (previousData) => previousData, // Garde les données précédentes pendant le chargement
  });
};

export const useRetoursFournisseurs = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['retours-fournisseurs', params],
    queryFn: () => retoursFournisseursApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useRetoursByApprovisionnement = (approvisionnementId: string | null) => {
  return useQuery({
    queryKey: ['retours-fournisseurs', 'approvisionnement', approvisionnementId],
    queryFn: () => retoursFournisseursApi.getByApprovisionnement(approvisionnementId!),
    enabled: !!approvisionnementId,
  });
};

// Hooks pour les statistiques
export const useRetoursClientsStats = () => {
  return useQuery({
    queryKey: ['retours-clients-stats'],
    queryFn: () => retoursClientsApi.getStats(),
  });
};

export const useRetoursFournisseursStats = () => {
  return useQuery({
    queryKey: ['retours-fournisseurs-stats'],
    queryFn: () => retoursFournisseursApi.getStats(),
  });
};
