import { chromium, Browser, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOTS_DIR = path.join(process.cwd(), 'documentation', 'screenshots');
const BASE_URL = 'http://localhost:8081';

// Credentials pour se connecter
const USER_CREDENTIALS = {
  email: 'babaniservice@dubi.com',
  password: 'Babani@123'
};

interface Screenshot {
  name: string;
  description: string;
  path: string;
  category: 'vendeur' | 'admin' | 'super-admin';
}

const screenshots: Screenshot[] = [];

async function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function login(page: Page) {
  console.log('Connexion à l\'application...');
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  // Remplir le formulaire de connexion
  await page.fill('input[type="email"]', USER_CREDENTIALS.email);
  await page.fill('input[type="password"]', USER_CREDENTIALS.password);

  // Cliquer sur le bouton de connexion
  await page.click('button[type="submit"]');

  // Attendre la redirection (peut être vers / ou /admin/dashboard)
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Attendre que les données se chargent

  console.log('Connexion réussie !');
}

async function takeScreenshot(
  page: Page,
  name: string,
  description: string,
  category: 'vendeur' | 'admin' | 'super-admin'
) {
  const filename = `${name}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);

  // Attendre que la page soit stable
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Prendre la capture d'écran
  await page.screenshot({
    path: filepath,
    fullPage: true
  });

  screenshots.push({
    name,
    description,
    path: filepath,
    category
  });

  console.log(`✓ Capture: ${name} (${category})`);
}

async function capturePageEcran(page: Page) {
  console.log('\n=== CAPTURES D\'ÉCRAN POUR VENDEURS ===\n');

  // 1. Dashboard principal
  await page.goto(`${BASE_URL}/`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await takeScreenshot(
    page,
    '01-dashboard-principal',
    'Tableau de bord principal - Vue d\'ensemble des statistiques clés',
    'vendeur'
  );

  // 2. Liste des clients
  await page.goto(`${BASE_URL}/clients`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '02-liste-clients',
    'Gestion des clients - Liste complète avec recherche et filtres',
    'vendeur'
  );

  // 3. Formulaire création client (ouvrir le dialog)
  try {
    await page.click('button:has-text("Nouveau client")').catch(() =>
      page.click('button:has-text("Ajouter")').catch(() =>
        page.click('button:has-text("Créer")')
      )
    );
    await page.waitForTimeout(1000);
    await takeScreenshot(
      page,
      '03-formulaire-client',
      'Formulaire de création d\'un nouveau client',
      'vendeur'
    );
    await page.press('body', 'Escape'); // Fermer le dialog
    await page.waitForTimeout(500);
  } catch (e) {
    console.log('Formulaire client non accessible...');
  }

  // 4. Liste des ventes
  await page.goto(`${BASE_URL}/ventes`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '04-liste-ventes',
    'Registre des ventes - Toutes les ventes avec statistiques mensuelles',
    'vendeur'
  );

  // 5. Formulaire création vente
  try {
    await page.click('button:has-text("Nouvelle vente")').catch(() =>
      page.click('button:has-text("Ajouter")').catch(() =>
        page.click('button:has-text("Créer")')
      )
    );
    await page.waitForTimeout(1500);
    await takeScreenshot(
      page,
      '05-formulaire-vente',
      'Formulaire de création d\'une nouvelle vente',
      'vendeur'
    );
    await page.press('body', 'Escape');
    await page.waitForTimeout(500);
  } catch (e) {
    console.log('Formulaire vente non accessible...');
  }

  // 6. Gestion du stock
  await page.goto(`${BASE_URL}/stock`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '06-gestion-stock',
    'Gestion du stock - Liste des articles avec alertes',
    'vendeur'
  );

  // 7. Formulaire article
  try {
    await page.click('button:has-text("Nouvel article")').catch(() =>
      page.click('button:has-text("Ajouter")').catch(() =>
        page.click('button:has-text("Créer")')
      )
    );
    await page.waitForTimeout(1500);
    await takeScreenshot(
      page,
      '07-formulaire-article',
      'Formulaire de création d\'un article',
      'admin'
    );
    await page.press('body', 'Escape');
    await page.waitForTimeout(500);
  } catch (e) {
    console.log('Formulaire article non accessible...');
  }

  // 8. Commandes clients
  await page.goto(`${BASE_URL}/commandes`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '08-commandes-clients',
    'Gestion des commandes clients - Suivi des commandes',
    'vendeur'
  );

  // 9. Versements clients
  await page.goto(`${BASE_URL}/versements-client`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '09-versements-clients',
    'Paiements clients - Gestion des crédits et paiements',
    'vendeur'
  );

  console.log('\n=== CAPTURES D\'ÉCRAN POUR ADMINISTRATEURS ===\n');

  // 10. Fournisseurs
  await page.goto(`${BASE_URL}/fournisseurs`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '10-fournisseurs',
    'Gestion des fournisseurs - Liste avec dettes et statistiques',
    'admin'
  );

  // 11. Approvisionnements
  await page.goto(`${BASE_URL}/approvisionnements`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '11-approvisionnements',
    'Gestion des approvisionnements - Achats auprès des fournisseurs',
    'admin'
  );

  // 12. Versements fournisseurs
  await page.goto(`${BASE_URL}/versements`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '12-versements-fournisseurs',
    'Paiements fournisseurs - Gestion des dettes fournisseurs',
    'admin'
  );

  // 13. Catégories
  await page.goto(`${BASE_URL}/categories`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '13-categories',
    'Gestion des catégories d\'articles',
    'admin'
  );

  // 14. Zones de stockage
  await page.goto(`${BASE_URL}/zones`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '14-zones-stockage',
    'Gestion des zones de stockage',
    'admin'
  );

  // 15. Inventaires
  await page.goto(`${BASE_URL}/inventaires`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '15-inventaires',
    'Gestion des inventaires - Comptage et vérification du stock',
    'admin'
  );

  // 16. Mouvements stock
  await page.goto(`${BASE_URL}/mouvements-stock`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '16-mouvements-stock',
    'Historique des mouvements de stock',
    'admin'
  );

  // 17. Dépenses
  await page.goto(`${BASE_URL}/depenses`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '17-depenses',
    'Gestion des dépenses - Loyer, salaires, utilities, etc.',
    'admin'
  );

  // 18. Analytics
  await page.goto(`${BASE_URL}/analytics`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '18-analytics',
    'Tableau analytique - Vue complète des indicateurs clés',
    'admin'
  );

  // 19. Retours clients
  await page.goto(`${BASE_URL}/retours-clients`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '19-retours-clients',
    'Gestion des retours clients',
    'admin'
  );

  // 20. Retours fournisseurs
  await page.goto(`${BASE_URL}/retours-fournisseurs`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '20-retours-fournisseurs',
    'Gestion des retours fournisseurs',
    'admin'
  );

  // 21. Utilisateurs
  await page.goto(`${BASE_URL}/utilisateurs`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '21-utilisateurs',
    'Gestion des utilisateurs - Équipe et rôles',
    'admin'
  );

  // 22. Rôles et permissions
  await page.goto(`${BASE_URL}/roles`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await takeScreenshot(
    page,
    '22-roles-permissions',
    'Rôles et permissions - Configuration des accès',
    'admin'
  );

  // 23. Dashboard admin
  await page.goto(`${BASE_URL}/admin/dashboard`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await takeScreenshot(
    page,
    '23-dashboard-admin',
    'Tableau de bord administrateur - Graphiques et statistiques détaillées',
    'admin'
  );

  console.log('\n=== CAPTURES D\'ÉCRAN SUPER ADMIN ===\n');

  // 24. Dashboard super admin
  try {
    await page.goto(`${BASE_URL}/super-admin/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await takeScreenshot(
      page,
      '24-super-admin-dashboard',
      'Dashboard Super Admin - Vue plateforme',
      'super-admin'
    );
  } catch (e) {
    console.log('Accès super admin non disponible avec ce compte');
  }

  // 25. Organisations
  try {
    await page.goto(`${BASE_URL}/super-admin/organizations`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await takeScreenshot(
      page,
      '25-super-admin-organizations',
      'Gestion des organisations - Configuration boutiques',
      'super-admin'
    );
  } catch (e) {
    console.log('Accès organisations non disponible');
  }
}

async function generateIndex() {
  const indexPath = path.join(SCREENSHOTS_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(screenshots, null, 2));
  console.log(`\n✓ Index généré: ${indexPath}`);

  // Générer aussi un fichier markdown récapitulatif
  const mdPath = path.join(SCREENSHOTS_DIR, 'README.md');
  let mdContent = '# Captures d\'écran - Documentation Application\n\n';

  const categories = {
    'vendeur': 'Fonctionnalités Vendeurs/Employés',
    'admin': 'Fonctionnalités Administrateurs',
    'super-admin': 'Fonctionnalités Super Administrateurs'
  };

  Object.entries(categories).forEach(([cat, title]) => {
    const catScreenshots = screenshots.filter(s => s.category === cat);
    if (catScreenshots.length > 0) {
      mdContent += `## ${title}\n\n`;
      catScreenshots.forEach(s => {
        mdContent += `### ${s.name}\n`;
        mdContent += `${s.description}\n\n`;
        mdContent += `![${s.name}](${path.basename(s.path)})\n\n`;
      });
    }
  });

  fs.writeFileSync(mdPath, mdContent);
  console.log(`✓ README généré: ${mdPath}`);
}

async function main() {
  console.log('🚀 Démarrage de la génération des captures d\'écran...\n');
  console.log(`URL de base: ${BASE_URL}`);
  console.log(`Dossier de sortie: ${SCREENSHOTS_DIR}\n`);

  // Créer le dossier screenshots
  await ensureDirectoryExists(SCREENSHOTS_DIR);

  // Lancer le navigateur
  const browser = await chromium.launch({
    headless: false, // Mettre à true pour exécution en arrière-plan
    slowMo: 50
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // Se connecter
    await login(page);

    // Capturer toutes les pages
    await capturePageEcran(page);

    // Générer l'index
    await generateIndex();

    console.log('\n✅ Génération terminée !');
    console.log(`\n📸 ${screenshots.length} captures d'écran générées dans ${SCREENSHOTS_DIR}`);

  } catch (error) {
    console.error('\n❌ Erreur lors de la génération:', error);
  } finally {
    await browser.close();
  }
}

main();
