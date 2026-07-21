// src/hooks/useStorefrontConfig.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storefrontConfigApi, UpdateStorefrontConfigDto } from '@/api/storefront-config';
import { toast } from 'sonner';

export const useStorefrontConfig = () => {
  return useQuery({
    queryKey: ['storefront-config'],
    queryFn: () => storefrontConfigApi.get(),
  });
};

export const useUpdateStorefrontConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateStorefrontConfigDto) => storefrontConfigApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront-config'] });
      toast.success('Configuration mise à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};
