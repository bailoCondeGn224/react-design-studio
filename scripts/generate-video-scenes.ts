import { chromium, Browser, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

// ============================================================================
// Génération vidéo promotionnelle — capture animée de l'app en production.
//
//   - UNE SEULE session Chrome connectée du début à la fin (auth garantie).
//   - Connexion vérifiée (token présent) avant de commencer.
//   - Attente réelle de la fin de chargement des données à chaque page.
//   - Zoom "Ken Burns" sur les chiffres/infos importants.
//   - Plein écran PC 1920x1080, scrollbars masquées (pas de débordement).
//
// ⚠️ Lecture seule : on n'appuie jamais sur "Enregistrer/Valider".
// ============================================================================

const BASE_URL = 'https://walliindustrie.com';
const OUTPUT_DIR = path.join(process.cwd(), 'documentation', 'video-scenes');
const VIEWPORT = { width: 1920, height: 1080 };
const NAV_TIMEOUT = 120000;

const CREDENTIALS = {
  email: 'bailo.conde@gmail.com',
  password: 'Conde@623',
};

// --- Injecté dans chaque page : curseur factice + masquage scrollbars -----

const INJECT_SCRIPT = `
(function () {
  // Masquer les scrollbars pour un rendu "mode PC" propre, sans bande grise.
  if (!document.getElementById('__demo-style')) {
    var st = document.createElement('style');
    st.id = '__demo-style';
    st.textContent =
      '::-webkit-scrollbar{width:0!important;height:0!important;display:none!important}' +
      'html,body{scrollbar-width:none!important;-ms-overflow-style:none!important;overflow-x:hidden!important}' +
      'body{transition:transform 1s cubic-bezier(0.22,1,0.36,1);transform-origin:50% 50%}';
    document.head.appendChild(st);
  }
  if (window.__demoRig) return;
  window.__demoRig = true;
  var cursor = document.createElement('div');
  cursor.id = '__demo-cursor';
  var s = cursor.style;
  s.position = 'fixed'; s.top = '0'; s.left = '0';
  s.width = '22px'; s.height = '22px'; s.borderRadius = '50%';
  s.background = 'rgba(34,197,94,0.9)';
  s.boxShadow = '0 0 0 6px rgba(34,197,94,0.25), 0 2px 8px rgba(0,0,0,0.4)';
  s.pointerEvents = 'none'; s.zIndex = '2147483647';
  s.transform = 'translate(-50%, -50%)';
  s.transition = 'left 0.3s ease, top 0.3s ease';
  document.documentElement.appendChild(cursor);
  window.__demoCursor = cursor;
})();
`;

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function inject(page: Page) {
  await page.evaluate(INJECT_SCRIPT).catch(() => {});
}

async function moveCursorTo(page: Page, x: number, y: number, steps = 16) {
  await page.mouse.move(x, y, { steps });
  await page.evaluate(
    ([x, y]) => {
      const c = (window as any).__demoCursor as HTMLElement | undefined;
      if (c) { c.style.left = x + 'px'; c.style.top = y + 'px'; }
    },
    [x, y] as [number, number],
  );
}

/** Attend la fin réelle du chargement : plus de spinner "Chargement", réseau calme. */
async function waitForDataLoaded(page: Page) {
  // 1) attendre que le texte "Chargement de la page" disparaisse s'il existe
  await page
    .waitForFunction(
      () => !document.body.innerText.includes('Chargement de la page'),
      { timeout: 40000 },
    )
    .catch(() => {});
  // 2) laisser le réseau se calmer
  await page.waitForLoadState('networkidle', { timeout: 40000 }).catch(() => {});
  // 3) petite marge pour les animations d'apparition
  await page.waitForTimeout(1800);
}

/** Zoom Ken Burns vers le centre d'un élément trouvé par texte (sinon skip). */
async function zoomToText(page: Page, candidates: string[], scale: number, holdMs: number) {
  let box: { x: number; y: number; width: number; height: number } | null = null;
  for (const text of candidates) {
    const loc = page.locator(`text=${text}`).first();
    // recherche courte : ne jamais attendre 120s si le texte n'existe pas
    try {
      await loc.waitFor({ state: 'visible', timeout: 3000 });
      box = await loc.boundingBox();
      if (box) break;
    } catch {
      // texte absent, on essaie le candidat suivant
    }
  }
  if (!box) {
    await page.waitForTimeout(holdMs);
    return;
  }
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await moveCursorTo(page, cx, cy);
  await page.waitForTimeout(400);
  await page.evaluate(
    ([cx, cy, scale, vw, vh]) => {
      const ox = (cx / vw) * 100;
      const oy = (cy / vh) * 100;
      document.body.style.transformOrigin = ox + '% ' + oy + '%';
      document.body.style.transform = 'scale(' + scale + ')';
    },
    [cx, cy, scale, VIEWPORT.width, VIEWPORT.height] as [number, number, number, number, number],
  );
  await page.waitForTimeout(1000 + holdMs);
  await page.evaluate(() => { document.body.style.transform = 'scale(1)'; });
  await page.waitForTimeout(1000);
}

async function smoothScroll(page: Page, passes: number, perStepMs: number) {
  const midX = VIEWPORT.width * 0.55;
  const midY = VIEWPORT.height * 0.5;
  for (let i = 0; i < passes; i++) {
    await moveCursorTo(page, midX, midY, 4);
    await page.mouse.wheel(0, 340);
    await page.waitForTimeout(perStepMs);
  }
  // remonter en haut proprement
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1000);
}

/** Ouvre un dialogue de création pour le montrer, sans jamais soumettre. */
async function openDialog(page: Page, buttonText: string, showMs: number) {
  const btn = page.locator(`button:has-text("${buttonText}")`).first();
  let box: { x: number; y: number; width: number; height: number } | null = null;
  try {
    await btn.waitFor({ state: 'visible', timeout: 8000 });
    box = await btn.boundingBox();
  } catch {
    box = null;
  }
  if (!box) {
    console.log(`    (bouton "${buttonText}" absent, on montre la liste)`);
    await smoothScroll(page, 3, 900);
    return;
  }
  await moveCursorTo(page, box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(600);
  await btn.click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1500); // laisser le dialogue s'ouvrir/charger
  await page.waitForTimeout(showMs);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(900);
}

async function gotoRobust(page: Page, route: string) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await inject(page);
      return true;
    } catch (e) {
      console.log(`    ↻ réseau lent sur ${route}, tentative ${attempt}/4...`);
      await page.waitForTimeout(3000);
    }
  }
  console.log(`    ⚠️  impossible de charger ${route}, on passe.`);
  return false;
}

// --- Définition des scènes ------------------------------------------------

interface Scene {
  title: string;
  route: string;
  openButton?: string;      // ouvre un dialogue (jamais soumis)
  zoom?: string[];          // textes à cibler pour un zoom
  zoomScale?: number;
  scroll?: number;
  holdMs: number;
}

const scenes: Scene[] = [
  { title: '01 · Accroche',              route: '/',                     scroll: 2, holdMs: 4000 },
  { title: '02 · Analytics / Valeur',    route: '/analytics',            zoom: ['Valeur du Stock', 'Répartition du Stock'], zoomScale: 1.45, holdMs: 3500 },
  { title: '03 · Dette fournisseurs',    route: '/fournisseurs',         zoom: ['DETTE TOTALE', 'Dette totale', 'Dette'], zoomScale: 1.4, holdMs: 3500 },
  { title: '04 · Dette clients',         route: '/clients',              zoom: ['Crédit', 'Dette', 'Total'], zoomScale: 1.4, holdMs: 3500 },
  { title: '05 · Inventaire',            route: '/inventaires',          scroll: 4, holdMs: 4500 },
  { title: '06 · Vente',                 route: '/ventes',               openButton: 'Nouvelle Vente', holdMs: 8000 },
  { title: '07 · Zakat',                 route: '/zakat',                zoom: ['Zakat', 'Montant', 'Total'], zoomScale: 1.4, holdMs: 4000 },
  { title: '08 · Stock',                 route: '/stock',                scroll: 4, holdMs: 4000 },
  { title: '09 · Versement fournisseur', route: '/versements',           openButton: 'Enregistrer un Versement', holdMs: 6500 },
  { title: '10 · Paiement client',       route: '/versements-client',    openButton: 'Enregistrer un Paiement', holdMs: 6500 },
  { title: '11 · Retour client',         route: '/retours-clients',      openButton: 'Nouveau Retour', holdMs: 6500 },
  { title: '12 · Retour fournisseur',    route: '/retours-fournisseurs', openButton: 'Nouveau Retour', holdMs: 6500 },
  { title: '13 · Dépense',               route: '/depenses',             openButton: 'Nouvelle Dépense', holdMs: 6500 },
  { title: '14 · Final',                 route: '/',                     scroll: 2, holdMs: 5000 },
];

// --- Connexion vérifiée ---------------------------------------------------

async function login(page: Page) {
  console.log('🔑 Connexion à la production...');
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.waitForSelector('input[type="email"]', { timeout: 30000 });
      await page.fill('input[type="email"]', CREDENTIALS.email);
      await page.fill('input[type="password"]', CREDENTIALS.password);
      await page.click('button[type="submit"]');
      await page.waitForFunction(() => !!localStorage.getItem('access_token'), { timeout: 60000 });
      const token = await page.evaluate(() => localStorage.getItem('access_token'));
      if (token) {
        console.log('✅ Connexion vérifiée (token présent).');
        await inject(page);
        return true;
      }
    } catch (e) {
      console.log(`  ⚠️  Échec connexion (tentative ${attempt}/5): ${(e as Error).message.split('\n')[0]}`);
      await page.waitForTimeout(4000);
    }
  }
  throw new Error('Connexion impossible après 5 tentatives.');
}

async function playScene(page: Page, scene: Scene) {
  console.log(`🎬 ${scene.title}`);
  const ok = await gotoRobust(page, scene.route);
  if (!ok) return;

  await waitForDataLoaded(page);

  const onLogin = await page.evaluate(() => location.pathname.includes('/login'));
  if (onLogin) {
    console.log('    ⚠️  session perdue, reconnexion...');
    await login(page);
    await gotoRobust(page, scene.route);
    await waitForDataLoaded(page);
  }

  if (scene.openButton) {
    await openDialog(page, scene.openButton, scene.holdMs);
  } else if (scene.zoom) {
    await smoothScroll(page, 1, 700);
    await zoomToText(page, scene.zoom, scene.zoomScale ?? 1.4, scene.holdMs);
  } else {
    await smoothScroll(page, scene.scroll ?? 3, Math.floor(scene.holdMs / ((scene.scroll ?? 3) + 1)));
    await page.waitForTimeout(1000);
  }
}

async function main() {
  console.log('🚀 Génération vidéo (production, session connectée, mode PC)\n');
  await ensureDir(OUTPUT_DIR);

  // Mode headless : contenu pixel-parfait en 1920x1080, aucune bande grise,
  // et pas de fenêtre visible qu'on pourrait fermer par accident.
  const browser: Browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: [
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--force-color-profile=srgb',
    ],
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    recordVideo: { dir: OUTPUT_DIR, size: VIEWPORT },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(NAV_TIMEOUT);
  page.setDefaultNavigationTimeout(NAV_TIMEOUT);

  try {
    await login(page);
    for (const scene of scenes) {
      await playScene(page, scene);
    }
    console.log('\n✅ Parcours terminé, finalisation de la vidéo...');
  } catch (error) {
    console.error('\n❌ Erreur:', (error as Error).message);
  } finally {
    const video = page.video();
    await context.close();
    if (video) {
      const tmp = await video.path();
      const finalPath = path.join(OUTPUT_DIR, 'walli-demo-complete.webm');
      if (fs.existsSync(tmp)) {
        fs.renameSync(tmp, finalPath);
        console.log(`\n🎥 Vidéo complète : ${finalPath}`);
      }
    }
    await browser.close();
  }
}

main();
