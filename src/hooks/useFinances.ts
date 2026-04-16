import { useQuery } from '@tanstack/react-query';
import { financesApi } from '@/api/finances';
import { PaginationParams } from '@/types';

export const useTresorerie = () => {
  return useQuery({
    queryKey: ['finances', 'tresorerie'],
    queryFn: financesApi.getTresorerie,
  });
};

export const useRecettesMois = () => {
  return useQuery({
    queryKey: ['finances', 'recettes-mois'],
    queryFn: financesApi.getRecettesMois,
  });
};

export const useDepensesMois = () => {
  return useQuery({
    queryKey: ['finances', 'depenses-mois'],
    queryFn: financesApi.getDepensesMois,
  });
};

export const useChargesBreakdown = () => {
  return useQuery({
    queryKey: ['finances', 'charges-breakdown'],
    queryFn: financesApi.getChargesBreakdown,
  });
};

export const useTransactions = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['finances', 'transactions', params],
    queryFn: () => financesApi.getTransactions(params),
  });
};

export const useRapportMensuel = () => {
  return useQuery({
    queryKey: ['finances', 'rapport-mensuel'],
    queryFn: financesApi.getRapportMensuel,
  });
};
