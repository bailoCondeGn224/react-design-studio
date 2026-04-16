import { useQuery } from '@tanstack/react-query';
import { rotationApi } from '@/api/rotation';

export const useStatsRotation = () => {
  return useQuery({
    queryKey: ['rotation', 'stats'],
    queryFn: rotationApi.getStats,
  });
};

export const useArticleRotation = (articleId: string) => {
  return useQuery({
    queryKey: ['rotation', 'article', articleId],
    queryFn: () => rotationApi.getArticleRotation(articleId),
    enabled: !!articleId,
  });
};
