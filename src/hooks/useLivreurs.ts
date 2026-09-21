import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { livreursApi } from '@/api/livreurs';
import { onlineOrdersApi } from '@/api/online-orders';
import { Livreur, CreateLivreurDto, UpdateLivreurDto } from '@/types/livreur';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface UseLivreursOptions {
  /**
   * Intervalle de rafraîchissement en ms. À n'activer que lorsque la carte de
   * suivi est visible : sans ça les positions restent figées jusqu'au rechargement
   * de la page.
   */
  refetchInterval?: number | false;
}

export const useLivreurs = (options?: UseLivreursOptions) => {
  return useQuery<Livreur[]>({
    queryKey: ['livreurs'],
    queryFn: () => livreursApi.getAll(),
    refetchInterval: options?.refetchInterval ?? false,
  });
};

export const useCreateLivreur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLivreurDto) => livreursApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livreurs'] });
      toast.success('Livreur créé');
    },
    onError: (error: AxiosError<{ message?: string }>) =>
      toast.error(error.response?.data?.message || 'Erreur lors de la création'),
  });
};

export const useUpdateLivreur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLivreurDto }) =>
      livreursApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livreurs'] });
      toast.success('Livreur modifié');
    },
    onError: (error: AxiosError<{ message?: string }>) =>
      toast.error(error.response?.data?.message || 'Erreur lors de la modification'),
  });
};

export const useDeleteLivreur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => livreursApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livreurs'] });
      toast.success('Livreur supprimé');
    },
    onError: (error: AxiosError<{ message?: string }>) =>
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression'),
  });
};

export const useDispatchOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      livreurId,
    }: {
      orderId: string;
      livreurId: string;
    }) => onlineOrdersApi.dispatch(orderId, livreurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-orders'] });
      toast.success('Commande assignée au livreur');
    },
    onError: (error: AxiosError<{ message?: string }>) =>
      toast.error(error.response?.data?.message || "Erreur lors de l'assignation"),
  });
};
