// Types pour la pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Types pour les filtres spécifiques
export interface StockFilterParams extends PaginationParams {
  categorieId?: string;
  enAlerte?: boolean;
}

export interface ClientFilterParams extends PaginationParams {
  hasCredits?: boolean;
}

export interface MouvementFilterParams extends PaginationParams {
  type?: 'entree' | 'sortie';
  motif?: 'vente' | 'approvisionnement' | 'ajustement' | 'retour_client' | 'retour_fournisseur' | 'perte' | 'casse';
  articleId?: string;
}

export interface VenteFilterParams extends PaginationParams {
  dateDebut?: string;
  dateFin?: string;
  clientId?: string;
  modePaiement?: 'especes' | 'mobile_money' | 'virement' | 'credit' | 'acompte_50';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Types pour les Permissions
export interface Permission {
  id: string;
  code: string; // Ex: ventes.create, stock.delete
  nom: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Types pour les Rôles
export interface Role {
  id: string;
  nom: string; // Ex: ADMIN, VENDEUR, GESTIONNAIRE_STOCK
  description?: string;
  actif: boolean;
  permissions: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

// Types pour l'authentification et Users
export interface User {
  id: string;
  email: string;
  nom: string;
  roleId?: string;
  role?: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// Types pour les Catégories
export interface Categorie {
  id: string;
  nom: string;
  code: string;
  description?: string;
  actif: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategorieDto {
  nom: string;
  code: string;
  description?: string;
  actif?: boolean;
}

// Types pour le Stock
export interface Article {
  id: string;
  nom: string;
  reference?: string;
  categorieId: string;
  categorie?: Categorie; // Relation optionnelle si on veut afficher les détails
  zone: string;
  stock: number;
  seuilAlerte: number;
  max?: number;
  prixVente: number;
  prixAchat?: number;
  description?: string;
  // Statistiques de rotation
  tauxRotation?: number; // Nombre de fois que le stock se renouvelle
  derniereVente?: string; // Date de la dernière vente
  quantiteVendue30j?: number; // Quantité vendue sur 30 derniers jours
  vitesseRotation?: 'tres_rapide' | 'rapide' | 'normal' | 'lent' | 'dormant';
  joursSansVente?: number; // Nombre de jours depuis la dernière vente
  // Fournisseur préféré
  fournisseurPrefereId?: string;
  fournisseurPrefereNom?: string;
  prixMoyenAchat?: number; // Prix moyen d'achat chez tous les fournisseurs
  nombreFournisseurs?: number; // Nombre de fournisseurs qui fournissent cet article
  createdAt?: string;
  updatedAt?: string;
}

// Types pour les fournisseurs d'un article
export interface ArticleFournisseur {
  fournisseurId: string;
  fournisseurNom: string;
  nombreLivraisons: number;
  quantiteTotale: number;
  prixMoyen: number;
  dernierPrix: number;
  derniereLivraison: string;
  fiabilite: number; // Score de 0 à 100
  estPrefere: boolean;
}

export interface CreateArticleDto {
  nom: string;
  reference?: string;
  categorieId: string;
  zone: string;
  stock: number;
  seuilAlerte: number;
  max?: number;
  prixVente: number;
  prixAchat?: number;
  description?: string;
}

// Types pour les Ventes
export interface LigneVente {
  articleId: string;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export interface Vente {
  id: string;
  numero: string;
  clientId?: string;
  nom: string;
  prenom: string;
  tel: string;
  lignes: LigneVente[];
  total: number;
  montantPaye: number;
  montantRestant: number;
  modePaiement: 'especes' | 'mobile_money' | 'virement' | 'credit' | 'acompte_50';
  date: string;
  heure: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVenteDto {
  clientId?: string;
  nom: string;
  prenom: string;
  tel: string;
  lignes: LigneVente[];
  total: number;
  montantPaye: number;
  montantRestant: number;
  modePaiement: 'especes' | 'mobile_money' | 'virement' | 'credit' | 'acompte_50';
}

// Types pour les Fournisseurs
export interface Fournisseur {
  id: string;
  nom: string;
  adresse?: string;
  telephone: string;
  email?: string;
  produits: string[];
  rating?: number;
  statut: 'actif' | 'en_attente' | 'inactif';
  totalAchats: number;
  totalPaye: number;
  dette: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFournisseurDto {
  nom: string;
  adresse?: string;
  telephone: string;
  email?: string;
  produits: string[];
  rating?: number;
  statut?: 'actif' | 'en_attente' | 'inactif';
}

export interface StatsFournisseurs {
  total: number;
  actifs: number;
  totalDette: number;
  fournisseursEnDette: number;
  totalAchats: number;
}

// Types pour les Versements
export interface Versement {
  id: string;
  fournisseurId: string;
  fournisseurNom: string;
  montant: number;
  modePaiement: 'especes' | 'mobile' | 'virement' | 'cheque';
  reference?: string;
  date: string;
  note?: string;
  statut: 'valide' | 'en_attente' | 'annule';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVersementDto {
  fournisseurId: string;
  montant: number;
  modePaiement: 'especes' | 'mobile' | 'virement' | 'cheque';
  reference?: string;
  note?: string;
  statut?: 'valide' | 'en_attente' | 'annule';
}

// Types pour les Versements Clients (paiements de dettes clients)
export interface VersementClient {
  id: string;
  clientId: string;
  clientNom: string;
  venteId?: string;
  venteNumero?: string;
  montant: number;
  modePaiement: 'especes' | 'mobile_money' | 'virement' | 'cheque' | 'carte';
  reference?: string;
  date: string;
  note?: string;
  userId?: string;
  userNom?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVersementClientDto {
  clientId: string;
  clientNom: string;
  venteId?: string;
  montant: number;
  modePaiement: 'especes' | 'mobile_money' | 'virement' | 'cheque' | 'carte';
  reference?: string;
  date?: string;
  note?: string;
}

export interface VersementClientFilterParams extends PaginationParams {
  clientId?: string;
  venteId?: string;
  dateDebut?: string;
  dateFin?: string;
}

// Types pour les Finances
export interface Transaction {
  id: string;
  description: string;
  montant: number;
  type: 'in' | 'out';
  categorie: 'vente' | 'approvisionnement' | 'paiement_fournisseur' | 'charge' | 'autre';
  date: string;
  venteId?: string;
  approvisionnementId?: string;
  paiementFournisseurId?: string;
  createdAt?: string;
}

export interface Tresorerie {
  solde: number;
  recettes: number;
  depenses: number;
}

export interface RecettesMois {
  total: number;
  count: number;
}

export interface DepensesMois {
  total: number;
  count: number;
}

export interface ChargeBreakdown {
  categorie: string;
  total: number;
}

export interface RapportMensuel {
  periode: string;
  tresorerie: Tresorerie;
  recettesMois: RecettesMois;
  depensesMois: DepensesMois;
  chargesBreakdown: ChargeBreakdown[];
  soldeMois: number;
}

// Types pour les statistiques du Dashboard
export interface StatsVentes {
  jour: { count: number; total: number };
  semaine: { count: number; total: number };
  mois: { count: number; total: number };
}

export interface StatsStock {
  totalArticles: number;
  articlesEnRupture: number;
  articlesStockCritique: number;
  articlesStockFaible: number;
  articlesOK: number;
  valeurTotaleStock: number;
  tauxAlerte: number; // Pourcentage d'articles en alerte
  parCategorie: { categorie: string; count: number }[];
}

export interface DashboardAnalytics {
  stock: {
    valeurTotale: number;
    totalArticles: number;
    articlesEnAlerte: number;
    articlesCritiques: number;
  };
  fournisseurs: {
    totalActifs: number;
    totalFournisseurs: number;
    totalAchats: number;
    detteTotal: number;
    nombreCreanciers: number;
  };
  ventes: {
    totalJour: number;
    totalSemaine: number;
    totalMois: number;
    nombreVentesJour: number;
    nombreVentesMois: number;
  };
  clients: {
    total: number;
    avecCredits: number;
    totalCreditsEnCours: number;
  };
}

// Types pour les statistiques de rotation
export interface StatsRotation {
  tauxRotationMoyen: number;
  articlesRapides: Article[]; // Top 5 rotation rapide
  articlesDormants: Article[]; // Articles sans vente >90j
  articlesLents: Article[]; // Rotation lente
  valeurStockDormant: number;
  pourcentageDormant: number;
}

// Types pour les Clients
export interface Client {
  id: string;
  nom: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  totalAchats: number;
  totalCredits: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClientDto {
  nom: string;
  telephone?: string;
  email?: string;
  adresse?: string;
}

export interface StatsClients {
  total: number;
  avecCredits: number;
  totalCreditsEnCours: number;
}

// Types pour l'historique client
export interface ClientHistorique {
  stats: {
    totalAchats: number;
    totalPaye: number;
    detteActuelle: number;
    nombreVentes: number;
    nombrePaiements: number;
    beneficeTotal: number;
    dernierAchat?: string;
    dernierPaiement?: string;
  };
  ventes: Array<{
    id: string;
    numero: string;
    date: string;
    total: number;
    montantPaye: number;
    montantRestant: number;
    modePaiement: string;
    benefice: number;
    lignes: Array<{
      articleNom: string;
      quantite: number;
      prixUnitaire: number;
      prixAchat: number;
      sousTotal: number;
      benefice: number;
    }>;
  }>;
  paiements: Array<{
    id: string;
    date: string;
    montant: number;
    modePaiement: string;
    reference?: string;
    venteNumero?: string;
    note?: string;
  }>;
  timeline: Array<{
    id: string;
    type: 'achat' | 'paiement';
    date: string;
    montant: number;
    description: string;
    reference?: string;
    benefice?: number;
  }>;
  meta: PaginationMeta;
}

export interface ClientHistoriqueParams {
  page?: number;
  limit?: number;
  type?: 'tous' | 'achats' | 'paiements';
}

// Types pour les Approvisionnements
export interface LigneApprovisionnement {
  articleId: string;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export interface Approvisionnement {
  id: string;
  numero: string;
  fournisseurId: string;
  fournisseurNom: string;
  lignes: LigneApprovisionnement[];
  total: number;
  montantPaye: number;
  montantRestant: number;
  dateLivraison: string;
  numeroFacture?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateApprovisionnementDto {
  fournisseurId: string;
  lignes: LigneApprovisionnement[];
  total: number;
  montantPaye: number;
  montantRestant: number;
  dateLivraison: string;
  numeroFacture?: string;
  note?: string;
}

export interface StatsApprovisionnements {
  total: number;
  totalMontant: number;
  parFournisseur: { fournisseurNom: string; count: number; montant: number }[];
}

// Types pour les Mouvements de Stock
export interface MouvementStock {
  id: string;
  articleId: string;
  articleNom: string;
  type: 'entree' | 'sortie';
  motif: 'vente' | 'approvisionnement' | 'ajustement' | 'retour_client' | 'retour_fournisseur' | 'perte' | 'casse';
  quantite: number;
  stockAvant: number;
  stockApres: number;
  prixUnitaire?: number;
  valeurTotal?: number;
  reference?: string; // Référence de la vente, approvisionnement, etc.
  venteId?: string;
  approvisionnementId?: string;
  utilisateurId?: string;
  utilisateurNom?: string;
  note?: string;
  date: string;
  createdAt?: string;
}

export interface StatsMouvements {
  totalEntrees: number;
  totalSorties: number;
  valeurEntrees: number;
  valeurSorties: number;
  parMotif: { motif: string; count: number; quantite: number }[];
}

// Types pour la gestion des Utilisateurs
export interface CreateUserDto {
  email: string;
  password: string;
  nom: string;
  roleId?: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  nom?: string;
  roleId?: string;
}

export interface UserFilterParams extends PaginationParams {
  roleId?: string;
  actif?: boolean;
}

// Types pour la gestion des Rôles
export interface CreateRoleDto {
  nom: string;
  description?: string;
  actif?: boolean;
  permissionIds: string[];
}

export interface UpdateRoleDto {
  nom?: string;
  description?: string;
  actif?: boolean;
  permissionIds?: string[];
}

// Types pour les Paramètres de l'entreprise
export interface Parametres {
  id: string;
  nomComplet: string; // Ex: "Walli Industrie SARL"
  nomCourt: string; // Ex: "Walli" - affiché dans le sidebar
  slogan?: string; // Ex: "Mode & Tradition"
  logo?: string; // URL ou base64 du logo
  email: string;
  telephone: string;
  adresse: string;
  siteWeb?: string;
  rccm?: string; // Registre de Commerce et du Crédit Mobilier
  nif?: string; // Numéro d'Identification Fiscale
  registreCommerce?: string;
  devise: string;
  mentionsLegales?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateParametresDto {
  nomComplet?: string;
  nomCourt?: string;
  slogan?: string;
  logo?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  siteWeb?: string;
  rccm?: string;
  nif?: string;
  registreCommerce?: string;
  devise?: string;
  mentionsLegales?: string;
}
