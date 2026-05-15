#!/bin/bash

# Script pour générer automatiquement la documentation PDF avec captures d'écran

echo "========================================="
echo "  Génération Documentation PDF"
echo "  Walli Industrie - Gestion Boutique"
echo "========================================="
echo ""

# Vérifier que l'application est lancée
echo "⚠️  IMPORTANT: Assurez-vous que l'application est lancée sur http://localhost:5173"
echo ""
read -p "L'application est-elle lancée ? (O/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Oo]$ ]]
then
    echo "❌ Veuillez d'abord lancer l'application avec: npm run dev"
    exit 1
fi

echo ""
echo "📸 Étape 1/2: Génération des captures d'écran..."
echo "Cela peut prendre quelques minutes..."
echo ""

npx tsx scripts/generate-screenshots.ts

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Erreur lors de la génération des captures d'écran"
    exit 1
fi

echo ""
echo "📄 Étape 2/2: Génération du PDF..."
echo ""

npx tsx scripts/generate-pdf.ts

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Erreur lors de la génération du PDF"
    exit 1
fi

echo ""
echo "========================================="
echo "✅ Documentation générée avec succès !"
echo "========================================="
echo ""
echo "📁 Fichiers générés:"
echo "   - documentation/screenshots/*.png"
echo "   - documentation/Guide-Utilisateur-Walli-Industrie.pdf"
echo ""
