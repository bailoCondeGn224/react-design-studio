# Task 3: Mettre à jour API Stock pour modesVente

**Files:**
- Modify: `src/api/stock.ts`

## Context

When creating/updating articles with a photo, FormData is used. The modesVente array must be JSON-stringified in FormData.

## Steps

### Step 1: Modifier create pour sérialiser modesVente

Find the `create` function and update the FormData logic to handle modesVente as JSON:

```typescript
  create: async (data: CreateArticleDto, photo?: File): Promise<Article> => {
    if (photo) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'modesVente' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      formData.append('photo', photo);

      const response = await apiClient.post<Article>('/stock', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }

    const response = await apiClient.post<Article>('/stock', data);
    return response.data;
  },
```

### Step 2: Modifier update de la même façon

```typescript
  update: async (id: string, data: Partial<CreateArticleDto>, photo?: File): Promise<Article> => {
    if (photo) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'modesVente' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      formData.append('photo', photo);

      const response = await apiClient.patch<Article>(`/stock/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }

    const response = await apiClient.patch<Article>(`/stock/${id}`, data);
    return response.data;
  },
```

### Step 3: Commit

```bash
cd "C:\Users\Bailo conde\Documents\projects\Gestion _boutique _walli_indistrie\react-design-studio"
npx tsc --noEmit && git add src/api/stock.ts && git commit -m "feat(api/stock): sérialiser modesVente dans FormData"
```
