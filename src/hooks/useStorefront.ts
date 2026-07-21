// src/hooks/useStorefront.ts
import { useQuery } from '@tanstack/react-query';
import { storefrontApi, StorefrontProductParams } from '@/api/storefront';

export const useStorefront = (slug: string) => {
  return useQuery({
    queryKey: ['storefront', slug],
    queryFn: () => storefrontApi.getBySlug(slug),
    enabled: !!slug,
  });
};

export const useStorefrontProducts = (slug: string, params?: StorefrontProductParams) => {
  return useQuery({
    queryKey: ['storefront-products', slug, params],
    queryFn: () => storefrontApi.getProducts(slug, params),
    enabled: !!slug,
    placeholderData: (prev) => prev,
  });
};

export const useStorefrontProduct = (slug: string, articleId: string) => {
  return useQuery({
    queryKey: ['storefront-product', slug, articleId],
    queryFn: () => storefrontApi.getProduct(slug, articleId),
    enabled: !!slug && !!articleId,
  });
};

export const useStorefrontCategories = (slug: string) => {
  return useQuery({
    queryKey: ['storefront-categories', slug],
    queryFn: () => storefrontApi.getCategories(slug),
    enabled: !!slug,
  });
};
