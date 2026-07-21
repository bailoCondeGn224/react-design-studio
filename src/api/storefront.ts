// src/api/storefront.ts
import { apiClient } from '@/lib/api-client';
import { StoreFront, StorefrontArticle, PaginatedResponse } from '@/types';

export interface StorefrontProductParams {
  page?: number;
  limit?: number;
  search?: string;
  categorieId?: string;
}

export const storefrontApi = {
  getBySlug: async (slug: string): Promise<StoreFront> => {
    const response = await apiClient.get<StoreFront>(`/public/storefront/${slug}`);
    return response.data;
  },

  getProducts: async (slug: string, params?: StorefrontProductParams): Promise<PaginatedResponse<StorefrontArticle>> => {
    const response = await apiClient.get<PaginatedResponse<StorefrontArticle>>(
      `/public/storefront/${slug}/articles`,
      { params }
    );
    return response.data;
  },

  getProduct: async (slug: string, articleId: string): Promise<StorefrontArticle> => {
    const response = await apiClient.get<StorefrontArticle>(
      `/public/storefront/${slug}/articles/${articleId}`
    );
    return response.data;
  },

  getCategories: async (slug: string): Promise<{ id: string; nom: string; slug: string }[]> => {
    const response = await apiClient.get(`/public/storefront/${slug}/categories`);
    return response.data;
  },
};
