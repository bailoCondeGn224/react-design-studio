import { apiClient } from '@/lib/api-client';

export interface ImportResult {
  articlesCreated: number;
  approvisionnementsCreated: number;
  errors: ImportError[];
  summary: {
    totalRows: number;
    success: number;
    failed: number;
  };
}

export interface ImportError {
  row: number;
  codeArticle?: string;
  nom?: string;
  errors: string[];
}

export const importsApi = {
  /**
   * Importer des articles en masse depuis un fichier Excel
   */
  importArticles: async (file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/bulk-import/articles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Télécharger le template Excel pour l'import d'articles
   */
  downloadTemplate: async (): Promise<Blob> => {
    const response = await apiClient.get('/bulk-import/template/articles', {
      responseType: 'blob',
    });

    return response.data;
  },
};
