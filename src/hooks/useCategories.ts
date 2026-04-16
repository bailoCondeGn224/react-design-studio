import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/api/categories';
import { CreateCategorieDto, PaginationParams } from '@/types';
import { toast } from 'sonner';

export const useCategories = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoriesApi.getAll(params),
  });
};

export const useCategoriesActive = () => {
  return useQuery({
    queryKey: ['categories', 'active'],
    queryFn: categoriesApi.getActive,
  });
};

export const useCategorie = (id: string) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateCategorie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategorieDto) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Catégorie créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la catégorie');
    },
  });
};

export const useUpdateCategorie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCategorieDto> }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Catégorie mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour de la catégorie');
    },
  });
};

export const useDeleteCategorie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Catégorie supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression de la catégorie');
    },
  });
};
