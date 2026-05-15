/**
 * Configuration pour la génération automatique de documentation
 *
 * Copiez ce fichier en config.ts et modifiez les valeurs selon vos besoins
 */

export const config = {
  // Identifiants de connexion
  credentials: {
    email: 'babaniservice@dubi.com',
    password: 'Babani@123'
  },

  // URL de l'application
  baseUrl: 'http://localhost:5173',

  // Dossiers de sortie
  output: {
    screenshotsDir: 'documentation/screenshots',
    pdfPath: 'documentation/Guide-Utilisateur-Walli-Industrie.pdf'
  },

  // Configuration du navigateur Playwright
  browser: {
    headless: false,  // true = mode invisible, false = voir le navigateur
    slowMo: 50,       // Ralentissement en ms pour mieux voir (0 = pleine vitesse)
    viewport: {
      width: 1920,
      height: 1080
    }
  },

  // Délais d'attente (en millisecondes)
  timeouts: {
    pageLoad: 2000,      // Attente après chargement de page
    dialogOpen: 1500,    // Attente après ouverture de dialog
    beforeScreenshot: 1000  // Attente avant capture d'écran
  },

  // Configuration du PDF
  pdf: {
    orientation: 'portrait' as const,
    format: 'a4' as const,
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    },
    // Informations de couverture
    cover: {
      title: 'GUIDE UTILISATEUR',
      appName: 'Gestion Boutique',
      company: 'WALLI INDUSTRIE',
      version: '1.0'
    }
  },

  // Pages à capturer (ordre d'apparition dans le PDF)
  pages: [
    // Pages Vendeurs
    {
      route: '/',
      name: '01-dashboard-principal',
      description: 'Tableau de bord principal - Vue d\'ensemble des statistiques clés',
      category: 'vendeur' as const
    },
    {
      route: '/clients',
      name: '02-liste-clients',
      description: 'Gestion des clients - Liste complète avec recherche et filtres',
      category: 'vendeur' as const
    },
    {
      route: '/ventes',
      name: '04-liste-ventes',
      description: 'Registre des ventes - Toutes les ventes avec statistiques mensuelles',
      category: 'vendeur' as const
    },
    {
      route: '/stock',
      name: '06-gestion-stock',
      description: 'Gestion du stock - Liste des articles avec alertes',
      category: 'vendeur' as const
    },
    {
      route: '/commandes',
      name: '08-commandes-clients',
      description: 'Gestion des commandes clients - Suivi des commandes',
      category: 'vendeur' as const
    },
    {
      route: '/versements-client',
      name: '09-versements-clients',
      description: 'Paiements clients - Gestion des crédits et paiements',
      category: 'vendeur' as const
    },

    // Pages Administrateurs
    {
      route: '/fournisseurs',
      name: '10-fournisseurs',
      description: 'Gestion des fournisseurs - Liste avec dettes et statistiques',
      category: 'admin' as const
    },
    {
      route: '/approvisionnements',
      name: '11-approvisionnements',
      description: 'Gestion des approvisionnements - Achats auprès des fournisseurs',
      category: 'admin' as const
    },
    {
      route: '/versements',
      name: '12-versements-fournisseurs',
      description: 'Paiements fournisseurs - Gestion des dettes fournisseurs',
      category: 'admin' as const
    },
    {
      route: '/categories',
      name: '13-categories',
      description: 'Gestion des catégories d\'articles',
      category: 'admin' as const
    },
    {
      route: '/zones',
      name: '14-zones-stockage',
      description: 'Gestion des zones de stockage',
      category: 'admin' as const
    },
    {
      route: '/inventaires',
      name: '15-inventaires',
      description: 'Gestion des inventaires - Comptage et vérification du stock',
      category: 'admin' as const
    },
    {
      route: '/mouvements-stock',
      name: '16-mouvements-stock',
      description: 'Historique des mouvements de stock',
      category: 'admin' as const
    },
    {
      route: '/depenses',
      name: '17-depenses',
      description: 'Gestion des dépenses - Loyer, salaires, utilities, etc.',
      category: 'admin' as const
    },
    {
      route: '/analytics',
      name: '18-analytics',
      description: 'Tableau analytique - Vue complète des indicateurs clés',
      category: 'admin' as const
    },
    {
      route: '/retours-clients',
      name: '19-retours-clients',
      description: 'Gestion des retours clients',
      category: 'admin' as const
    },
    {
      route: '/retours-fournisseurs',
      name: '20-retours-fournisseurs',
      description: 'Gestion des retours fournisseurs',
      category: 'admin' as const
    },
    {
      route: '/utilisateurs',
      name: '21-utilisateurs',
      description: 'Gestion des utilisateurs - Équipe et rôles',
      category: 'admin' as const
    },
    {
      route: '/roles',
      name: '22-roles-permissions',
      description: 'Rôles et permissions - Configuration des accès',
      category: 'admin' as const
    },
    {
      route: '/admin/dashboard',
      name: '23-dashboard-admin',
      description: 'Tableau de bord administrateur - Graphiques et statistiques détaillées',
      category: 'admin' as const
    }
  ],

  // Dialogues à capturer (nécessitent une interaction)
  dialogs: [
    {
      parentRoute: '/clients',
      buttonText: 'Nouveau client',
      name: '03-formulaire-client',
      description: 'Formulaire de création d\'un nouveau client',
      category: 'vendeur' as const
    },
    {
      parentRoute: '/ventes',
      buttonText: 'Nouvelle vente',
      name: '05-formulaire-vente',
      description: 'Formulaire de création d\'une nouvelle vente',
      category: 'vendeur' as const
    },
    {
      parentRoute: '/stock',
      buttonText: 'Nouvel article',
      name: '07-formulaire-article',
      description: 'Formulaire de création d\'un article',
      category: 'admin' as const
    }
  ]
};

export default config;
