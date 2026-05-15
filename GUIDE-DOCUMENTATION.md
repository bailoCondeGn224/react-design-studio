# Guide Rapide - Génération Documentation PDF

Ce guide vous explique comment générer automatiquement un PDF de documentation utilisateur avec captures d'écran pour l'application Gestion Boutique Walli Industrie.

## Étapes Rapides

### 1. Démarrer l'application

Dans un terminal, lancez l'application :

```bash
npm run dev
```

L'application devrait s'ouvrir sur http://localhost:5173

### 2. Générer la documentation

Dans un **nouveau terminal** (gardez l'application qui tourne), exécutez :

**Sur Windows :**
```bash
scripts\generate-documentation.bat
```

**Sur Linux/Mac :**
```bash
chmod +x scripts/generate-documentation.sh
./scripts/generate-documentation.sh
```

**Ou via npm :**
```bash
npm run generate:docs
```

### 3. Récupérer le PDF

Le fichier PDF sera généré dans :
```
documentation/Guide-Utilisateur-Walli-Industrie.pdf
```

## Comment ça marche ?

Le système fonctionne en 2 étapes :

### Étape 1 : Génération des captures d'écran (Playwright)
- Se connecte automatiquement à l'application avec vos identifiants
- Navigue à travers toutes les pages importantes
- Capture environ 25 screenshots des différentes fonctionnalités
- Sauvegarde les images dans `documentation/screenshots/`

### Étape 2 : Génération du PDF (jsPDF)
- Lit toutes les captures d'écran générées
- Crée un document PDF professionnel avec :
  - Page de couverture
  - Table des matières
  - Introduction
  - Sections pour Vendeurs et Administrateurs
  - Instructions étape par étape
  - FAQ et résolution de problèmes
  - Captures d'écran annotées

## Personnalisation

### Modifier les identifiants de connexion

Éditez `scripts/generate-screenshots.ts` :

```typescript
const USER_CREDENTIALS = {
  email: 'babaniservice@dubi.com',  // ← Modifier ici
  password: 'Babani@123'             // ← Modifier ici
};
```

### Ajouter des pages à documenter

Dans `scripts/generate-screenshots.ts`, ajoutez :

```typescript
await page.goto(`${BASE_URL}/votre-nouvelle-page`);
await page.waitForLoadState('networkidle');
await takeScreenshot(
  page,
  '26-nouvelle-fonctionnalite',
  'Description de la nouvelle fonctionnalité',
  'admin'  // ou 'vendeur' ou 'super-admin'
);
```

### Modifier le contenu du PDF

Éditez `scripts/generate-pdf.ts` pour :
- Changer le texte de la page de couverture (méthode `generateCoverPage()`)
- Modifier les instructions (méthodes `generateVendeurSection()` et `generateAdminSection()`)
- Ajouter/modifier la FAQ (méthode `generateFAQ()`)

## Structure des fichiers

```
react-design-studio/
├── scripts/
│   ├── generate-screenshots.ts     # Script Playwright pour capturer les écrans
│   ├── generate-pdf.ts             # Script pour générer le PDF
│   ├── generate-documentation.bat  # Script Windows tout-en-un
│   └── generate-documentation.sh   # Script Linux/Mac tout-en-un
│
└── documentation/
    ├── screenshots/                # Dossier des captures (auto-généré)
    │   ├── 01-dashboard-principal.png
    │   ├── 02-liste-clients.png
    │   ├── ...
    │   ├── index.json
    │   └── README.md
    │
    ├── Guide-Utilisateur-Walli-Industrie.pdf  # PDF final (auto-généré)
    └── README.md                   # Documentation technique
```

## Commandes npm disponibles

```bash
# Générer uniquement les captures d'écran
npm run generate:screenshots

# Générer uniquement le PDF (nécessite les captures)
npm run generate:pdf

# Tout générer en une commande
npm run generate:docs
```

## Résolution de problèmes

### ❌ "Cannot connect to localhost:5173"
**Solution :** Vérifiez que l'application est bien lancée avec `npm run dev`

### ❌ "Login failed"
**Solution :** Vérifiez les identifiants dans `scripts/generate-screenshots.ts`

### ❌ "Screenshots folder not found"
**Solution :** Lancez d'abord `npm run generate:screenshots` avant `npm run generate:pdf`

### ❌ "Playwright not installed"
**Solution :**
```bash
npx playwright install
```

### ⚠️ Les captures sont vides
**Solution :** Augmentez les délais d'attente dans `generate-screenshots.ts` :
```typescript
await page.waitForTimeout(2000);  // Augmenter à 3000 ou 4000
```

### ⚠️ Le navigateur ne se ferme pas
**Solution :** C'est normal en mode headless=false. Fermez manuellement ou changez :
```typescript
const browser = await chromium.launch({
  headless: true,  // true = mode invisible
  slowMo: 50
});
```

## Maintenance

### Mettre à jour la documentation

Quand vous ajoutez de nouvelles fonctionnalités :

1. Ajoutez les nouvelles pages dans `generate-screenshots.ts`
2. Ajoutez les descriptions correspondantes dans `generate-pdf.ts`
3. Relancez `npm run generate:docs`
4. Distribuez le nouveau PDF

### Planifier une génération régulière

Vous pouvez automatiser la génération hebdomadaire/mensuelle en :
- Créant une tâche planifiée (Windows Task Scheduler ou cron)
- Utilisant un CI/CD (GitHub Actions, GitLab CI)
- Lançant manuellement avant chaque release

## Exemple de workflow

```bash
# 1. Développer de nouvelles fonctionnalités
# ... code ...

# 2. Tester les fonctionnalités
npm run dev

# 3. Générer la documentation mise à jour
npm run generate:docs

# 4. Vérifier le PDF
open documentation/Guide-Utilisateur-Walli-Industrie.pdf

# 5. Distribuer aux utilisateurs
# Envoyer le PDF par email, Slack, ou l'héberger en ligne
```

## FAQ

**Q : Dois-je regénérer à chaque modification ?**
R : Non, seulement quand vous ajoutez/modifiez des fonctionnalités visibles ou l'UI.

**Q : Puis-je personnaliser le style du PDF ?**
R : Oui, modifiez les paramètres jsPDF dans `generate-pdf.ts` (polices, couleurs, marges, etc.)

**Q : Les captures incluent-elles des données réelles ?**
R : Oui, ce sont les vraies données de votre base de données de développement. Utilisez des données de test.

**Q : Combien de temps prend la génération ?**
R : Environ 3-5 minutes pour les captures + 30 secondes pour le PDF.

**Q : Puis-je générer en mode invisible ?**
R : Oui, mettez `headless: true` dans le script Playwright.

## Support

Pour toute question ou problème, consultez :
- `documentation/README.md` pour la documentation technique complète
- Les commentaires dans les scripts `generate-screenshots.ts` et `generate-pdf.ts`
- L'équipe de développement

---

**Auteur** : Équipe Walli Industrie
**Version** : 1.0
**Date** : 2024
