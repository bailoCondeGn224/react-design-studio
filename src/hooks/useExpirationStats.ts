import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Article } from "@/types";
import type { QueryToggle } from '@/types';

interface ExpirationStats {
  expires: number;
  expirantBientot: number;
  articlesExpires: Article[];
  articlesExpirantBientot: Article[];
}

export function useExpirationStats(options: QueryToggle = {}) {
  return useQuery<ExpirationStats>({
    enabled: options.enabled ?? true,
    queryKey: ["expiration-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/expiration");
      return data;
    },
    refetchInterval: 5 * 60 * 1000, // Rafraîchir toutes les 5 minutes
  });
}
