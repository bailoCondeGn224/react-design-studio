import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { commandesApi } from '@/api/commandes';
import {
  CreateCommandeDto,
  LivrerCommandeDto,
  CommandeFilterParams,
} from '@/types';

// Liste des commandes
export const useCommandes = (params?: CommandeFilterParams) => {
  return useQuery({
    queryKey: ['commandes', params],
    queryFn: () => commandesApi.getAll(params),
    placeholderData: (previousData) => previousData, // Garde les données précédentes pendant le chargement
  });
};

// Détails d'une commande
export const useCommande = (id: string) => {
  return useQuery({
    queryKey: ['commandes', id],
    queryFn: () => commandesApi.getById(id),
    enabled: !!id,
  });
};

// Lignes paginées d'une commande
export const useCommandeLignes = (commandeId: string | null, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['commandes', commandeId, 'lignes', page, limit],
    queryFn: () => commandesApi.getLignes(commandeId!, page, limit),
    enabled: !!commandeId,
    placeholderData: (previousData) => previousData, // Garde les données précédentes pendant le chargement
  });
};

// Statistiques
export const useCommandesStats = () => {
  return useQuery({
    queryKey: ['commandes', 'stats'],
    queryFn: () => commandesApi.getStats(),
  });
};

// Créer une commande
export const useCreateCommande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommandeDto) => commandesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Commande créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });
};

// Modifier une commande
export const useUpdateCommande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCommandeDto> }) =>
      commandesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
      toast.success('Commande modifiée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    },
  });
};

// Livrer une commande
export const useLivrerCommande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LivrerCommandeDto }) =>
      commandesApi.livrer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
      queryClient.invalidateQueries({ queryKey: ['ventes'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Commande livrée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la livraison');
    },
  });
};

// Annuler une commande
export const useAnnulerCommande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commandesApi.annuler(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
      toast.success('Commande annulée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
    },
  });
};

// Supprimer une commande
export const useDeleteCommande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commandesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
      toast.success('Commande supprimée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};
