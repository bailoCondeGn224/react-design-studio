import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Article } from "@/types";

interface ExpirationStats {
  expires: number;
  expirantBientot: number;
  articlesExpires: Article[];
  articlesExpirantBientot: Article[];
}

export function useExpirationStats() {
  return useQuery<ExpirationStats>({
    queryKey: ["expiration-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/expiration");
      return data;
    },
    refetchInterval: 5 * 60 * 1000, // Rafraîchir toutes les 5 minutes
  });
}
