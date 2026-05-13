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

// Types pour les Plans (Multi-tenant)
export interface Plan {
  id: string;
  code: string; // Ex: FREE, STANDARD, PREMIUM, ENTERPRISE
  nom: string; // Ex: "Plan Gratuit"
  description?: string;
  prixMensuel: number;
  actif: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePlanDto {
  code: string;
  nom: string;
  description?: string;
  prixMensuel: number;
  actif?: boolean;
}

export interface UpdatePlanDto {
  nom?: string;
  description?: string;
  prixMensuel?: number;
  actif?: boolean;
}

// Types pour les Organizations (Multi-tenant)
export interface Organization {
  id: string;
  nom: string; // Nom complet de l'organisation
  slug: string; // URL-friendly identifier (ex: walli-industrie)
  actif: boolean;
  planId: string;
  plan?: Plan; // Relation optionnelle
  // Limites héritées du plan ou personnalisées
  maxUsers: number;
  maxArticles: number;
  abonnementExpire?: string; // Date d'expiration de l'abonnement
  // Informations de l'entreprise
  nomCourt?: string; // Ex: "Walli"
  slogan?: string; // Ex: "Mode & Tradition"
  logo?: string; // URL ou base64
  email?: string;
  telephone?: string;
  adresse?: string;
  siteWeb?: string;
  rccm?: string; // Registre de Commerce
  nif?: string; // Numéro d'Identification Fiscale
  devise?: string; // Ex: "GNF", "XOF"
  mentionsLegales?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrganizationDto {
  nom: string;
  slug: string;
  planId: string;
  actif?: boolean;
  maxUsers?: number;
  maxArticles?: number;
  abonnementExpire?: string;
  nomCourt?: string;
  slogan?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  devise?: string;
}

export interface UpdateOrganizationDto {
  nom?: string;
  slug?: string;
  planId?: string;
  actif?: boolean;
  maxUsers?: number;
  maxArticles?: number;
  abonnementExpire?: string;
  nomCourt?: string;
  slogan?: string;
  logo?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  siteWeb?: string;
  rccm?: string;
  nif?: string;
  devise?: string;
  mentionsLegales?: string;
}

// Types pour l'authentification et Users
export interface User {
  id: string;
  email: string;
  nom: string;
  roleId?: string;
  role?: Role;
  organizationId?: string; // NULL pour SUPER_ADMIN
  organization?: Organization; // Relation optionnelle
  isSuperAdmin: boolean;
  mustChangePassword?: boolean; // Forcer le changement de mot de passe
  actif: boolean;
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
  photo?: string; // Chemin relatif de la photo
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
  photo?: string;
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

// Types pour les Commandes Client
export interface LigneCommande {
  articleId: string;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export interface Commande {
  id: string;
  numero: string;
  clientId: string;
  lignes: LigneCommande[];
  total: number;
  acompte: number;
  montantRestant: number;
  statut: 'en_attente' | 'livree' | 'annulee';
  dateLivraison?: string;
  dateLivree?: string;
  venteId?: string;
  note?: string;
  userId: string;
  userNom: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCommandeDto {
  clientId: string;
  lignes: LigneCommande[];
  total: number;
  acompte?: number;
  montantRestant?: number;
  dateLivraison?: string;
  note?: string;
}

export interface LivrerCommandeDto {
  montantPaye: number;
  modePaiement: 'especes' | 'mobile_money' | 'virement' | 'credit' | 'acompte_50';
  note?: string;
}

export interface CommandeFilterParams extends PaginationParams {
  statut?: 'en_attente' | 'livree' | 'annulee';
  clientId?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface StatsCommandes {
  total: number;
  enAttente: number;
  livrees: number;
  annulees: number;
  totalAcomptes: number;
  valeurEnAttente: number;
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

// Types pour le Dashboard SUPER_ADMIN
export interface GlobalStats {
  totalOrganizations: number;
  activeOrganizations: number;
  inactiveOrganizations: number;
  totalUsers: number; // Hors super admins
  totalVentes: number;
  totalClients: number;
  totalArticles: number;
}

export interface OrganizationsByPlan {
  plan: string;
  planCode: string;
  count: number;
}

export interface GrowthStats {
  organizations: {
    thisMonth: number;
    lastMonth: number;
    growth: number; // Pourcentage
  };
  users: {
    thisMonth: number;
    lastMonth: number;
    growth: number; // Pourcentage
  };
}

export interface OrganizationDetails {
  organization: Organization;
  stats: {
    totalUsers: number;
    totalVentes: number;
    totalClients: number;
    totalArticles: number;
    chiffreAffaires: number;
  };
  recentVentes: Array<{
    id: string;
    numero: string;
    date: string;
    total: number;
    clientNom?: string;
  }>;
}

export interface RecentActivity {
  recentOrganizations: Organization[];
  recentUsers: Array<User & {
    organizationNom?: string;
    roleNom?: string;
  }>;
}

// Types pour les Retours Clients
export interface LigneRetourClient {
  articleId: string;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  raison?: 'defectueux' | 'taille_incorrecte' | 'couleur_incorrecte' | 'erreur_commande' | 'non_conforme' | 'qualite_insuffisante' | 'changement_avis' | 'autre';
  noteArticle?: string;
}

export interface RetourClient {
  id: string;
  numero?: string;
  venteId: string;
  venteNumero?: string;
  clientId?: string;
  clientNom?: string;
  lignes: LigneRetourClient[];
  total: number;
  modeRemboursement: 'especes' | 'mobile_money' | 'virement' | 'credit_compte';
  note?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRetourClientDto {
  venteId: string;
  lignes: LigneRetourClient[];
  total: number;
  modeRemboursement: 'especes' | 'mobile_money' | 'virement' | 'credit_compte';
  note?: string;
}

// Types pour les Retours Fournisseurs
export interface LigneRetourFournisseur {
  articleId: string;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  raison?: 'defectueux' | 'taille_incorrecte' | 'couleur_incorrecte' | 'erreur_commande' | 'non_conforme' | 'qualite_insuffisante' | 'changement_avis' | 'autre';
  noteArticle?: string;
}

export interface RetourFournisseur {
  id: string;
  numero?: string;
  approvisionnementId: string;
  approvisionnementNumero?: string;
  fournisseurId?: string;
  fournisseurNom?: string;
  lignes: LigneRetourFournisseur[];
  total: number;
  remboursementRecu?: boolean;
  montantRembourse?: number;
  note?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRetourFournisseurDto {
  approvisionnementId: string;
  lignes: LigneRetourFournisseur[];
  total: number;
  remboursementRecu?: boolean;
  montantRembourse?: number;
  note?: string;
}

// Types pour les Inventaires
export type StatutInventaire = 'EN_COURS' | 'TERMINE';

export interface StatistiquesInventaire {
  articlesManquants: number;
  articlesSurplus: number;
  valeurPertes: number;
  valeurSurplus: number;
  valeurNetteEcart: number;
}

export interface Inventaire {
  id: string;
  organizationId: string;
  date: string;
  statut: StatutInventaire;
  note?: string;
  totalArticles: number;
  articlesComptes: number;
  articlesAvecEcarts: number;
  responsableId?: string;
  responsableNom?: string;
  termineLe?: string;
  comptages?: ComptageInventaire[];
  statistiques?: StatistiquesInventaire;

  // Champs financiers
  dateDebut?: string;
  dateFin?: string;
  dureeJours?: number;
  chiffreAffaires?: number;
  nombreVentes?: number;
  panierMoyen?: number;
  coutMarchandises?: number;
  beneficeBrut?: number;
  tauxMarge?: number;
  depensesFixes?: number;
  depensesVariables?: number;
  depensesExceptionnelles?: number;
  totalDepenses?: number;
  valeurArticlesManquants?: number;
  valeurArticlesAbimes?: number;
  totalPertes?: number;
  beneficeNet?: number;
  tauxRentabilite?: number;
  estBeneficiaire?: boolean;
  financesCalcules?: boolean;
  financesCalculesLe?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ComptageInventaire {
  id: string;
  inventaireId: string;
  articleId: string;
  articleNom: string;
  quantiteSysteme: number;
  quantiteComptee: number;
  ecart: number;
  note?: string;
  comptePar?: string;
  createdAt: string;
  article?: Article;
}

export interface CreateInventaireDto {
  date?: string;
  note?: string;
}

export interface AddComptageDto {
  articleId: string;
  quantiteComptee: number;
  note?: string;
}

// Types pour les Dépenses
export enum TypeDepense {
  LOYER = 'LOYER',
  TRANSPORT = 'TRANSPORT',
  SALAIRES = 'SALAIRES',
  ELECTRICITE = 'ELECTRICITE',
  EAU = 'EAU',
  INTERNET = 'INTERNET',
  TELEPHONE = 'TELEPHONE',
  FOURNITURES = 'FOURNITURES',
  MAINTENANCE = 'MAINTENANCE',
  ASSURANCE = 'ASSURANCE',
  TAXES = 'TAXES',
  MARKETING = 'MARKETING',
  EMBALLAGE = 'EMBALLAGE',
  AUTRE = 'AUTRE',
}

export enum CategorieDepense {
  FIXE = 'FIXE',
  VARIABLE = 'VARIABLE',
  EXCEPTIONNELLE = 'EXCEPTIONNELLE',
}

export const typeDepenseLabels: Record<TypeDepense, string> = {
  [TypeDepense.LOYER]: 'Loyer',
  [TypeDepense.TRANSPORT]: 'Transport',
  [TypeDepense.SALAIRES]: 'Salaires',
  [TypeDepense.ELECTRICITE]: 'Électricité',
  [TypeDepense.EAU]: 'Eau',
  [TypeDepense.INTERNET]: 'Internet',
  [TypeDepense.TELEPHONE]: 'Téléphone',
  [TypeDepense.FOURNITURES]: 'Fournitures',
  [TypeDepense.MAINTENANCE]: 'Maintenance',
  [TypeDepense.ASSURANCE]: 'Assurance',
  [TypeDepense.TAXES]: 'Taxes',
  [TypeDepense.MARKETING]: 'Marketing',
  [TypeDepense.EMBALLAGE]: 'Emballage',
  [TypeDepense.AUTRE]: 'Autre',
};

export const categorieDepenseLabels: Record<CategorieDepense, string> = {
  [CategorieDepense.FIXE]: 'Fixe',
  [CategorieDepense.VARIABLE]: 'Variable',
  [CategorieDepense.EXCEPTIONNELLE]: 'Exceptionnelle',
};

/**
 * Mapping automatique entre type et catégorie de dépense
 */
export const typeToCategorieMap: Record<TypeDepense, CategorieDepense> = {
  // Dépenses fixes (mensuelles/récurrentes)
  [TypeDepense.LOYER]: CategorieDepense.FIXE,
  [TypeDepense.SALAIRES]: CategorieDepense.FIXE,
  [TypeDepense.ELECTRICITE]: CategorieDepense.FIXE,
  [TypeDepense.EAU]: CategorieDepense.FIXE,
  [TypeDepense.INTERNET]: CategorieDepense.FIXE,
  [TypeDepense.TELEPHONE]: CategorieDepense.FIXE,
  [TypeDepense.ASSURANCE]: CategorieDepense.FIXE,
  [TypeDepense.TAXES]: CategorieDepense.FIXE,
  // Dépenses variables (occasionnelles)
  [TypeDepense.TRANSPORT]: CategorieDepense.VARIABLE,
  [TypeDepense.FOURNITURES]: CategorieDepense.VARIABLE,
  [TypeDepense.EMBALLAGE]: CategorieDepense.VARIABLE,
  [TypeDepense.MARKETING]: CategorieDepense.VARIABLE,
  // Dépenses exceptionnelles (ponctuelles)
  [TypeDepense.MAINTENANCE]: CategorieDepense.EXCEPTIONNELLE,
  [TypeDepense.AUTRE]: CategorieDepense.EXCEPTIONNELLE,
};

export interface Depense {
  id: string;
  organizationId: string;
  type: TypeDepense;
  categorie: CategorieDepense;
  montant: number;
  description?: string;
  date: string;
  reference?: string;
  userId?: string;
  userNom?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepenseDto {
  type: TypeDepense;
  categorie: CategorieDepense;
  montant: number;
  description?: string;
  date: string;
  reference?: string;
}

export interface UpdateDepenseDto extends Partial<CreateDepenseDto> {}

export interface DepenseFilterParams extends PaginationParams {
  dateDebut?: string;
  dateFin?: string;
  type?: TypeDepense;
  categorie?: CategorieDepense;
}

export interface DepenseStats {
  totalDepenses: number;
  depensesFixes: number;
  depensesVariables: number;
  depensesExceptionnelles: number;
  nombreDepenses: number;
  depenseMoyenne: number;
  repartitionParType: Array<{
    type: string;
    montant: number;
    pourcentage: number;
  }>;
}
