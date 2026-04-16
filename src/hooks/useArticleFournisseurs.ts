import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articleFournisseursApi } from '@/api/article-fournisseurs';
import { toast } from 'sonner';

export const useArticleFournisseurs = (articleId: string) => {
  return useQuery({
    queryKey: ['article-fournisseurs', articleId],
    queryFn: () => articleFournisseursApi.getByArticle(articleId),
    enabled: !!articleId,
  });
};

export const useSetFournisseurPrefere = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ articleId, fournisseurId }: { articleId: string; fournisseurId: string }) =>
      articleFournisseursApi.setPreference(articleId, fournisseurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-fournisseurs'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Fournisseur préféré défini');
    },
    onError: () => {
      toast.error('Erreur lors de la définition du fournisseur préféré');
    },
  });
};

export const useHistoriquePrix = (articleId: string, fournisseurId: string) => {
  return useQuery({
    queryKey: ['historique-prix', articleId, fournisseurId],
    queryFn: () => articleFournisseursApi.getHistoriquePrix(articleId, fournisseurId),
    enabled: !!articleId && !!fournisseurId,
  });
};
