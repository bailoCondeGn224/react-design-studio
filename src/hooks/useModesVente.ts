import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modesVenteApi } from '@/api/modes-vente';
import { CreateModeVenteDto } from '@/types';
import { toast } from 'sonner';

export const useModesVenteByArticle = (articleId: string | null) => {
  return useQuery({
    queryKey: ['modes-vente', 'article', articleId],
    queryFn: () => modesVenteApi.getByArticle(articleId!),
    enabled: !!articleId,
  });
};

export const useCreateModeVente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateModeVenteDto) => modesVenteApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['modes-vente', 'article', variables.articleId] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      toast.success('Mode de vente ajouté');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout');
    },
  });
};

export const useDeleteModeVente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => modesVenteApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modes-vente'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      toast.success('Mode de vente supprimé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};
