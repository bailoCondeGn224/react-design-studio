import { apiClient } from '@/lib/api-client';

export interface ZakatCalculation {
  id: string;
  organizationId: string;
  userId: string;
  dateCalcul: string;
  annee: number;

  // Hawl
  dateAtteinteNisab?: string;
  hawlComplete: boolean;

  // Liquidités
  cashMaison: number;
  cashBanque: number;
  cashMobile: number;

  // Or & Argent
  orPoids: number;
  orInclureBijoux: boolean;
  orPrixGramme: number;
  argentPoids: number;
  argentPrixGramme: number;

  // Investissements
  investActions: number;
  investImmobilier: number;
  investAutres: number;

  // Commerce
  comStockValeur: number;
  comCreances: number;
  comLiquidites: number;

  // Agriculture
  hasAgriculture: boolean;
  agriQuantiteKg: number;
  agriValeurRecolte: number;
  agriIrrigation: 'AUCUN' | 'PLUIE' | 'ARTIFICIEL' | 'MIXTE';

  // Bétail
  hasBetail: boolean;
  betailChameaux: number;
  betailBovins: number;
  betailOvins: number;
  betailCaprins: number;

  // Dettes
  dettesPersonnelles: number;
  dettesFournisseurs: number;

  // Totaux calculés
  totalLiquidites: number;
  totalOrArgent: number;
  totalInvestissements: number;
  totalCommerce: number;
  totalActifs: number;
  totalDettes: number;
  montantZakatable: number;

  // Nisab
  nisabUtilise: number;
  assujetti: boolean;

  // Zakat
  zakatMal: number;
  zakatAgriculture: number;
  zakatBetail: number;
  zakatTotal: number;

  // Statut
  statut: 'BROUILLON' | 'CALCULE' | 'PAYE';
  datePaiement?: string;
  notes?: string;

  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    nom: string;
    prenom: string;
  };
}

export interface ZakatSettings {
  id: string;
  organizationId: string;
  prixOrGrammeUsd: number;
  prixArgentGrammeUsd: number;
  tauxUsdGnf: number;
  prixOrGrammeGnf: number;
  prixArgentGrammeGnf: number;
  nisabGnf: number;
  prixMouton: number;
  prixVeau1an: number;
  prixVeau2ans: number;
  prixVache: number;
  prixChamelle1an: number;
  prixChamelle2ans: number;
  prixChameauAdulte: number;
  lastPriceUpdate?: string;
}

export interface CreateZakatDto {
  dateAtteinteNisab?: string;
  cashMaison?: number;
  cashBanque?: number;
  cashMobile?: number;
  orPoids?: number;
  orInclureBijoux?: boolean;
  argentPoids?: number;
  investActions?: number;
  investImmobilier?: number;
  investAutres?: number;
  comStockValeur?: number;
  comCreances?: number;
  comLiquidites?: number;
  hasAgriculture?: boolean;
  agriQuantiteKg?: number;
  agriValeurRecolte?: number;
  agriIrrigation?: 'AUCUN' | 'PLUIE' | 'ARTIFICIEL' | 'MIXTE';
  hasBetail?: boolean;
  betailChameaux?: number;
  betailBovins?: number;
  betailOvins?: number;
  betailCaprins?: number;
  dettesPersonnelles?: number;
  dettesFournisseurs?: number;
  notes?: string;
}

export interface ZakatStatistics {
  totalCalculations: number;
  paidCount: number;
  pendingCount: number;
  totalZakatPaid: number;
  totalZakatPending: number;
  lastCalculation?: string;
}

export interface ZakatPrefilledData {
  valeurStock: number;
  creancesClients: number;
  dettesFournisseurs: number;
}

export const zakatApi = {
  // Calculs
  getAll: async (): Promise<ZakatCalculation[]> => {
    const response = await apiClient.get('/zakat');
    return response.data;
  },

  getOne: async (id: string): Promise<ZakatCalculation> => {
    const response = await apiClient.get(`/zakat/${id}`);
    return response.data;
  },

  create: async (data: CreateZakatDto): Promise<ZakatCalculation> => {
    const response = await apiClient.post('/zakat', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateZakatDto>): Promise<ZakatCalculation> => {
    const response = await apiClient.put(`/zakat/${id}`, data);
    return response.data;
  },

  markAsPaid: async (id: string): Promise<ZakatCalculation> => {
    const response = await apiClient.patch(`/zakat/${id}/pay`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/zakat/${id}`);
  },

  // Statistiques
  getStatistics: async (): Promise<ZakatStatistics> => {
    const response = await apiClient.get('/zakat/statistics');
    return response.data;
  },

  // Données pré-remplies (stock, créances, dettes)
  getPrefilledData: async (): Promise<ZakatPrefilledData> => {
    const response = await apiClient.get('/zakat/prefilled');
    return response.data;
  },

  // Paramètres
  getSettings: async (refresh = false): Promise<ZakatSettings> => {
    const response = await apiClient.get(`/zakat/settings${refresh ? '?refresh=true' : ''}`);
    return response.data;
  },

  updateSettings: async (data: Partial<ZakatSettings>): Promise<ZakatSettings> => {
    const response = await apiClient.put('/zakat/settings', data);
    return response.data;
  },
};
