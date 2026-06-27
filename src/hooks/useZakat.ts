import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { zakatApi, CreateZakatDto, ZakatSettings } from '@/api/zakat';

// ========== QUERIES ==========

export const useZakatCalculations = () => {
  return useQuery({
    queryKey: ['zakat', 'calculations'],
    queryFn: zakatApi.getAll,
    placeholderData: (prev) => prev,
  });
};

export const useZakatCalculation = (id: string) => {
  return useQuery({
    queryKey: ['zakat', 'calculation', id],
    queryFn: () => zakatApi.getOne(id),
    enabled: !!id,
  });
};

export const useZakatStatistics = () => {
  return useQuery({
    queryKey: ['zakat', 'statistics'],
    queryFn: zakatApi.getStatistics,
  });
};

export const useZakatSettings = (refresh = false) => {
  return useQuery({
    queryKey: ['zakat', 'settings', refresh],
    queryFn: () => zakatApi.getSettings(refresh),
    staleTime: 1000 * 60 * 60, // 1 heure
  });
};

export const useZakatPrefilledData = () => {
  return useQuery({
    queryKey: ['zakat', 'prefilled'],
    queryFn: zakatApi.getPrefilledData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ========== MUTATIONS ==========

export const useCreateZakat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateZakatDto) => zakatApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zakat'] });
      toast.success('Calcul de Zakat effectué avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du calcul');
    },
  });
};

export const useUpdateZakat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateZakatDto> }) =>
      zakatApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zakat'] });
      toast.success('Calcul mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useMarkZakatPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => zakatApi.markAsPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zakat'] });
      toast.success('Zakat marquée comme payée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur');
    },
  });
};

export const useDeleteZakat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => zakatApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zakat'] });
      toast.success('Calcul supprimé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};

export const useUpdateZakatSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ZakatSettings>) => zakatApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zakat', 'settings'] });
      toast.success('Paramètres mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur');
    },
  });
};

export const useRefreshZakatPrices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => zakatApi.getSettings(true),
    onSuccess: (data) => {
      queryClient.setQueryData(['zakat', 'settings', false], data);
      queryClient.setQueryData(['zakat', 'settings', true], data);
      toast.success('Prix mis à jour depuis les API');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour des prix');
    },
  });
};
