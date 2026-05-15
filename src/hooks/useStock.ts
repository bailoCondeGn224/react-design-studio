import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockApi } from '@/api/stock';
import { CreateArticleDto, StockFilterParams } from '@/types';
import { toast } from 'sonner';

export const useStock = (params?: StockFilterParams) => {
  return useQuery({
    queryKey: ['stock', params],
    queryFn: () => stockApi.getAll(params),
    staleTime: 0, // Considérer les données comme périmées immédiatement
    refetchOnMount: true, // Toujours refetch au montage du composant
    refetchOnWindowFocus: true, // Refetch quand la fenêtre reprend le focus
  });
};

export const useStockAlerts = () => {
  return useQuery({
    queryKey: ['stock', 'alerts'],
    queryFn: stockApi.getAlerts,
  });
};

export const useStockStats = () => {
  return useQuery({
    queryKey: ['stock', 'stats'],
    queryFn: stockApi.getStats,
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, photo }: { data: CreateArticleDto; photo?: File }) =>
      stockApi.create(data, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock', 'stats'] });
      toast.success('Article ajouté au stock');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout');
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, photo }: { id: string; data: Partial<CreateArticleDto>; photo?: File }) =>
      stockApi.update(id, data, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      toast.success('Article mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      toast.success('Article supprimé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};

export const useCreateBulkArticles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ articles, photos }: { articles: CreateArticleDto[]; photos?: (File | null)[] }) =>
      stockApi.createBulk(articles, photos),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock', 'stats'] });
      const count = data?.created?.length || 0;
      const errors = data?.errors?.length || 0;

      if (errors > 0) {
        toast.success(`${count} article(s) créé(s), ${errors} erreur(s)`);
      } else {
        toast.success(`${count} article(s) ajouté(s) avec succès`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout des articles');
    },
  });
};
