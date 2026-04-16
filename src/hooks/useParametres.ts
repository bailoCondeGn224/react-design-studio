import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parametresApi } from '@/api/parametres';
import { UpdateParametresDto } from '@/types';
import { toast } from 'sonner';

export const useParametres = () => {
  return useQuery({
    queryKey: ['parametres'],
    queryFn: parametresApi.get,
    staleTime: 1000 * 60 * 5, // Les paramètres changent rarement, cache 5 minutes
  });
};

export const useUpdateParametres = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateParametresDto) => parametresApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parametres'] });
      toast.success('Paramètres mis à jour avec succès');
    },
    onError: (error: any) => {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useUploadLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => parametresApi.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parametres'] });
      toast.success('Logo mis à jour avec succès');
    },
    onError: (error: any) => {
      console.error('Erreur lors de l\'upload du logo:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload du logo');
    },
  });
};
