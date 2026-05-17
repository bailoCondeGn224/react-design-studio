import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { depensesApi } from '../api/depenses';
import {
  Depense,
  CreateDepenseDto,
  UpdateDepenseDto,
  DepenseFilterParams,
} from '../types';
import { toast } from 'sonner';

/**
 * Hook pour récupérer toutes les dépenses avec filtres
 */
export const useDepenses = (params?: DepenseFilterParams) => {
  return useQuery({
    queryKey: ['depenses', params],
    queryFn: () => depensesApi.getAll(params),
    placeholderData: (previousData) => previousData, // Garde les données précédentes pendant le chargement
  });
};

/**
 * Hook pour récupérer une dépense par ID
 */
export const useDepense = (id: string) => {
  return useQuery({
    queryKey: ['depenses', id],
    queryFn: () => depensesApi.getById(id),
    enabled: !!id,
  });
};

/**
 * Hook pour récupérer les statistiques de dépenses
 */
export const useDepensesStats = (dateDebut?: string, dateFin?: string) => {
  return useQuery({
    queryKey: ['depenses', 'stats', dateDebut, dateFin],
    queryFn: () => depensesApi.getStatistics(dateDebut, dateFin),
  });
};

/**
 * Hook pour créer une dépense
 */
export const useCreateDepense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDepenseDto) => depensesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depenses'] });
      toast.success('Dépense enregistrée avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de l\'enregistrement de la dépense';
      toast.error(message);
    },
  });
};

/**
 * Hook pour mettre à jour une dépense
 */
export const useUpdateDepense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepenseDto }) =>
      depensesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depenses'] });
      toast.success('Dépense modifiée avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la modification de la dépense';
      toast.error(message);
    },
  });
};

/**
 * Hook pour supprimer une dépense
 */
export const useDeleteDepense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => depensesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depenses'] });
      toast.success('Dépense supprimée avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la suppression de la dépense';
      toast.error(message);
    },
  });
};
