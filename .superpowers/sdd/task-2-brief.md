# Task 2: Créer API et Hook Modes de Vente

**Files:**
- Create: `src/api/modes-vente.ts`
- Create: `src/hooks/useModesVente.ts`

## Steps

### Step 1: Créer src/api/modes-vente.ts

```typescript
import { apiClient } from '@/lib/api-client';
import { ModeVente, CreateModeVenteDto } from '@/types';

export const modesVenteApi = {
  getByArticle: async (articleId: string): Promise<ModeVente[]> => {
    const response = await apiClient.get<ModeVente[]>(`/modes-vente/article/${articleId}`);
    return response.data;
  },

  create: async (data: CreateModeVenteDto): Promise<ModeVente> => {
    const response = await apiClient.post<ModeVente>('/modes-vente', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateModeVenteDto>): Promise<ModeVente> => {
    const response = await apiClient.patch<ModeVente>(`/modes-vente/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/modes-vente/${id}`);
  },
};
```

### Step 2: Créer src/hooks/useModesVente.ts

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modesVenteApi } from '@/api/modes-vente';
import { CreateModeVenteDto } from '@/types';
import { toast } from 'sonner';

export const useModesVenteByArticle = (articleId: string | null) => {
  return useQuery({
    queryKey: ['modes-vente', 'article', articleId],
    queryFn: () => modesVenteApi.getByArticle(articleId!),
    enabled: !!articleId,
  });
};

export const useCreateModeVente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateModeVenteDto) => modesVenteApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['modes-vente', 'article', variables.articleId] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      toast.success('Mode de vente ajouté');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout');
    },
  });
};

export const useDeleteModeVente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => modesVenteApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modes-vente'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      toast.success('Mode de vente supprimé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });
};
```

### Step 3: Commit

```bash
cd "C:\Users\Bailo conde\Documents\projects\Gestion _boutique _walli_indistrie\react-design-studio"
npx tsc --noEmit && git add src/api/modes-vente.ts src/hooks/useModesVente.ts && git commit -m "feat: ajouter API et hooks modes-vente"
```
