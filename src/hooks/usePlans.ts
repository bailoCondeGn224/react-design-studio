import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} from '@/api/plans';
import { CreatePlanDto, UpdatePlanDto } from '@/types';
import { toast } from 'sonner';

export const usePlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: getAllPlans,
  });
};

export const usePlan = (id: string) => {
  return useQuery({
    queryKey: ['plans', id],
    queryFn: () => getPlanById(id),
    enabled: !!id,
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlanDto) => createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan ajouté avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout du plan");
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanDto }) =>
      updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan supprimé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};
