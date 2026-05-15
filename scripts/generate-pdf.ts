import { jsPDF } from 'jspdf';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOTS_DIR = path.join(process.cwd(), 'documentation', 'screenshots');
const OUTPUT_DIR = path.join(process.cwd(), 'documentation');
const OUTPUT_PDF = path.join(OUTPUT_DIR, 'Guide-Utilisateur-Walli-Industrie.pdf');

interface Screenshot {
  name: string;
  description: string;
  path: string;
  category: 'vendeur' | 'admin' | 'super-admin';
}

interface Section {
  title: string;
  content: string[];
  screenshots?: string[];
}

class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private lineHeight: number;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
    this.lineHeight = 7;
  }

  private checkPageBreak(height: number) {
    if (this.currentY + height > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
      return true;
    }
    return false;
  }

  private addTitle(text: string, size: number = 20) {
    this.checkPageBreak(size);
    this.doc.setFontSize(size);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += size / 2 + 5;
  }

  private addSubtitle(text: string, size: number = 14) {
    this.checkPageBreak(size);
    this.doc.setFontSize(size);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += size / 2 + 3;
  }

  private addText(text: string, size: number = 10, style: 'normal' | 'bold' = 'normal') {
    this.doc.setFontSize(size);
    this.doc.setFont('helvetica', style);

    const maxWidth = this.pageWidth - 2 * this.margin;
    const lines = this.doc.splitTextToSize(text, maxWidth);

    lines.forEach((line: string) => {
      this.checkPageBreak(this.lineHeight);
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    });
  }

  private addSpace(space: number = 5) {
    this.currentY += space;
  }

  private addImage(imagePath: string, caption: string) {
    try {
      if (!fs.existsSync(imagePath)) {
        console.log(`Image non trouvée: ${imagePath}`);
        return;
      }

      const imageData = fs.readFileSync(imagePath);
      const base64Image = Buffer.from(imageData).toString('base64');
      const imgType = imagePath.endsWith('.png') ? 'PNG' : 'JPEG';

      // Calculer les dimensions de l'image
      const maxWidth = this.pageWidth - 2 * this.margin;
      const maxHeight = 120; // Hauteur maximale pour l'image

      // Ajouter l'image
      this.checkPageBreak(maxHeight + 20);

      this.doc.addImage(
        `data:image/${imgType.toLowerCase()};base64,${base64Image}`,
        imgType,
        this.margin,
        this.currentY,
        maxWidth,
        maxHeight
      );

      this.currentY += maxHeight + 5;

      // Ajouter la légende
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(100, 100, 100);

      const captionLines = this.doc.splitTextToSize(caption, maxWidth);
      captionLines.forEach((line: string) => {
        this.checkPageBreak(this.lineHeight);
        this.doc.text(line, this.margin, this.currentY);
        this.currentY += this.lineHeight - 2;
      });

      this.doc.setTextColor(0, 0, 0);
      this.addSpace(10);

    } catch (error) {
      console.error(`Erreur lors de l'ajout de l'image ${imagePath}:`, error);
    }
  }

  private addBulletPoint(text: string) {
    this.checkPageBreak(this.lineHeight);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const maxWidth = this.pageWidth - 2 * this.margin - 10;
    const lines = this.doc.splitTextToSize(text, maxWidth);

    // Premier ligne avec bullet
    this.doc.text('•', this.margin + 5, this.currentY);
    this.doc.text(lines[0], this.margin + 10, this.currentY);
    this.currentY += this.lineHeight;

    // Lignes suivantes avec indentation
    for (let i = 1; i < lines.length; i++) {
      this.checkPageBreak(this.lineHeight);
      this.doc.text(lines[i], this.margin + 10, this.currentY);
      this.currentY += this.lineHeight;
    }
  }

  generateCoverPage() {
    // Logo/Titre centré
    this.currentY = 80;
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    const title = 'GUIDE UTILISATEUR';
    const titleWidth = this.doc.getTextWidth(title);
    this.doc.text(title, (this.pageWidth - titleWidth) / 2, this.currentY);

    this.currentY += 15;
    this.doc.setFontSize(24);
    const appName = 'Gestion Boutique';
    const appNameWidth = this.doc.getTextWidth(appName);
    this.doc.text(appName, (this.pageWidth - appNameWidth) / 2, this.currentY);

    this.currentY += 12;
    this.doc.setFontSize(20);
    const company = 'WALLI INDUSTRIE';
    const companyWidth = this.doc.getTextWidth(company);
    this.doc.text(company, (this.pageWidth - companyWidth) / 2, this.currentY);

    // Version et date
    this.currentY = this.pageHeight - 50;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    const version = 'Version 1.0';
    const versionWidth = this.doc.getTextWidth(version);
    this.doc.text(version, (this.pageWidth - versionWidth) / 2, this.currentY);

    this.currentY += 10;
    const date = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const dateWidth = this.doc.getTextWidth(date);
    this.doc.text(date, (this.pageWidth - dateWidth) / 2, this.currentY);
  }

  generateTableOfContents() {
    this.doc.addPage();
    this.currentY = this.margin;

    this.addTitle('Table des matières', 18);
    this.addSpace(10);

    const toc = [
      { title: '1. Introduction', page: 3 },
      { title: '2. Connexion à l\'application', page: 4 },
      { title: '3. Guide pour les Vendeurs/Employés', page: 5 },
      { title: '   3.1 Tableau de bord', page: 5 },
      { title: '   3.2 Gestion des clients', page: 6 },
      { title: '   3.3 Gestion des ventes', page: 8 },
      { title: '   3.4 Consultation du stock', page: 10 },
      { title: '   3.5 Commandes clients', page: 12 },
      { title: '   3.6 Paiements clients', page: 13 },
      { title: '4. Guide pour les Administrateurs', page: 15 },
      { title: '   4.1 Gestion des fournisseurs', page: 15 },
      { title: '   4.2 Approvisionnements', page: 17 },
      { title: '   4.3 Gestion du stock avancée', page: 19 },
      { title: '   4.4 Inventaires', page: 21 },
      { title: '   4.5 Gestion des dépenses', page: 23 },
      { title: '   4.6 Gestion des utilisateurs', page: 25 },
      { title: '   4.7 Tableau analytique', page: 27 },
      { title: '5. FAQ et Résolution de problèmes', page: 29 },
    ];

    this.doc.setFontSize(11);
    toc.forEach(item => {
      this.checkPageBreak(this.lineHeight);
      this.doc.setFont('helvetica', item.title.startsWith('   ') ? 'normal' : 'bold');
      this.doc.text(item.title, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    });
  }

  generateIntroduction() {
    this.doc.addPage();
    this.currentY = this.margin;

    this.addTitle('1. Introduction', 18);
    this.addSpace(5);

    this.addText(
      'Bienvenue dans le guide utilisateur de l\'application de Gestion de Boutique Walli Industrie. ' +
      'Cette application a été conçue pour faciliter la gestion quotidienne de votre boutique de vêtements traditionnels.'
    );
    this.addSpace(5);

    this.addSubtitle('À propos de l\'application', 12);
    this.addText(
      'L\'application offre une solution complète pour gérer tous les aspects de votre boutique :'
    );
    this.addSpace(3);
    this.addBulletPoint('Gestion des clients et de leurs achats');
    this.addBulletPoint('Suivi du stock et des articles');
    this.addBulletPoint('Enregistrement des ventes et des paiements');
    this.addBulletPoint('Gestion des fournisseurs et approvisionnements');
    this.addBulletPoint('Suivi des commandes clients');
    this.addBulletPoint('Gestion des dépenses et analyses financières');
    this.addBulletPoint('Tableaux de bord et statistiques en temps réel');
    this.addSpace(8);

    this.addSubtitle('Public visé', 12);
    this.addText(
      'Ce guide est destiné à deux profils d\'utilisateurs :'
    );
    this.addSpace(3);
    this.addBulletPoint('Vendeurs/Employés : Accès aux fonctionnalités quotidiennes de vente et gestion client');
    this.addBulletPoint('Administrateurs : Accès complet incluant la gestion des fournisseurs, du stock, des utilisateurs et des analyses avancées');
    this.addSpace(8);

    this.addSubtitle('Comment utiliser ce guide', 12);
    this.addText(
      'Ce guide est organisé par fonctionnalité avec des captures d\'écran détaillées. ' +
      'Chaque section explique étape par étape comment réaliser les tâches courantes. ' +
      'Les captures d\'écran vous montrent exactement ce que vous verrez à l\'écran.'
    );
  }

  generateVendeurSection(screenshots: Screenshot[]) {
    this.doc.addPage();
    this.currentY = this.margin;

    this.addTitle('3. Guide pour les Vendeurs/Employés', 18);
    this.addSpace(5);

    this.addText(
      'Cette section décrit les fonctionnalités accessibles aux vendeurs et employés de la boutique. ' +
      'Ces outils vous permettent de gérer les ventes quotidiennes, les clients et les commandes.'
    );
    this.addSpace(10);

    // Dashboard
    this.addSubtitle('3.1 Tableau de bord', 14);
    this.addText(
      'Le tableau de bord est la première page que vous voyez après connexion. ' +
      'Il affiche un résumé des statistiques clés de la boutique.'
    );
    this.addSpace(5);

    const dashboardScreenshot = screenshots.find(s => s.name === '01-dashboard-principal');
    if (dashboardScreenshot) {
      this.addImage(dashboardScreenshot.path, dashboardScreenshot.description);
    }

    this.addText('Le tableau de bord affiche :', 10, 'bold');
    this.addBulletPoint('Chiffre d\'affaires du mois avec tendance');
    this.addBulletPoint('Nombre et montant des ventes du jour');
    this.addBulletPoint('État du stock avec articles en alerte');
    this.addBulletPoint('Dettes fournisseurs en cours');
    this.addBulletPoint('Graphique des ventes de la semaine');
    this.addBulletPoint('Liste des dernières ventes');
    this.addBulletPoint('Top 5 des meilleurs clients');
    this.addSpace(10);

    // Gestion clients
    this.doc.addPage();
    this.currentY = this.margin;
    this.addSubtitle('3.2 Gestion des clients', 14);
    this.addText(
      'La page Clients vous permet de gérer tous vos clients : créer de nouveaux clients, ' +
      'consulter leur historique d\'achats et gérer leurs crédits.'
    );
    this.addSpace(5);

    const clientsScreenshot = screenshots.find(s => s.name === '02-liste-clients');
    if (clientsScreenshot) {
      this.addImage(clientsScreenshot.path, clientsScreenshot.description);
    }

    this.addText('Comment créer un nouveau client :', 10, 'bold');
    this.addBulletPoint('Cliquez sur le bouton "Nouveau client"');
    this.addBulletPoint('Remplissez le formulaire : nom, prénom, téléphone, email, adresse');
    this.addBulletPoint('Cliquez sur "Enregistrer"');
    this.addSpace(5);

    const clientFormScreenshot = screenshots.find(s => s.name === '03-formulaire-client');
    if (clientFormScreenshot) {
      this.addImage(clientFormScreenshot.path, clientFormScreenshot.description);
    }

    this.addText('Fonctionnalités disponibles :', 10, 'bold');
    this.addBulletPoint('Rechercher un client par nom');
    this.addBulletPoint('Filtrer les clients ayant des crédits en cours');
    this.addBulletPoint('Voir l\'historique des achats d\'un client');
    this.addBulletPoint('Consulter le montant total des achats');
    this.addBulletPoint('Modifier les informations d\'un client');
    this.addSpace(10);

    // Gestion ventes
    this.doc.addPage();
    this.currentY = this.margin;
    this.addSubtitle('3.3 Gestion des ventes', 14);
    this.addText(
      'La page Ventes est l\'outil principal pour enregistrer et gérer toutes les ventes de la boutique.'
    );
    this.addSpace(5);

    const ventesScreenshot = screenshots.find(s => s.name === '04-liste-ventes');
    if (ventesScreenshot) {
      this.addImage(ventesScreenshot.path, ventesScreenshot.description);
    }

    this.addText('Comment créer une nouvelle vente :', 10, 'bold');
    this.addBulletPoint('Cliquez sur "Nouvelle vente"');
    this.addBulletPoint('Sélectionnez le client (ou créez-en un rapidement)');
    this.addBulletPoint('Ajoutez les articles vendus avec quantité et prix');
    this.addBulletPoint('Choisissez le mode de paiement : Espèces, Mobile Money, Virement, Crédit ou Acompte 50%');
    this.addBulletPoint('Indiquez le montant payé (pour les crédits et acomptes)');
    this.addBulletPoint('Ajoutez une note si nécessaire');
    this.addBulletPoint('Cliquez sur "Enregistrer"');
    this.addSpace(5);

    const venteFormScreenshot = screenshots.find(s => s.name === '05-formulaire-vente');
    if (venteFormScreenshot) {
      this.addImage(venteFormScreenshot.path, venteFormScreenshot.description);
    }

    this.addText('Actions disponibles sur une vente :', 10, 'bold');
    this.addBulletPoint('Voir les détails complets de la vente');
    this.addBulletPoint('Imprimer la facture');
    this.addBulletPoint('Partager la facture par WhatsApp');
    this.addBulletPoint('Modifier la vente (si autorisé)');
    this.addBulletPoint('Consulter l\'historique des paiements');
    this.addSpace(10);

    // Stock
    this.doc.addPage();
    this.currentY = this.margin;
    this.addSubtitle('3.4 Consultation du stock', 14);
    this.addText(
      'La page Stock vous permet de consulter tous les articles disponibles, ' +
      'leurs quantités et de voir les articles en alerte.'
    );
    this.addSpace(5);

    const stockScreenshot = screenshots.find(s => s.name === '06-gestion-stock');
    if (stockScreenshot) {
      this.addImage(stockScreenshot.path, stockScreenshot.description);
    }

    this.addText('Informations disponibles pour chaque article :', 10, 'bold');
    this.addBulletPoint('Photo de l\'article');
    this.addBulletPoint('Code et nom de l\'article');
    this.addBulletPoint('Catégorie et zone de stockage');
    this.addBulletPoint('Quantité en stock avec seuil d\'alerte');
    this.addBulletPoint('Prix d\'achat et de vente');
    this.addSpace(5);

    this.addText('Fonctionnalités :', 10, 'bold');
    this.addBulletPoint('Rechercher un article par code ou nom');
    this.addBulletPoint('Filtrer par catégorie');
    this.addBulletPoint('Voir l\'historique des mouvements d\'un article');
    this.addBulletPoint('Visualiser la photo en grand');
    this.addSpace(10);

    // Commandes
    this.doc.addPage();
    this.currentY = this.margin;
    this.addSubtitle('3.5 Commandes clients', 14);
    this.addText(
      'La page Commandes permet de créer et suivre les commandes de vos clients.'
    );
    this.addSpace(5);

    const commandesScreenshot = screenshots.find(s => s.name === '08-commandes-clients');
    if (commandesScreenshot) {
      this.addImage(commandesScreenshot.path, commandesScreenshot.description);
    }

    this.addText('Comment créer une commande :', 10, 'bold');
    this.addBulletPoint('Cliquez sur "Nouvelle commande"');
    this.addBulletPoint('Sélectionnez le client');
    this.addBulletPoint('Ajoutez les articles commandés avec quantités');
    this.addBulletPoint('Indiquez la date de livraison prévue');
    this.addBulletPoint('Ajoutez une note si nécessaire');
    this.addSpace(5);

    this.addText('Gestion des commandes :', 10, 'bold');
    this.addBulletPoint('Filtrer par statut : En attente, En préparation, Livrée, Annulée');
    this.addBulletPoint('Marquer une commande comme "Livrée"');
    this.addBulletPoint('Annuler une commande si besoin');
    this.addBulletPoint('Imprimer le bon de commande');
    this.addSpace(10);

    // Versements clients
    this.doc.addPage();
    this.currentY = this.margin;
    this.addSubtitle('3.6 Paiements clients (Versements)', 14);
    this.addText(
      'Cette page permet d\'enregistrer les paiements des clients ayant des crédits en cours.'
    );
    this.addSpace(5);

    const versementsClientScreenshot = screenshots.find(s => s.name === '09-versements-clients');
    if (versementsClientScreenshot) {
      this.addImage(versementsClientScreenshot.path, versementsClientScreenshot.description);
    }

    this.addText('Comment enregistrer un paiement client :', 10, 'bold');
    this.addBulletPoint('Cliquez sur "Nouveau versement"');
    this.addBulletPoint('Sélectionnez le client qui effectue le paiement');
    this.addBulletPoint('Indiquez le montant payé');
    this.addBulletPoint('Choisissez le mode de paiement');
    this.addBulletPoint('Ajoutez une référence de paiement si disponible');
    this.addBulletPoint('Enregistrez le versement');
    this.addSpace(5);

    this.addText('La page affiche :', 10, 'bold');
    this.addBulletPoint('Total des crédits en cours');
    this.addBulletPoint('Montant payé dans le mois');
    this.addBulletPoint('Nombre de clients ayant un crédit');
    this.addBulletPoint('Historique de tous les paiements');
  }

  generateAdminSection(screenshots: Screenshot[]) {
    this.doc.addPage();
    this.currentY = this.margin;

    this.addTitle('4. Guide pour les Administrateurs', 18);
    this.addSpace(5);

    this.addText(
      'Cette section décrit les fonctionnalités avancées accessibles aux administrateurs. ' +
      'En plus de toutes les fonctionnalités des vendeurs, les administrateurs ont accès à ' +
      'la gestion des fournisseurs, du stock, des dépenses et des utilisateurs.'
    );
    this.addSpace(10);

    // Fournisseurs
    this.addSubtitle('4.1 Gestion des fournisseurs', 14);
    this.addText(
      'La page Fournisseurs permet de gérer tous vos fournisseurs et de suivre les dettes.'
    );
    this.addSpace(5);

    const fournisseursScreenshot = screenshots.find(s => s.name === '10-fournisseurs');
    if (fournisseursScreenshot) {
      this.addImage(fournisseursScreenshot.path, fournisseursScreenshot.description);
    }

    this.addText('Comment créer un fournisseur :', 10, 'bold');
    this.addBulletPoint('Cliquez sur "Nouveau fournisseur"');
    this.addBulletPoint('Remplissez les informations : nom, contact, téléphone, email, adresse');
    this.addBulletPoint('Indiquez les modalités de paiement');
    this.addBulletPoint('Enregistrez');
    this.addSpace(5);

    this.addText('Informations disponibles :', 10, 'bold');
    this.addBulletPoint('Montant total acheté au fournisseur');
    this.addBulletPoint('Dettes en cours');
    this.addBulletPoint('Historique des approvisionnements');
    this.addBulletPoint('Historique des paiements effectués');
    this.addSpace(10);

    // Approvisionnements
    this.doc.addPage();
    this.currentY = this.margin;
    this.addSubtitle('4.2 Approvisionnements', 14);
    this.addText(
      'La page Approvisionnements permet d\'enregistrer les achats auprès des fournisseurs.'
    );
    this.addSpace(5);

    const approsScreenshot = screenshots.find(s => s.name === '11-approvisionnements');
    if (approsScreenshot) {
      this.addImage(approsScreenshot.path, approsScreenshot.description);
    }

    this.addText('Comment créer un approvisionnement :', 10, 'bold');
    this.addBulletPoint('Cliquez sur "Nouvel approvisionnement"');
    this.addBulletPoint('Sélectionnez le fournisseur');
    this.addBulletPoint('Ajoutez les articles achetés avec code, quantité et prix unitaire');
    this.addBulletPoint('Indiquez la date de livraison');
    this.addBulletPoint('Le total est calculé automatiquement');
    this.addBulletPoint('Enregistrez');
    this.addSpace(5);

    this.addText('Important :', 10, 'bold');
    this.addText(
      'Le stock est automatiquement mis à jour lors de la création d\'un approvisionnement. ' +
      'Vous pouvez imprimer le bon de livraison pour vos archives.'
    );
    this.addSpace(10);

    // Versements fournisseurs
    this.doc.addPage();
    this.currentY = this.margin;
    this.addSubtitle('4.3 Paiements fournisseurs', 14);
    this.addText(
      'Cette page permet de gérer les paiements aux fournisseurs et de suivre les dettes.'
    );
    this.addSpace(5);

    const versementsFournScreenshot = screenshots.find(s => s.name === '12-versements-fournisseurs');
    if (versementsFournScreenshot) {
      this.addImage(versementsFournScreenshot.path, versementsFournScreenshot.description);
    }

    this.addText('Comment enregistrer un paiement :', 10, 'bold');
    this.addBulletPoint('Cliquez sur "Nouveau versement"');
    this.addBulletPoint('Sélectionnez le fournisseur');
    this.addBulletPoint('Indiquez le montant payé');
    this.addBulletPoint('Choisissez le mode de paiement');
    this.addBulletPoint('Ajoutez une référence et note si nécessaire');
    this.addBulletPoint('Enregistrez');
    this.addSpace(5);

    this.addText('La page affiche :', 10, 'bold');
    this.addBulletPoint('Total des dettes fournisseurs');
    this.addBulletPoint('Nombre de fournisseurs en dette');
    this.addBulletPoint('Liste des fournisseurs avec montant acheté, payé et dette restante');
    this.addBulletPoint('Historique complet des versements');
    this.addSpace(10);

    // Catégories et Zones
    this.doc.addPage();
    this.currentY = this.margin;
    this.addSubtitle('4.4 Catégories et Zones de stockage', 14);

    const categoriesScreenshot = screenshots.find(s => s.name === '13-categories');
    if (categoriesScreenshot) {
      this.addImage(categoriesScreenshot.path, 'Gestion des catégories d\'articles');
    }

    this.addText(
      'Les catégories permettent de classer vos articles (ex: Boubous, Chaussures, Accessoires). ' +
      'Vous pouvez créer, modifier et supprimer des catégories.'
    );
    this.addSpace(5);

    const zonesScreenshot = screenshots.find(s => s.name === '14-zones-stockage');
    if (zonesScreenshot) {
      this.addImage(zonesScreenshot.path, 'Gestion des zones de stockage');
    }

    this.addText(
      'Les zones de stockage permettent d\'organiser physiquement votre stock ' +
      '(ex: Rayon A, Étagère 1, Réserve). Cela facilite la localisation des articles.'
    );
    this.addSpace(10);

    // Inventaires
    this.doc.addPage();
    this.currentY = this.margin;
    this.addSubtitle('4.5 Inventaires', 14);
    this.addText(
      'Les inventaires permettent de vérifier périodiquement que le stock dans l\'application ' +
      'correspond au stock physique réel.'
    );
    this.addSpace(5);

    const inventairesScreenshot = screenshots.find(s => s.name === '15-inventaires');
    if (inventairesScreenshot) {
      this.addImage(inventairesScreenshot.path, inventairesScreenshot.description);
    }

    this.addText('Comment réaliser un inventaire :', 10, 'bold');
    this.addBulletPoint('Cliquez sur "Nouvel inventaire"');
    this.addBulletPoint('Sélectionnez la date de démarrage');
    this.addBulletPoint('Optionnel : sélectionnez des articles spécifiques à compter');
    this.addBulletPoint('Lancez l\'inventaire');
    this.addBulletPoint('Pour chaque article, entrez la quantité réellement comptée');
    this.addBulletPoint('Le système affiche les différences (+ ou -)');
    this.addBulletPoint('Une fois terminé, validez l\'inventaire');
    this.addBulletPoint('Le stock est automatiquement ajusté');
    this.addSpace(10);

    // Mouvements stock
    this.doc.addPage();
    this.currentY = this.margin;
    this.addSubtitle('4.6 Historique des mouvements de stock', 14);

    const mouvementsScreenshot = screenshots.find(s => s.name === '16-mouvements-stock');
    if (mouvementsScreenshot) {
      this.addImage(mouvementsScreenshot.path, mouvementsScreenshot.description);
    }

    this.addText(
      'Cette page affiche l\'historique complet de tous les mouvements de stock : ' +
      'ventes, approvisionnements, retours, ajustements, pertes et casses.'
    );
    this.addSpace(5);

    this.addText('Filtres disponibles :', 10, 'bold');
    this.addBulletPoint('Par type de mouvement (entrée/sortie)');
    this.addBulletPoint('Par motif (vente, appro, retour, ajustement, perte, casse)');
    this.addBulletPoint('Par article');
    this.addBulletPoint('Par période');
    this.addSpace(10);

    // Dépenses
    this.doc.addPage();
    this.currentY = this.margin;
    this.addSubtitle('4.7 Gestion des dépenses', 14);

    const depensesScreenshot = screenshots.find(s => s.name === '17-depenses');
    if (depensesScreenshot) {
      this.addImage(depensesScreenshot.path, depensesScreenshot.description);
    }

    this.addText(
      'La page Dépenses permet d\'enregistrer toutes les dépenses de la boutique ' +
      'pour un suivi financier complet.'
    );
    this.addSpace(5);

    this.addText('Catégories de dépenses :', 10, 'bold');
    this.addBulletPoint('Loyer');
    this.addBulletPoint('Salaires');
    this.addBulletPoint('Utilities (eau, électricité, internet)');
    this.addBulletPoint('Transport');
    this.addBulletPoint('Marketing');
    this.addBulletPoint('Autre');
    this.addSpace(5);

    this.addText('Comment enregistrer une dépense :', 10, 'bold');
    this.addBulletPoint('Cliquez sur "Nouvelle dépense"');
    this.addBulletPoint('Sélectionnez la catégorie');
    this.addBulletPoint('Indiquez le montant');
    this.addBulletPoint('Ajoutez une description');
    this.addBulletPoint('Sélectionnez la date');
    this.addBulletPoint('Enregistrez');
    this.addSpace(10);

    // Utilisateurs
    this.doc.addPage();
    this.currentY = this.margin;
    this.addSubtitle('4.8 Gestion des utilisateurs', 14);

    const utilisateursScreenshot = screenshots.find(s => s.name === '21-utilisateurs');
    if (utilisateursScreenshot) {
      this.addImage(utilisateursScreenshot.path, utilisateursScreenshot.description);
    }

    this.addText(
      'Cette page permet de gérer tous les utilisateurs de l\'application (vendeurs, gestionnaires, etc.).'
    );
    this.addSpace(5);

    this.addText('Comment créer un utilisateur :', 10, 'bold');
    this.addBulletPoint('Cliquez sur "Nouvel utilisateur"');
    this.addBulletPoint('Remplissez nom, prénom, email');
    this.addBulletPoint('Créez un mot de passe');
    this.addBulletPoint('Sélectionnez le rôle (VENDEUR, GESTIONNAIRE_STOCK, COMPTABLE, etc.)');
    this.addBulletPoint('Activez ou désactivez le compte');
    this.addBulletPoint('Enregistrez');
    this.addSpace(5);

    const rolesScreenshot = screenshots.find(s => s.name === '22-roles-permissions');
    if (rolesScreenshot) {
      this.addImage(rolesScreenshot.path, 'Rôles et permissions disponibles');
    }

    this.addText('Rôles disponibles :', 10, 'bold');
    this.addBulletPoint('ADMIN : Accès complet à toutes les fonctionnalités');
    this.addBulletPoint('GESTIONNAIRE : Accès à la plupart des fonctionnalités sauf gestion utilisateurs');
    this.addBulletPoint('VENDEUR : Accès aux ventes, clients, commandes');
    this.addBulletPoint('GESTIONNAIRE_STOCK : Accès au stock, inventaires, mouvements');
    this.addBulletPoint('COMPTABLE : Accès aux finances, versements, dépenses');
    this.addSpace(10);

    // Analytics
    this.doc.addPage();
    this.currentY = this.margin;
    this.addSubtitle('4.9 Tableau analytique', 14);

    const analyticsScreenshot = screenshots.find(s => s.name === '18-analytics');
    if (analyticsScreenshot) {
      this.addImage(analyticsScreenshot.path, analyticsScreenshot.description);
    }

    this.addText(
      'Le tableau analytique offre une vue complète de tous les indicateurs clés de performance ' +
      'de votre boutique avec des graphiques et statistiques détaillées.'
    );
    this.addSpace(5);

    this.addText('Métriques disponibles :', 10, 'bold');
    this.addBulletPoint('Valeur totale du stock');
    this.addBulletPoint('Articles OK / en alerte / en rupture / critiques');
    this.addBulletPoint('Total des dettes fournisseurs');
    this.addBulletPoint('Nombre de fournisseurs actifs');
    this.addBulletPoint('Tendances et évolution des ventes');
    this.addBulletPoint('Graphiques de croissance');
  }

  generateFAQ() {
    this.doc.addPage();
    this.currentY = this.margin;

    this.addTitle('5. FAQ et Résolution de problèmes', 18);
    this.addSpace(10);

    const faqs = [
      {
        question: 'Comment puis-je imprimer une facture ?',
        answer: 'Dans la page Ventes, cliquez sur le menu actions (trois points) de la vente concernée, puis sélectionnez "Imprimer facture". La facture s\'ouvrira dans une nouvelle fenêtre et vous pourrez l\'imprimer.'
      },
      {
        question: 'Que faire si un client a un crédit en cours ?',
        answer: 'Allez dans la page "Versements clients" (paiements clients), cliquez sur "Nouveau versement", sélectionnez le client et enregistrez le montant payé. Le crédit sera automatiquement mis à jour.'
      },
      {
        question: 'Comment gérer un retour d\'article ?',
        answer: 'Allez dans la page "Retours clients", créez un nouveau retour, sélectionnez la vente concernée et les articles retournés. Le stock sera automatiquement réajusté et un remboursement ou crédit sera créé pour le client.'
      },
      {
        question: 'Comment savoir quels articles sont en rupture de stock ?',
        answer: 'Le tableau de bord affiche les alertes stock. Vous pouvez aussi aller dans la page Stock et filtrer par articles en alerte. Les articles en rouge sont ceux dont la quantité est inférieure au seuil d\'alerte.'
      },
      {
        question: 'Comment modifier mon mot de passe ?',
        answer: 'Cliquez sur votre profil en haut à droite, puis sélectionnez "Changer le mot de passe". Entrez votre ancien mot de passe et le nouveau, puis validez.'
      },
      {
        question: 'Puis-je annuler une vente ?',
        answer: 'Oui, si vous avez les permissions nécessaires. Dans la page Ventes, cliquez sur le menu actions de la vente et sélectionnez "Supprimer". Attention : le stock sera réajusté et l\'opération ne peut pas être annulée.'
      },
      {
        question: 'Comment voir l\'historique des achats d\'un client ?',
        answer: 'Dans la page Clients, cliquez sur le bouton "Voir détails" du client. Une fenêtre s\'ouvrira avec l\'historique complet de ses achats et paiements.'
      },
      {
        question: 'Que faire en cas d\'erreur de quantité dans le stock ?',
        answer: 'Utilisez la fonction Inventaire pour corriger les quantités. Créez un nouvel inventaire, comptez les articles physiques et entrez les quantités réelles. Le système ajustera automatiquement le stock.'
      },
      {
        question: 'Comment partager une facture par WhatsApp ?',
        answer: 'Dans la page Ventes, cliquez sur le menu actions de la vente et sélectionnez "Partager WhatsApp". Cela ouvrira WhatsApp avec un message pré-rempli contenant les détails de la facture.'
      },
      {
        question: 'Où puis-je voir les statistiques de vente du mois ?',
        answer: 'Les statistiques du mois sont affichées en haut de la page Ventes (total CA, bénéfice, dettes). Pour des statistiques plus détaillées, consultez le tableau de bord ou la page Analytics.'
      }
    ];

    faqs.forEach((faq, index) => {
      this.addSubtitle(`${index + 1}. ${faq.question}`, 12);
      this.addText(faq.answer);
      this.addSpace(8);
    });

    this.addSpace(15);
    this.addSubtitle('Besoin d\'aide supplémentaire ?', 14);
    this.addText(
      'Si vous rencontrez un problème non résolu dans cette documentation, ' +
      'contactez votre administrateur système ou le support technique.'
    );
  }

  save() {
    this.doc.save(OUTPUT_PDF);
    console.log(`\n✅ PDF généré avec succès: ${OUTPUT_PDF}`);
  }
}

async function main() {
  console.log('🚀 Génération du PDF de documentation...\n');

  // Vérifier que le dossier screenshots existe
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    console.error('❌ Erreur: Le dossier screenshots n\'existe pas.');
    console.log('Veuillez d\'abord exécuter le script de génération des captures d\'écran.');
    process.exit(1);
  }

  // Charger l'index des screenshots
  const indexPath = path.join(SCREENSHOTS_DIR, 'index.json');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Erreur: L\'index des screenshots n\'existe pas.');
    console.log('Veuillez d\'abord exécuter le script de génération des captures d\'écran.');
    process.exit(1);
  }

  const screenshots: Screenshot[] = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  console.log(`📸 ${screenshots.length} captures d'écran trouvées\n`);

  // Créer le PDF
  const generator = new PDFGenerator();

  console.log('Génération de la page de couverture...');
  generator.generateCoverPage();

  console.log('Génération de la table des matières...');
  generator.generateTableOfContents();

  console.log('Génération de l\'introduction...');
  generator.generateIntroduction();

  console.log('Génération de la section Vendeurs...');
  generator.generateVendeurSection(screenshots);

  console.log('Génération de la section Administrateurs...');
  generator.generateAdminSection(screenshots);

  console.log('Génération de la FAQ...');
  generator.generateFAQ();

  console.log('Sauvegarde du PDF...');
  generator.save();

  console.log('\n✅ Génération terminée !');
  console.log(`📄 PDF disponible: ${OUTPUT_PDF}`);
}

main().catch(console.error);
