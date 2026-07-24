// src/types/customer.ts
export interface CustomerAccount {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
}

export interface StoreFront {
  id: string;
  slug: string;
  organizationId: string;
  organizationNom: string;
  description?: string;
  logoUrl?: string;
  whatsappNumber?: string;
  horaires?: string;
  fraisLivraison: number;
  adresse?: string;
  isActive: boolean;
  fullUrl?: string;
}

export interface CartItem {
  articleId: string;
  articleNom: string;
  articlePhoto?: string;
  modeVenteId?: string;
  modeVenteNom?: string;
  quantiteStock?: number; // Nombre d'articles par lot (pour mode gros)
  prixUnitaire: number;
  quantity: number; // Nombre de lots
}

export enum OnlineOrderStatut {
  EN_ATTENTE = 'EN_ATTENTE',
  CONFIRMEE = 'CONFIRMEE',
  PRETE = 'PRETE',
  LIVREE = 'LIVREE',
  ANNULEE = 'ANNULEE',
}

export enum ModeLivraison {
  LIVRAISON = 'LIVRAISON',
  RETRAIT_BOUTIQUE = 'RETRAIT_BOUTIQUE',
}

export interface OnlineOrderItem {
  id: string;
  articleId: string;
  articleNom: string;
  modeVenteId?: string;
  modeVenteNom?: string;
  quantite: number;
  quantiteBase?: number;
  prixUnitaire: number;
  sousTotal: number;
}

export interface OnlineOrder {
  id: string;
  numero: string;
  organizationId: string;
  statut: OnlineOrderStatut;
  modeLivraison: ModeLivraison;
  adresseLivraison?: string;
  telephoneLivraison?: string;
  fraisLivraison: number;
  sousTotal: number;
  total: number;
  items: OnlineOrderItem[];
  customerAccount?: CustomerAccount;
  clientNom?: string;
  clientTelephone?: string;
  motifAnnulation?: string;
  confirmeePar?: string;
  confirmeeLe?: string;
  preteLe?: string;
  livreeLe?: string;
  annuleeLe?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOnlineOrderDto {
  storefrontSlug: string;
  modeLivraison: ModeLivraison;
  adresseLivraison?: string;
  telephoneLivraison: string;
  nomClient?: string;
  items: {
    articleId: string;
    modeVenteId?: string;
    quantite: number;
  }[];
}

export interface RegisterCustomerDto {
  nom: string;
  telephone: string;
  email?: string;
  password: string;
}

export interface LoginCustomerDto {
  telephone: string;
  password: string;
}

export interface UpdateCustomerDto {
  nom?: string;
  email?: string;
}

export interface StorefrontArticle {
  id: string;
  nom: string;
  description?: string;
  photo?: string;
  prixEnLigne: number;
  prixOriginal?: number;
  stock: number;
  categorie?: string;
  modesVente?: { id: string; nom: string; prix: number; quantiteStock: number }[];
}

export interface OnlineOrderFilterParams {
  page?: number;
  limit?: number;
  statut?: OnlineOrderStatut;
  search?: string;
}
