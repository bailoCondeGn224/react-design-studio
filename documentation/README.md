# Documentation Automatique - Gestion Boutique Walli Industrie

Ce dossier contient les outils pour générer automatiquement la documentation utilisateur au format PDF avec captures d'écran.

## Prérequis

1. **Application lancée** : L'application doit être démarrée sur `http://localhost:5173`
2. **Playwright installé** : Les navigateurs Playwright doivent être installés
3. **Node.js et npm** : Version 16 ou supérieure

## Installation des prérequis

Si ce n'est pas déjà fait, installez les navigateurs Playwright :

```bash
npx playwright install
```

## Génération de la documentation

### Option 1 : Script automatique (Recommandé)

#### Sur Windows :
```bash
scripts\generate-documentation.bat
```

#### Sur Linux/Mac :
```bash
chmod +x scripts/generate-documentation.sh
./scripts/generate-documentation.sh
```

### Option 2 : Scripts NPM

```bash
# Générer les captures d'écran
npm run generate:screenshots

# Générer le PDF (après les captures)
npm run generate:pdf

# Tout générer en une commande
npm run generate:docs
```

### Option 3 : Scripts individuels

```bash
# 1. Lancer l'application
npm run dev

# 2. Dans un autre terminal, générer les captures
npx tsx scripts/generate-screenshots.ts

# 3. Générer le PDF
npx tsx scripts/generate-pdf.ts
```

## Étapes de génération

1. **Démarrer l'application** :
   ```bash
   npm run dev
   ```
   L'application doit être accessible sur http://localhost:5173

2. **Lancer le script de génération** :
   Le script va :
   - Se connecter automatiquement avec les identifiants configurés
   - Naviguer à travers toutes les pages de l'application
   - Capturer des screenshots de chaque fonctionnalité
   - Générer un fichier PDF avec les captures et descriptions

3. **Récupérer la documentation** :
   - PDF final : `documentation/Guide-Utilisateur-Walli-Industrie.pdf`
   - Captures d'écran : `documentation/screenshots/*.png`
   - Index JSON : `documentation/screenshots/index.json`

## Structure des fichiers générés

```
documentation/
├── screenshots/
│   ├── 01-dashboard-principal.png
│   ├── 02-liste-clients.png
│   ├── 03-formulaire-client.png
│   ├── 04-liste-ventes.png
│   ├── ... (environ 25 captures)
│   ├── index.json
│   └── README.md
└── Guide-Utilisateur-Walli-Industrie.pdf
```

## Personnalisation

### Modifier les identifiants de connexion

Éditez le fichier `scripts/generate-screenshots.ts` et modifiez :

```typescript
const USER_CREDENTIALS = {
  email: 'votre-email@example.com',
  password: 'votre-mot-de-passe'
};
```

### Modifier l'URL de l'application

Si votre application tourne sur un port différent, modifiez :

```typescript
const BASE_URL = 'http://localhost:VOTRE_PORT';
```

### Ajouter/Modifier des captures

Dans `scripts/generate-screenshots.ts`, ajoutez vos propres captures dans la fonction `capturePageEcran()` :

```typescript
await page.goto(`${BASE_URL}/votre-page`);
await page.waitForLoadState('networkidle');
await takeScreenshot(
  page,
  'nom-capture',
  'Description de la capture',
  'vendeur' // ou 'admin' ou 'super-admin'
);
```

### Personnaliser le contenu du PDF


Éditez `scripts/generate-pdf.ts` pour :
- Modifier le texte de la page de couverture
- Ajouter/supprimer des sections
- Modifier les instructions pas à pas
- Personnaliser la FAQ

## Résolution des problèmes

### Erreur : "Application non accessible"
- Vérifiez que l'application tourne bien sur http://localhost:5173
- Vérifiez qu'il n'y a pas d'erreur dans les logs de l'application

### Erreur : "Connexion échouée"
- Vérifiez les identifiants dans `scripts/generate-screenshots.ts`
- Assurez-vous que l'utilisateur existe dans la base de données

### Erreur : "Playwright not found"
```bash
npm install @playwright/test
npx playwright install
```

### Les captures sont vides ou incomplètes
- Augmentez les délais d'attente dans le script (valeurs `waitForTimeout`)
- Vérifiez que les données sont bien chargées dans l'application

### Le PDF ne contient pas d'images
- Vérifiez que le dossier `documentation/screenshots/` contient des images
- Vérifiez que le fichier `index.json` existe et est valide
- Exécutez d'abord le script de génération de captures avant le PDF

## Configuration avancée

### Mode headless

Pour exécuter sans afficher le navigateur, modifiez dans `generate-screenshots.ts` :

```typescript
const browser = await chromium.launch({
  headless: true,  // Passer à true
  slowMo: 50
});
```

### Résolution des captures

Modifiez la résolution de la fenêtre :

```typescript
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 }  // Changez ici
});
```

### Format du PDF

Modifiez le format dans `generate-pdf.ts` :

```typescript
this.doc = new jsPDF({
  orientation: 'portrait',  // ou 'landscape'
  unit: 'mm',
  format: 'a4'  // ou 'letter', 'a3', etc.
});
```

## Maintenance

### Mettre à jour la documentation

1. Modifiez les scripts TypeScript si nécessaire
2. Relancez la génération complète
3. Vérifiez le PDF généré
4. Distribuez le nouveau PDF aux utilisateurs

### Ajout de nouvelles pages

Lorsque vous ajoutez de nouvelles fonctionnalités :

1. Ajoutez les captures dans `generate-screenshots.ts`
2. Ajoutez les sections correspondantes dans `generate-pdf.ts`
3. Mettez à jour la table des matières
4. Régénérez la documentation

## Support

Pour toute question ou problème, contactez l'équipe de développement.

---

**Version** : 1.0
**Dernière mise à jour** : 2024
