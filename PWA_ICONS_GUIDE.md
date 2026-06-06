# Guide de Génération des Icônes PWA

## Icônes nécessaires pour Walli Indistrie

### 📱 Icônes principales

1. **pwa-64x64.png** (64x64px)
2. **pwa-192x192.png** (192x192px)
3. **pwa-512x512.png** (512x512px)
4. **maskable-icon-512x512.png** (512x512px avec safe zone)
5. **apple-touch-icon.png** (180x180px)
6. **favicon-32x32.png** (32x32px)
7. **favicon-16x16.png** (16x16px)
8. **mask-icon.svg** (SVG monochrome)

### 🎨 Splash Screens iOS

1. **apple-splash-2048-2732.jpg** - iPad Pro 12.9" (2048x2732px)
2. **apple-splash-1668-2388.jpg** - iPad Pro 11" (1668x2388px)
3. **apple-splash-1536-2048.jpg** - iPad Pro 10.5" (1536x2048px)
4. **apple-splash-1125-2436.jpg** - iPhone X/XS/11 Pro (1125x2436px)
5. **apple-splash-1242-2688.jpg** - iPhone XS Max/11 Pro Max (1242x2688px)
6. **apple-splash-750-1334.jpg** - iPhone 8/SE (750x1334px)
7. **apple-splash-828-1792.jpg** - iPhone XR/11 (828x1792px)

### 🎯 Spécifications de design

**Couleurs officielles:**
- Couleur principale: `#2f7a3d` (vert)
- Background: `#e8f4ea` (vert clair)

**Logo:**
- Utiliser le logo Walli Indistrie
- Centrer sur fond de couleur
- Pour maskable icon: respecter la safe zone (80% du centre)

---

## 🛠️ Méthode 1: Générateur en ligne (Recommandé)

### Option A: PWA Asset Generator
```bash
npm install -g pwa-asset-generator

pwa-asset-generator logo.png public --background "#e8f4ea" --theme-color "#2f7a3d"
```

### Option B: RealFaviconGenerator
1. Aller sur: https://realfavicongenerator.net/
2. Upload votre logo
3. Configurer les couleurs
4. Télécharger le package
5. Extraire dans `/public`

---

## 🎨 Méthode 2: Figma/Photoshop

### Template Figma
1. Créer un fichier Figma
2. Frames aux tailles requises
3. Logo centré avec padding
4. Export en PNG/SVG

### Safe Zone pour Maskable Icon
- Total: 512x512px
- Safe zone: 410x410px (80% du centre)
- Logo doit rester dans la safe zone

---

## 📋 Checklist d'installation

- [ ] Créer le logo source (SVG recommandé)
- [ ] Générer toutes les icônes PWA
- [ ] Générer tous les splash screens iOS
- [ ] Placer les fichiers dans `/public`
- [ ] Vérifier avec Chrome DevTools > Application > Manifest
- [ ] Tester l'installation sur Android
- [ ] Tester l'installation sur iPhone
- [ ] Vérifier le splash screen au lancement

---

## 🔍 Validation

### Chrome DevTools
1. F12 > Application tab
2. Manifest section
3. Vérifier toutes les icônes
4. Vérifier theme_color
5. Service Worker actif

### Lighthouse
1. F12 > Lighthouse tab
2. Run PWA audit
3. Score > 90 requis

---

## 📁 Structure finale attendue

```
public/
├── pwa-64x64.png
├── pwa-192x192.png
├── pwa-512x512.png
├── maskable-icon-512x512.png
├── apple-touch-icon.png
├── favicon-32x32.png
├── favicon-16x16.png
├── favicon.ico
├── mask-icon.svg
├── og-image.png
├── apple-splash-2048-2732.jpg
├── apple-splash-1668-2388.jpg
├── apple-splash-1536-2048.jpg
├── apple-splash-1125-2436.jpg
├── apple-splash-1242-2688.jpg
├── apple-splash-750-1334.jpg
└── apple-splash-828-1792.jpg
```

---

## 🚀 Commande rapide

Si vous avez un logo `logo.svg`:

```bash
# Installation du générateur
npm install -g @vite-pwa/assets-generator

# Génération automatique
pwa-assets-generator --preset minimal public/logo.svg
```

---

## ⚠️ Notes importantes

1. **Maskable icon**: Respecter impérativement la safe zone
2. **Splash screens**: Utiliser des JPG pour réduire la taille
3. **Formats**: PNG pour icônes, SVG pour mask-icon
4. **Optimisation**: Compresser les images (TinyPNG)
5. **Test**: Tester sur vrais appareils, pas seulement simulateurs

---

## 📞 Besoin d'aide?

Si vous avez besoin d'aide pour générer les icônes:
1. Fournir le logo source (SVG de préférence)
2. Utiliser les outils en ligne mentionnés
3. Suivre la checklist ci-dessus
