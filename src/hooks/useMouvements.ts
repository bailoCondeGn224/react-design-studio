import { useQuery } from '@tanstack/react-query';
import { mouvementsApi } from '@/api/mouvements';
import { PaginationParams, MouvementFilterParams } from '@/types';

export const useMouvements = (params?: MouvementFilterParams) => {
  return useQuery({
    queryKey: ['mouvements', params],
    queryFn: () => mouvementsApi.getAll(params),
    staleTime: 30 * 1000, // Cache pendant 30 secondes
    refetchOnWindowFocus: false, // Ne pas recharger au focus
  });
};

export const useMouvementsByArticle = (articleId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['mouvements', 'article', articleId, params],
    queryFn: () => mouvementsApi.getByArticle(articleId, params),
    enabled: !!articleId,
  });
};

export const useMouvement = (id: string) => {
  return useQuery({
    queryKey: ['mouvements', id],
    queryFn: () => mouvementsApi.getById(id),
    enabled: !!id,
  });
};

export const useStatsMouvements = () => {
  return useQuery({
    queryKey: ['mouvements', 'stats'],
    queryFn: mouvementsApi.getStats,
    staleTime: 2 * 60 * 1000, // Cache pendant 2 minutes
    gcTime: 5 * 60 * 1000, // Garde en mémoire pendant 5 minutes
    refetchOnWindowFocus: false, // Ne pas recharger au focus
  });
};
