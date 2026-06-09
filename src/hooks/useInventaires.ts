import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventairesApi } from '@/api/inventaires';
import { CreateInventaireDto, AddComptageDto, PaginationParams } from '@/types';
import { toast } from 'sonner';

export const useInventaires = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['inventaires', params],
    queryFn: () => inventairesApi.getAll(params),
  });
};

export const useInventaireDateMin = () => {
  return useQuery({
    queryKey: ['inventaires', 'date-min'],
    queryFn: () => inventairesApi.getDateMin(),
  });
};

export const useInventaire = (id: string | null) => {
  return useQuery({
    queryKey: ['inventaires', id],
    queryFn: () => inventairesApi.getById(id!),
    enabled: !!id,
  });
};

export const useInventaireEcarts = (id: string | null) => {
  return useQuery({
    queryKey: ['inventaires', id, 'ecarts'],
    queryFn: () => inventairesApi.getEcarts(id!),
    enabled: !!id,
  });
};

export const useCreateInventaire = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInventaireDto) => inventairesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventaires'] });
      toast.success('Inventaire créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });
};

export const useAddComptage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      inventaireId,
      data,
    }: {
      inventaireId: string;
      data: AddComptageDto;
    }) => inventairesApi.addComptage(inventaireId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['inventaires', variables.inventaireId],
      });
      queryClient.invalidateQueries({
        queryKey: ['inventaires', variables.inventaireId, 'ecarts'],
      });
      toast.success('Comptage enregistré');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors du comptage',
      );
    },
  });
};

export const useValiderInventaire = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inventaireId: string) =>
      inventairesApi.valider(inventaireId),
    onSuccess: async (_, inventaireId) => {
      // Forcer un refetch immédiat de toutes les queries liées
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['inventaires'] }),
        queryClient.refetchQueries({ queryKey: ['inventaires', inventaireId] }),
        queryClient.refetchQueries({ queryKey: ['stock'] }),
      ]);
      toast.success('Inventaire validé et stocks ajustés');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors de la validation',
      );
    },
  });
};

export const useCalculerFinances = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inventaireId: string) =>
      inventairesApi.calculerFinances(inventaireId),
    onSuccess: async (_, inventaireId) => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['inventaires'] }),
        queryClient.refetchQueries({ queryKey: ['inventaires', inventaireId] }),
        queryClient.refetchQueries({ queryKey: ['inventaires', 'dashboard'] }),
      ]);
      toast.success('Finances calculées avec succès');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors du calcul des finances',
      );
    },
  });
};

export const useInventairesDashboard = (params?: {
  periode?: string;
  dateDebut?: string;
  dateFin?: string;
}) => {
  return useQuery({
    queryKey: ['inventaires', 'dashboard', params],
    queryFn: () => inventairesApi.getDashboardStats(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useExportComptagesExcel = () => {
  return useMutation({
    mutationFn: (inventaireId: string) =>
      inventairesApi.exportComptagesExcel(inventaireId),
    onSuccess: (blob, inventaireId) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comptages-inventaire-${inventaireId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Export Excel téléchargé avec succès');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors de l\'export',
      );
    },
  });
};

export const useExportInventairesExcel = () => {
  return useMutation({
    mutationFn: () => inventairesApi.exportInventairesExcel(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventaires-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Export Excel téléchargé avec succès');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors de l\'export',
      );
    },
  });
};
