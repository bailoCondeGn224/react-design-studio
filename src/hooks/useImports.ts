import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importsApi } from '@/api/imports';
import { toast } from 'sonner';

export const useImportArticles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => importsApi.importArticles(file),
    onSuccess: (data) => {
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['approvisionnements'] });

      const { articlesCreated, approvisionnementsCreated, errors } = data;

      if (errors.length === 0) {
        toast.success(
          `Import réussi! ${articlesCreated} article(s) et ${approvisionnementsCreated} approvisionnement(s) créé(s)`,
        );
      } else {
        toast.warning(
          `Import partiel: ${articlesCreated} créé(s), ${errors.length} erreur(s)`,
        );
      }
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de l'import Excel",
      );
    },
  });
};

export const useDownloadTemplate = () => {
  return useMutation({
    mutationFn: () => importsApi.downloadTemplate(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'template-import-articles.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Template téléchargé avec succès');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          'Erreur lors du téléchargement du template',
      );
    },
  });
};
