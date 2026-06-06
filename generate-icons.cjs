const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const sourceIcon = path.join(publicDir, 'master-icon.png');

// Vérifier que le fichier source existe
if (!fs.existsSync(sourceIcon)) {
  console.error('❌ master-icon.png introuvable dans /public');
  process.exit(1);
}

console.log('🎨 Génération des icônes PWA...\n');

const icons = [
  { name: 'pwa-64x64.png', size: 64 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
];

// Créer les icônes standard
async function generateIcons() {
  try {
    for (const icon of icons) {
      const outputPath = path.join(publicDir, icon.name);
      await sharp(sourceIcon)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 232, g: 244, b: 234, alpha: 1 } // #e8f4ea
        })
        .png()
        .toFile(outputPath);
      console.log(`✅ ${icon.name} (${icon.size}x${icon.size})`);
    }

    // Créer l'icône maskable avec safe zone (80% du centre)
    const maskableSize = 512;
    const safeZoneSize = Math.floor(maskableSize * 0.8);
    const padding = Math.floor((maskableSize - safeZoneSize) / 2);

    await sharp(sourceIcon)
      .resize(safeZoneSize, safeZoneSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 232, g: 244, b: 234, alpha: 1 } // #e8f4ea
      })
      .png()
      .toFile(path.join(publicDir, 'maskable-icon-512x512.png'));
    console.log(`✅ maskable-icon-512x512.png (avec safe zone)`);

    // Créer l'image Open Graph (1200x630)
    await sharp(sourceIcon)
      .resize(400, 400, {
        fit: 'contain',
        background: { r: 232, g: 244, b: 234, alpha: 1 }
      })
      .extend({
        top: 115,
        bottom: 115,
        left: 400,
        right: 400,
        background: { r: 232, g: 244, b: 234, alpha: 1 }
      })
      .png()
      .toFile(path.join(publicDir, 'og-image.png'));
    console.log(`✅ og-image.png (1200x630)`);

    console.log('\n🎉 Toutes les icônes PWA ont été générées avec succès!');
    console.log('\n📋 Prochaines étapes:');
    console.log('   1. Vérifier les icônes dans /public');
    console.log('   2. Générer le mask-icon.svg si nécessaire');
    console.log('   3. Générer les splash screens iOS (optionnel)');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

generateIcons();
