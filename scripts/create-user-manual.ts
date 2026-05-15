import { jsPDF } from 'jspdf';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'documentation');
const OUTPUT_PDF = path.join(OUTPUT_DIR, 'Manuel-Utilisateur-Walli-Industrie.pdf');

class ManualGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private lineHeight: number;
  private pageNumber: number;

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
    this.pageNumber = 1;
  }

  private addPageNumber() {
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(150, 150, 150);
    const pageText = `Page ${this.pageNumber}`;
    const textWidth = this.doc.getTextWidth(pageText);
    this.doc.text(pageText, (this.pageWidth - textWidth) / 2, this.pageHeight - 10);
    this.doc.setTextColor(0, 0, 0);
  }

  private checkPageBreak(height: number) {
    if (this.currentY + height > this.pageHeight - this.margin - 10) {
      this.addPageNumber();
      this.doc.addPage();
      this.pageNumber++;
      this.currentY = this.margin;
      return true;
    }
    return false;
  }

  private addTitle(text: string, size: number = 20) {
    this.checkPageBreak(size);
    this.doc.setFontSize(size);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 51, 102); // Bleu foncé
    this.doc.text(text, this.margin, this.currentY);
    this.doc.setTextColor(0, 0, 0);
    this.currentY += size / 2 + 5;
  }

  private addSubtitle(text: string, size: number = 14) {
    this.checkPageBreak(size);
    this.doc.setFontSize(size);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(51, 102, 153); // Bleu moyen
    this.doc.text(text, this.margin, this.currentY);
    this.doc.setTextColor(0, 0, 0);
    this.currentY += size / 2 + 3;
  }

  private addText(text: string, size: number = 10, style: 'normal' | 'bold' | 'italic' = 'normal') {
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

  private addBulletPoint(text: string) {
    this.checkPageBreak(this.lineHeight);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const maxWidth = this.pageWidth - 2 * this.margin - 10;
    const lines = this.doc.splitTextToSize(text, maxWidth);

    this.doc.text('•', this.margin + 5, this.currentY);
    this.doc.text(lines[0], this.margin + 10, this.currentY);
    this.currentY += this.lineHeight;

    for (let i = 1; i < lines.length; i++) {
      this.checkPageBreak(this.lineHeight);
      this.doc.text(lines[i], this.margin + 10, this.currentY);
      this.currentY += this.lineHeight;
    }
  }

  private addNumberedItem(number: number, text: string) {
    this.checkPageBreak(this.lineHeight);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const maxWidth = this.pageWidth - 2 * this.margin - 15;
    const lines = this.doc.splitTextToSize(text, maxWidth);

    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${number}.`, this.margin + 5, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(lines[0], this.margin + 15, this.currentY);
    this.currentY += this.lineHeight;

    for (let i = 1; i < lines.length; i++) {
      this.checkPageBreak(this.lineHeight);
      this.doc.text(lines[i], this.margin + 15, this.currentY);
      this.currentY += this.lineHeight;
    }
  }

  private addBox(text: string, color: [number, number, number] = [240, 240, 240]) {
    const maxWidth = this.pageWidth - 2 * this.margin - 10;
    const lines = this.doc.splitTextToSize(text, maxWidth);
    const boxHeight = lines.length * this.lineHeight + 6;

    this.checkPageBreak(boxHeight);

    // Dessiner le rectangle de fond
    this.doc.setFillColor(color[0], color[1], color[2]);
    this.doc.rect(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, boxHeight, 'F');

    // Ajouter le texte
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'italic');
    lines.forEach((line: string, index: number) => {
      this.doc.text(line, this.margin + 5, this.currentY + index * this.lineHeight);
    });

    this.currentY += boxHeight + 3;
  }

  generateCoverPage() {
    // Titre
    this.currentY = 60;
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 51, 102);
    const title = 'MANUEL UTILISATEUR';
    const titleWidth = this.doc.getTextWidth(title);
    this.doc.text(title, (this.pageWidth - titleWidth) / 2, this.currentY);

    // Nom de l'application
    this.currentY += 20;
    this.doc.setFontSize(26);
    this.doc.setTextColor(51, 102, 153);
    const appName = 'Application de Gestion de Boutique';
    const appNameWidth = this.doc.getTextWidth(appName);
    this.doc.text(appName, (this.pageWidth - appNameWidth) / 2, this.currentY);

    // Entreprise
    this.currentY += 15;
    this.doc.setFontSize(22);
    this.doc.setTextColor(0, 0, 0);
    const company = 'WALLI INDUSTRIE';
    const companyWidth = this.doc.getTextWidth(company);
    this.doc.text(company, (this.pageWidth - companyWidth) / 2, this.currentY);

    // Rectangle décoratif
    this.currentY += 20;
    this.doc.setDrawColor(51, 102, 153);
    this.doc.setLineWidth(0.5);
    this.doc.line(40, this.currentY, this.pageWidth - 40, this.currentY);

    // Description
    this.currentY += 15;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    const desc = 'Guide complet pour la gestion quotidienne\nde votre boutique de vêtements traditionnels';
    const descLines = desc.split('\n');
    descLines.forEach(line => {
      const lineWidth = this.doc.getTextWidth(line);
      this.doc.text(line, (this.pageWidth - lineWidth) / 2, this.currentY);
      this.currentY += 8;
    });

    // Version et date
    this.currentY = this.pageHeight - 60;
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    const version = 'Version 1.0';
    const versionWidth = this.doc.getTextWidth(version);
    this.doc.text(version, (this.pageWidth - versionWidth) / 2, this.currentY);

    this.currentY += 10;
    this.doc.setFont('helvetica', 'normal');
    const date = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long'
    });
    const dateWidth = this.doc.getTextWidth(date);
    this.doc.text(date, (this.pageWidth - dateWidth) / 2, this.currentY);

    this.addPageNumber();
  }

  generateTableOfContents() {
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addTitle('Table des matières', 18);
    this.addSpace(10);

    const toc = [
      '1. Introduction',
      '2. Connexion à l\'application',
      '3. Interface générale',
      '',
      '4. Guide pour les Vendeurs',
      '   4.1 Tableau de bord',
      '   4.2 Gestion des clients',
      '   4.3 Enregistrement des ventes',
      '   4.4 Consultation du stock',
      '   4.5 Gestion des commandes',
      '   4.6 Paiements clients',
      '',
      '5. Guide pour les Administrateurs',
      '   5.1 Gestion des fournisseurs',
      '   5.2 Approvisionnements',
      '   5.3 Paiements fournisseurs',
      '   5.4 Gestion avancée du stock',
      '   5.5 Inventaires',
      '   5.6 Gestion des dépenses',
      '   5.7 Gestion des utilisateurs',
      '   5.8 Analyses et rapports',
      '',
      '6. Questions fréquentes (FAQ)',
      '7. Support et assistance'
    ];

    this.doc.setFontSize(11);
    toc.forEach(item => {
      if (item === '') {
        this.addSpace(3);
        return;
      }
      this.checkPageBreak(this.lineHeight);
      this.doc.setFont('helvetica', item.startsWith('   ') ? 'normal' : 'bold');
      this.doc.text(item, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    });

    this.addPageNumber();
  }

  generateIntroduction() {
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addTitle('1. Introduction');
    this.addSpace(5);

    this.addText(
      'Bienvenue dans le manuel utilisateur de l\'application de Gestion de Boutique Walli Industrie. ' +
      'Cette application complète a été spécialement conçue pour faciliter et optimiser la gestion quotidienne ' +
      'de votre boutique de vêtements traditionnels.'
    );
    this.addSpace(8);

    this.addSubtitle('À propos de cette application');
    this.addText(
      'L\'application offre une solution intégrée pour gérer tous les aspects de votre activité commerciale :'
    );
    this.addSpace(3);

    this.addBulletPoint('Gestion complète des clients et suivi de leurs achats');
    this.addBulletPoint('Enregistrement et suivi des ventes avec plusieurs modes de paiement');
    this.addBulletPoint('Gestion du stock avec alertes automatiques');
    this.addBulletPoint('Suivi des fournisseurs et des approvisionnements');
    this.addBulletPoint('Gestion des commandes clients');
    this.addBulletPoint('Suivi des paiements et des crédits');
    this.addBulletPoint('Gestion des dépenses et analyses financières');
    this.addBulletPoint('Tableaux de bord et statistiques en temps réel');
    this.addSpace(8);

    this.addSubtitle('Public visé');
    this.addText(
      'Ce manuel s\'adresse à deux profils d\'utilisateurs principaux :'
    );
    this.addSpace(3);

    this.addBulletPoint('Vendeurs et employés : Accès aux fonctionnalités quotidiennes de vente, gestion client et consultation du stock');
    this.addBulletPoint('Administrateurs : Accès complet incluant la gestion des fournisseurs, du stock, des utilisateurs, des dépenses et des analyses avancées');
    this.addSpace(8);

    this.addSubtitle('Organisation du manuel');
    this.addText(
      'Ce manuel est organisé de manière progressive. Nous commençons par les fonctionnalités de base ' +
      'accessibles à tous les utilisateurs, puis nous abordons les fonctionnalités avancées réservées aux administrateurs. ' +
      'Chaque section contient des explications détaillées et des procédures étape par étape.'
    );

    this.addPageNumber();
  }

  generateLoginSection() {
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addTitle('2. Connexion à l\'application');
    this.addSpace(5);

    this.addSubtitle('Accéder à l\'application');
    this.addText(
      'Pour accéder à l\'application, ouvrez votre navigateur web (Google Chrome, Firefox, Edge ou Safari) ' +
      'et entrez l\'adresse fournie par votre administrateur système.'
    );
    this.addSpace(8);

    this.addSubtitle('Procédure de connexion');
    this.addText('Pour vous connecter, suivez ces étapes :', 10, 'bold');
    this.addSpace(3);

    this.addNumberedItem(1, 'Sur la page de connexion, entrez votre adresse email professionnelle dans le champ "Email"');
    this.addNumberedItem(2, 'Saisissez votre mot de passe dans le champ "Mot de passe"');
    this.addNumberedItem(3, 'Cliquez sur le bouton "Se connecter"');
    this.addSpace(5);

    this.addBox(
      'IMPORTANT : Vos identifiants sont personnels et confidentiels. Ne les partagez avec personne. ' +
      'Si vous avez oublié votre mot de passe, contactez votre administrateur système.',
      [255, 240, 240]
    );
    this.addSpace(8);

    this.addSubtitle('Modifier votre mot de passe');
    this.addText('Pour des raisons de sécurité, il est recommandé de changer régulièrement votre mot de passe :');
    this.addSpace(3);

    this.addNumberedItem(1, 'Cliquez sur votre nom d\'utilisateur en haut à droite de l\'écran');
    this.addNumberedItem(2, 'Sélectionnez "Changer le mot de passe" dans le menu');
    this.addNumberedItem(3, 'Entrez votre ancien mot de passe');
    this.addNumberedItem(4, 'Saisissez deux fois votre nouveau mot de passe');
    this.addNumberedItem(5, 'Cliquez sur "Confirmer"');
    this.addSpace(8);

    this.addSubtitle('Déconnexion');
    this.addText(
      'Pour vous déconnecter de l\'application, cliquez sur votre nom en haut à droite, ' +
      'puis sélectionnez "Déconnexion". Il est recommandé de toujours vous déconnecter lorsque vous quittez votre poste de travail.'
    );

    this.addPageNumber();
  }

  generateInterfaceSection() {
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addTitle('3. Interface générale');
    this.addSpace(5);

    this.addSubtitle('Barre de navigation');
    this.addText(
      'La barre de navigation latérale (à gauche de l\'écran) vous permet d\'accéder rapidement à toutes les fonctionnalités de l\'application. ' +
      'Elle affiche le logo de votre boutique en haut, suivi de la liste des modules disponibles.'
    );
    this.addSpace(5);

    this.addText('Les modules affichés dépendent de vos permissions :', 10, 'bold');
    this.addBulletPoint('Dashboard : Tableau de bord avec statistiques globales');
    this.addBulletPoint('Clients : Gestion de la clientèle');
    this.addBulletPoint('Ventes : Enregistrement et suivi des ventes');
    this.addBulletPoint('Stock : Gestion des articles en stock');
    this.addBulletPoint('Commandes : Suivi des commandes clients');
    this.addBulletPoint('Et d\'autres modules selon vos droits d\'accès');
    this.addSpace(8);

    this.addSubtitle('En-tête de page');
    this.addText(
      'L\'en-tête de chaque page affiche le titre de la page actuelle et, à droite, votre profil utilisateur. ' +
      'Sur mobile, vous verrez un menu hamburger (trois lignes) pour afficher/masquer la barre de navigation.'
    );
    this.addSpace(8);

    this.addSubtitle('Fonctionnalités communes');
    this.addText('Dans la plupart des pages, vous trouverez :');
    this.addSpace(3);

    this.addBulletPoint('Barre de recherche : Pour rechercher rapidement un élément (client, article, vente, etc.)');
    this.addBulletPoint('Bouton d\'ajout : Généralement en haut à droite, pour créer un nouvel élément');
    this.addBulletPoint('Filtres : Pour affiner l\'affichage selon différents critères');
    this.addBulletPoint('Tableau de données : Présentation organisée des informations');
    this.addBulletPoint('Pagination : Navigation entre les pages lorsqu\'il y a beaucoup de données');
    this.addBulletPoint('Menu d\'actions : Trois points verticaux pour accéder aux options (modifier, supprimer, etc.)');

    this.addPageNumber();
  }

  generateVendeurGuide() {
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addTitle('4. Guide pour les Vendeurs');
    this.addSpace(5);

    // 4.1 Dashboard
    this.addSubtitle('4.1 Tableau de bord');
    this.addText(
      'Le tableau de bord est la première page que vous voyez après connexion. ' +
      'Il présente un résumé visuel des indicateurs clés de la boutique.'
    );
    this.addSpace(5);

    this.addText('Informations affichées :', 10, 'bold');
    this.addBulletPoint('Chiffre d\'affaires du mois en cours avec tendance par rapport au mois précédent');
    this.addBulletPoint('Nombre et montant total des ventes du jour');
    this.addBulletPoint('État du stock avec nombre d\'articles en alerte');
    this.addBulletPoint('Total des dettes fournisseurs en cours');
    this.addBulletPoint('Graphique des ventes de la semaine');
    this.addBulletPoint('Liste des dernières ventes effectuées');
    this.addBulletPoint('Top 5 des meilleurs clients');
    this.addBulletPoint('Derniers approvisionnements reçus');
    this.addSpace(10);

    // 4.2 Gestion des clients
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addSubtitle('4.2 Gestion des clients');
    this.addText(
      'La page Clients vous permet de gérer l\'ensemble de votre clientèle. ' +
      'Vous pouvez créer de nouveaux clients, consulter leurs informations et suivre leur historique d\'achats.'
    );
    this.addSpace(5);

    this.addText('Créer un nouveau client :', 10, 'bold');
    this.addNumberedItem(1, 'Cliquez sur le bouton "Nouveau client" en haut à droite');
    this.addNumberedItem(2, 'Remplissez le formulaire avec les informations du client :');
    this.addBulletPoint('Nom et prénom (obligatoires)');
    this.addBulletPoint('Numéro de téléphone');
    this.addBulletPoint('Adresse email (optionnel)');
    this.addBulletPoint('Adresse physique');
    this.addNumberedItem(3, 'Cliquez sur "Enregistrer"');
    this.addSpace(5);

    this.addText('Rechercher un client :', 10, 'bold');
    this.addText(
      'Utilisez la barre de recherche en haut de la page. Tapez le nom ou le prénom du client. ' +
      'Les résultats s\'affichent automatiquement pendant la saisie.'
    );
    this.addSpace(5);

    this.addText('Filtrer les clients :', 10, 'bold');
    this.addBulletPoint('Tous les clients : Affiche l\'ensemble de la clientèle');
    this.addBulletPoint('Clients avec crédits : Affiche uniquement les clients ayant un crédit en cours');
    this.addSpace(5);

    this.addText('Voir les détails d\'un client :', 10, 'bold');
    this.addNumberedItem(1, 'Cliquez sur le bouton "Voir détails" du client concerné');
    this.addNumberedItem(2, 'Une fenêtre s\'ouvre avec :');
    this.addBulletPoint('Informations complètes du client');
    this.addBulletPoint('Historique de tous ses achats');
    this.addBulletPoint('Historique de ses paiements');
    this.addBulletPoint('Montant total de ses achats');
    this.addBulletPoint('Crédit en cours (si applicable)');
    this.addSpace(8);

    this.addText('Modifier ou supprimer un client :', 10, 'bold');
    this.addText(
      'Cliquez sur le menu actions (trois points) à droite de la ligne du client, ' +
      'puis sélectionnez "Modifier" ou "Supprimer". La suppression nécessite une confirmation.'
    );
    this.addSpace(10);

    // 4.3 Ventes
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addSubtitle('4.3 Enregistrement des ventes');
    this.addText(
      'La page Ventes est l\'outil principal pour enregistrer et gérer toutes les transactions commerciales.'
    );
    this.addSpace(5);

    this.addText('Créer une nouvelle vente :', 10, 'bold');
    this.addNumberedItem(1, 'Cliquez sur "Nouvelle vente"');
    this.addNumberedItem(2, 'Sélectionnez le client dans la liste déroulante');
    this.addBox('ASTUCE : Si le client n\'existe pas encore, utilisez la fonction de création rapide pour l\'ajouter immédiatement.', [240, 248, 255]);
    this.addNumberedItem(3, 'Ajoutez les articles vendus :');
    this.addBulletPoint('Sélectionnez l\'article dans la liste');
    this.addBulletPoint('Indiquez la quantité vendue');
    this.addBulletPoint('Le prix unitaire se remplit automatiquement (modifiable si nécessaire)');
    this.addBulletPoint('Cliquez sur "Ajouter" pour ajouter l\'article à la vente');
    this.addBulletPoint('Répétez pour chaque article de la vente');
    this.addNumberedItem(4, 'Choisissez le mode de paiement :');
    this.addBulletPoint('Espèces : Paiement comptant en liquide');
    this.addBulletPoint('Mobile Money : Paiement par téléphone mobile');
    this.addBulletPoint('Virement : Transfert bancaire');
    this.addBulletPoint('Crédit : Le client paiera plus tard');
    this.addBulletPoint('Acompte 50% : Le client paie la moitié maintenant');
    this.addNumberedItem(5, 'Indiquez le montant payé (important pour les crédits et acomptes)');
    this.addNumberedItem(6, 'Ajoutez une note si nécessaire (optionnel)');
    this.addNumberedItem(7, 'Cliquez sur "Enregistrer"');
    this.addSpace(5);

    this.addBox(
      'IMPORTANT : Le stock est automatiquement mis à jour lors de l\'enregistrement de la vente. ' +
      'Assurez-vous que les quantités saisies sont correctes.',
      [255, 240, 240]
    );
    this.addSpace(8);

    this.addText('Consulter les ventes :', 10, 'bold');
    this.addText(
      'Le tableau affiche toutes les ventes avec : numéro de vente, client, articles, quantité totale, ' +
      'montant total, mode de paiement, date et actions disponibles. Un badge rouge "Crédit" apparaît ' +
      'si un montant reste à payer.'
    );
    this.addSpace(5);

    this.addText('Statistiques du mois :', 10, 'bold');
    this.addText('En haut de la page, trois indicateurs vous informent sur :');
    this.addBulletPoint('Total des ventes du mois en cours');
    this.addBulletPoint('Bénéfice total du mois');
    this.addBulletPoint('Total des crédits en cours');
    this.addSpace(8);

    this.addText('Actions sur une vente :', 10, 'bold');
    this.addBulletPoint('Voir détails : Affiche tous les détails de la vente avec articles et paiements');
    this.addBulletPoint('Imprimer facture : Génère une facture PDF imprimable');
    this.addBulletPoint('Partager WhatsApp : Partage les détails de la vente par WhatsApp');
    this.addBulletPoint('Modifier : Permet de corriger une vente (si autorisé)');
    this.addBulletPoint('Supprimer : Annule la vente (le stock est réajusté automatiquement)');

    this.addPageNumber();

    // 4.4 Stock
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addSubtitle('4.4 Consultation du stock');
    this.addText(
      'La page Stock vous permet de consulter tous les articles disponibles, leurs quantités et leurs emplacements.'
    );
    this.addSpace(5);

    this.addText('Informations affichées pour chaque article :', 10, 'bold');
    this.addBulletPoint('Photo de l\'article (si disponible)');
    this.addBulletPoint('Code article et nom');
    this.addBulletPoint('Catégorie (ex: Boubous, Chaussures, Accessoires)');
    this.addBulletPoint('Zone de stockage (ex: Rayon A, Étagère 1)');
    this.addBulletPoint('Quantité en stock actuelle');
    this.addBulletPoint('Seuil d\'alerte (quantité minimale à maintenir)');
    this.addBulletPoint('Prix d\'achat et prix de vente');
    this.addSpace(5);

    this.addBox(
      'ATTENTION : Les articles dont la quantité est inférieure au seuil d\'alerte sont affichés en rouge. ' +
      'Informez votre responsable stock pour procéder à un réapprovisionnement.',
      [255, 240, 240]
    );
    this.addSpace(8);

    this.addText('Rechercher un article :', 10, 'bold');
    this.addText(
      'Utilisez la barre de recherche pour trouver un article par son code ou son nom. ' +
      'Vous pouvez également filtrer par catégorie en utilisant le menu déroulant.'
    );
    this.addSpace(5);

    this.addText('Consulter l\'historique d\'un article :', 10, 'bold');
    this.addText(
      'Cliquez sur "Voir détails" pour afficher l\'historique complet des mouvements de l\'article : ' +
      'ventes, approvisionnements, retours et ajustements d\'inventaire.'
    );

    this.addPageNumber();

    // 4.5 Commandes
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addSubtitle('4.5 Gestion des commandes');
    this.addText(
      'La page Commandes permet de gérer les commandes passées par vos clients et de suivre leur statut.'
    );
    this.addSpace(5);

    this.addText('Créer une commande client :', 10, 'bold');
    this.addNumberedItem(1, 'Cliquez sur "Nouvelle commande"');
    this.addNumberedItem(2, 'Sélectionnez le client');
    this.addNumberedItem(3, 'Ajoutez les articles commandés avec leurs quantités');
    this.addNumberedItem(4, 'Indiquez la date de livraison prévue');
    this.addNumberedItem(5, 'Ajoutez une note si nécessaire');
    this.addNumberedItem(6, 'Cliquez sur "Enregistrer"');
    this.addSpace(8);

    this.addText('Statuts des commandes :', 10, 'bold');
    this.addBulletPoint('En attente : Commande enregistrée, en attente de traitement');
    this.addBulletPoint('En préparation : Commande en cours de préparation');
    this.addBulletPoint('Livrée : Commande livrée au client');
    this.addBulletPoint('Annulée : Commande annulée');
    this.addSpace(5);

    this.addText('Gérer une commande :', 10, 'bold');
    this.addBulletPoint('Marquer comme livrée : Cliquez sur "Marquer livrée" quand le client reçoit sa commande');
    this.addBulletPoint('Annuler : Utilisez cette option si la commande est annulée');
    this.addBulletPoint('Imprimer : Imprimez le bon de commande pour préparation');
    this.addSpace(8);

    this.addText('Filtrer les commandes :', 10, 'bold');
    this.addText(
      'Utilisez les filtres en haut de la page pour afficher uniquement les commandes d\'un certain statut, ' +
      'd\'un client spécifique ou d\'une période donnée.'
    );

    this.addPageNumber();

    // 4.6 Versements clients
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addSubtitle('4.6 Paiements clients (Versements)');
    this.addText(
      'Cette page permet d\'enregistrer les paiements des clients qui ont acheté à crédit ou avec acompte.'
    );
    this.addSpace(5);

    this.addText('Enregistrer un paiement client :', 10, 'bold');
    this.addNumberedItem(1, 'Cliquez sur "Nouveau versement"');
    this.addNumberedItem(2, 'Sélectionnez le client qui effectue le paiement');
    this.addBulletPoint('Seuls les clients ayant un crédit en cours sont affichés');
    this.addBulletPoint('Le montant de leur crédit actuel est indiqué');
    this.addNumberedItem(3, 'Indiquez le montant payé');
    this.addNumberedItem(4, 'Choisissez le mode de paiement (Espèces, Mobile Money, Virement)');
    this.addNumberedItem(5, 'Ajoutez une référence de paiement si disponible (ex: numéro de transaction)');
    this.addNumberedItem(6, 'Ajoutez une note si nécessaire');
    this.addNumberedItem(7, 'Cliquez sur "Enregistrer"');
    this.addSpace(5);

    this.addBox(
      'Le crédit du client est automatiquement mis à jour après l\'enregistrement du paiement.',
      [240, 248, 255]
    );
    this.addSpace(8);

    this.addText('Consulter les statistiques :', 10, 'bold');
    this.addText('La page affiche :');
    this.addBulletPoint('Total des crédits en cours de tous les clients');
    this.addBulletPoint('Montant total des paiements reçus dans le mois');
    this.addBulletPoint('Nombre de clients ayant actuellement un crédit');
    this.addSpace(5);

    this.addText('Historique des paiements :', 10, 'bold');
    this.addText(
      'Le tableau affiche tous les paiements enregistrés avec la date, le client, le montant, ' +
      'le mode de paiement et la référence. Utilisez la recherche pour trouver rapidement un paiement spécifique.'
    );

    this.addPageNumber();
  }

  generateAdminGuide() {
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addTitle('5. Guide pour les Administrateurs');
    this.addSpace(5);

    this.addText(
      'En plus de toutes les fonctionnalités accessibles aux vendeurs, les administrateurs ont accès à des modules avancés ' +
      'pour la gestion complète de la boutique. Cette section décrit ces fonctionnalités supplémentaires.'
    );
    this.addSpace(10);

    // 5.1 Fournisseurs
    this.addSubtitle('5.1 Gestion des fournisseurs');
    this.addText(
      'La page Fournisseurs permet de gérer tous vos fournisseurs, suivre les approvisionnements et les dettes.'
    );
    this.addSpace(5);

    this.addText('Créer un nouveau fournisseur :', 10, 'bold');
    this.addNumberedItem(1, 'Cliquez sur "Nouveau fournisseur"');
    this.addNumberedItem(2, 'Remplissez les informations :');
    this.addBulletPoint('Nom du fournisseur');
    this.addBulletPoint('Personne de contact');
    this.addBulletPoint('Numéro de téléphone');
    this.addBulletPoint('Adresse email');
    this.addBulletPoint('Adresse physique');
    this.addBulletPoint('Modalités de paiement (ex: paiement à 30 jours)');
    this.addNumberedItem(3, 'Cliquez sur "Enregistrer"');
    this.addSpace(5);

    this.addText('Consulter les détails d\'un fournisseur :', 10, 'bold');
    this.addText('Cliquez sur "Voir détails" pour afficher :');
    this.addBulletPoint('Informations complètes du fournisseur');
    this.addBulletPoint('Montant total acheté à ce fournisseur');
    this.addBulletPoint('Dette actuelle envers le fournisseur');
    this.addBulletPoint('Historique de tous les approvisionnements');
    this.addBulletPoint('Historique de tous les paiements effectués');
    this.addSpace(8);

    this.addText('Rechercher et filtrer :', 10, 'bold');
    this.addText(
      'Utilisez la barre de recherche pour trouver un fournisseur par son nom. ' +
      'Les fournisseurs avec lesquels vous travaillez régulièrement peuvent être marqués comme favoris (étoile).'
    );

    this.addPageNumber();

    // 5.2 Approvisionnements
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addSubtitle('5.2 Approvisionnements');
    this.addText(
      'La page Approvisionnements permet d\'enregistrer tous les achats effectués auprès de vos fournisseurs.'
    );
    this.addSpace(5);

    this.addText('Créer un approvisionnement :', 10, 'bold');
    this.addNumberedItem(1, 'Cliquez sur "Nouvel approvisionnement"');
    this.addNumberedItem(2, 'Sélectionnez le fournisseur');
    this.addNumberedItem(3, 'Ajoutez les articles achetés :');
    this.addBulletPoint('Code de l\'article');
    this.addBulletPoint('Quantité achetée');
    this.addBulletPoint('Prix unitaire d\'achat');
    this.addBulletPoint('Le système calcule automatiquement le total');
    this.addNumberedItem(4, 'Indiquez la date de livraison');
    this.addNumberedItem(5, 'Cliquez sur "Enregistrer"');
    this.addSpace(5);

    this.addBox(
      'IMPORTANT : Dès l\'enregistrement de l\'approvisionnement, le stock est automatiquement mis à jour. ' +
      'Les quantités des articles sont augmentées et la dette fournisseur est actualisée.',
      [255, 240, 240]
    );
    this.addSpace(8);

    this.addText('Consulter les approvisionnements :', 10, 'bold');
    this.addText(
      'Le tableau affiche tous les approvisionnements avec le numéro, le fournisseur, le nombre d\'articles, ' +
      'la quantité totale, le montant total et la date. Utilisez la recherche pour filtrer par numéro ou fournisseur.'
    );
    this.addSpace(5);

    this.addText('Imprimer un bon de livraison :', 10, 'bold');
    this.addText(
      'Cliquez sur le menu actions de l\'approvisionnement, puis sélectionnez "Imprimer". ' +
      'Cela génère un bon de livraison PDF avec le logo de votre boutique et tous les détails de l\'approvisionnement.'
    );

    this.addPageNumber();

    // 5.3 Versements fournisseurs
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addSubtitle('5.3 Paiements fournisseurs');
    this.addText(
      'Cette page permet de gérer tous les paiements effectués à vos fournisseurs et de suivre les dettes.'
    );
    this.addSpace(5);

    this.addText('Enregistrer un paiement fournisseur :', 10, 'bold');
    this.addNumberedItem(1, 'Cliquez sur "Nouveau versement"');
    this.addNumberedItem(2, 'Sélectionnez le fournisseur à payer');
    this.addNumberedItem(3, 'Indiquez le montant du paiement');
    this.addNumberedItem(4, 'Choisissez le mode de paiement (Espèces, Virement, Mobile Money)');
    this.addNumberedItem(5, 'Ajoutez une référence (ex: numéro de chèque, numéro de virement)');
    this.addNumberedItem(6, 'Ajoutez une note si nécessaire');
    this.addNumberedItem(7, 'Cliquez sur "Enregistrer"');
    this.addSpace(5);

    this.addText('Vue d\'ensemble des dettes :', 10, 'bold');
    this.addText('La page affiche :');
    this.addBulletPoint('Total de toutes les dettes fournisseurs');
    this.addBulletPoint('Nombre de fournisseurs auxquels vous devez de l\'argent');
    this.addBulletPoint('Liste détaillée par fournisseur avec :');
    this.addBulletPoint('  - Montant total acheté');
    this.addBulletPoint('  - Montant total déjà payé');
    this.addBulletPoint('  - Dette restante');
    this.addSpace(5);

    this.addText('Historique des versements :', 10, 'bold');
    this.addText(
      'Le tableau affiche tous les paiements avec date, fournisseur, montant, mode de paiement et référence. ' +
      'Vous pouvez rechercher un paiement spécifique ou filtrer par fournisseur.'
    );

    this.addPageNumber();

    // 5.4 Stock avancé
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addSubtitle('5.4 Gestion avancée du stock');
    this.addText(
      'En tant qu\'administrateur, vous avez accès à des fonctionnalités supplémentaires pour gérer le stock.'
    );
    this.addSpace(5);

    this.addText('Créer un nouvel article :', 10, 'bold');
    this.addNumberedItem(1, 'Dans la page Stock, cliquez sur "Nouvel article"');
    this.addNumberedItem(2, 'Remplissez les informations :');
    this.addBulletPoint('Code article (unique)');
    this.addBulletPoint('Nom de l\'article');
    this.addBulletPoint('Description détaillée');
    this.addBulletPoint('Prix d\'achat');
    this.addBulletPoint('Prix de vente');
    this.addBulletPoint('Catégorie (ou créez-en une nouvelle)');
    this.addBulletPoint('Zone de stockage');
    this.addBulletPoint('Quantité initiale en stock');
    this.addBulletPoint('Seuil d\'alerte (quantité minimale)');
    this.addNumberedItem(3, 'Ajoutez une photo de l\'article (optionnel mais recommandé)');
    this.addNumberedItem(4, 'Cliquez sur "Enregistrer"');
    this.addSpace(8);

    this.addText('Gestion des catégories :', 10, 'bold');
    this.addText(
      'Allez dans la page Catégories pour créer, modifier ou supprimer des catégories d\'articles. ' +
      'Les catégories vous aident à organiser votre stock (ex: Boubous, Chaussures, Accessoires, Tissus).'
    );
    this.addSpace(5);

    this.addText('Gestion des zones de stockage :', 10, 'bold');
    this.addText(
      'Allez dans la page Zones pour créer, modifier ou supprimer des zones de stockage. ' +
      'Les zones vous permettent de localiser physiquement vos articles (ex: Rayon A, Étagère 1, Réserve, Vitrine).'
    );
    this.addSpace(5);

    this.addText('Historique des mouvements de stock :', 10, 'bold');
    this.addText(
      'La page Mouvements Stock affiche l\'historique complet de tous les mouvements de stock. ' +
      'Vous pouvez filtrer par type (entrée/sortie), par motif (vente, approvisionnement, retour, ajustement, perte, casse) ' +
      'et par article. Chaque mouvement indique la date, l\'utilisateur responsable et la quantité.'
    );

    this.addPageNumber();

    // 5.5 Inventaires
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addSubtitle('5.5 Inventaires');
    this.addText(
      'Les inventaires permettent de vérifier périodiquement que les quantités dans le système correspondent aux quantités physiques réelles.'
    );
    this.addSpace(5);

    this.addText('Pourquoi faire un inventaire ?', 10, 'bold');
    this.addBulletPoint('Détecter les erreurs de saisie');
    this.addBulletPoint('Identifier les pertes ou vols éventuels');
    this.addBulletPoint('Ajuster le stock pour qu\'il reflète la réalité');
    this.addBulletPoint('Améliorer la gestion du stock');
    this.addSpace(5);

    this.addText('Créer un inventaire :', 10, 'bold');
    this.addNumberedItem(1, 'Dans la page Inventaires, cliquez sur "Nouvel inventaire"');
    this.addNumberedItem(2, 'Sélectionnez la date de démarrage');
    this.addNumberedItem(3, 'Optionnel : sélectionnez des articles spécifiques à compter');
    this.addBulletPoint('Si vous ne sélectionnez rien, tous les articles seront inclus');
    this.addNumberedItem(4, 'Cliquez sur "Créer"');
    this.addSpace(5);

    this.addText('Réaliser le comptage :', 10, 'bold');
    this.addNumberedItem(1, 'Cliquez sur l\'inventaire en cours');
    this.addNumberedItem(2, 'Pour chaque article :');
    this.addBulletPoint('Comptez physiquement la quantité réelle en stock');
    this.addBulletPoint('Entrez cette quantité dans la colonne "Quantité comptée"');
    this.addBulletPoint('Le système affiche la différence avec le stock théorique');
    this.addBulletPoint('Une différence positive = surplus, négative = manque');
    this.addNumberedItem(3, 'Une barre de progression indique l\'avancement du comptage');
    this.addSpace(5);

    this.addText('Valider l\'inventaire :', 10, 'bold');
    this.addNumberedItem(1, 'Une fois tous les articles comptés, cliquez sur "Valider l\'inventaire"');
    this.addNumberedItem(2, 'Confirmez la validation');
    this.addNumberedItem(3, 'Le stock est automatiquement ajusté selon les quantités comptées');
    this.addNumberedItem(4, 'Un mouvement de type "Ajustement" est créé pour chaque différence');
    this.addSpace(5);

    this.addBox(
      'ATTENTION : La validation de l\'inventaire est irréversible. Assurez-vous que toutes les quantités comptées sont correctes avant de valider.',
      [255, 240, 240]
    );

    this.addPageNumber();

    // 5.6 Dépenses
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addSubtitle('5.6 Gestion des dépenses');
    this.addText(
      'La page Dépenses permet d\'enregistrer et de suivre toutes les dépenses de la boutique pour un suivi financier complet.'
    );
    this.addSpace(5);

    this.addText('Enregistrer une dépense :', 10, 'bold');
    this.addNumberedItem(1, 'Cliquez sur "Nouvelle dépense"');
    this.addNumberedItem(2, 'Sélectionnez la date de la dépense');
    this.addNumberedItem(3, 'Choisissez la catégorie de dépense :');
    this.addBulletPoint('Loyer : Loyer du local commercial');
    this.addBulletPoint('Salaires : Paiement des employés');
    this.addBulletPoint('Utilities : Eau, électricité, internet, téléphone');
    this.addBulletPoint('Transport : Frais de transport et livraison');
    this.addBulletPoint('Marketing : Publicité, communication');
    this.addBulletPoint('Autre : Toute autre dépense');
    this.addNumberedItem(4, 'Indiquez le montant de la dépense');
    this.addNumberedItem(5, 'Ajoutez une description détaillée');
    this.addNumberedItem(6, 'Cliquez sur "Enregistrer"');
    this.addSpace(8);

    this.addText('Consulter les dépenses :', 10, 'bold');
    this.addText(
      'Le tableau affiche toutes les dépenses avec la date, la catégorie, la description et le montant. ' +
      'Vous pouvez filtrer par période ou par catégorie pour analyser vos dépenses.'
    );
    this.addSpace(5);

    this.addText('Statistiques des dépenses :', 10, 'bold');
    this.addText('La page affiche :');
    this.addBulletPoint('Total des dépenses du mois en cours');
    this.addBulletPoint('Répartition par catégorie (graphique camembert)');
    this.addBulletPoint('Comparaison avec le mois précédent');
    this.addBulletPoint('Évolution des dépenses sur les derniers mois');

    this.addPageNumber();

    // 5.7 Utilisateurs
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addSubtitle('5.7 Gestion des utilisateurs');
    this.addText(
      'La page Utilisateurs permet de gérer tous les employés qui ont accès à l\'application.'
    );
    this.addSpace(5);

    this.addText('Créer un utilisateur :', 10, 'bold');
    this.addNumberedItem(1, 'Cliquez sur "Nouvel utilisateur"');
    this.addNumberedItem(2, 'Remplissez les informations :');
    this.addBulletPoint('Nom et prénom');
    this.addBulletPoint('Adresse email (servira d\'identifiant de connexion)');
    this.addBulletPoint('Mot de passe initial');
    this.addBulletPoint('Sélectionnez le rôle :');
    this.addBulletPoint('  - ADMIN : Accès complet à toutes les fonctionnalités');
    this.addBulletPoint('  - GESTIONNAIRE : Accès étendu sauf gestion des utilisateurs');
    this.addBulletPoint('  - VENDEUR : Accès aux ventes, clients, commandes');
    this.addBulletPoint('  - GESTIONNAIRE_STOCK : Accès au stock, inventaires, mouvements');
    this.addBulletPoint('  - COMPTABLE : Accès aux finances, versements, dépenses');
    this.addBulletPoint('Définissez le statut : Actif ou Inactif');
    this.addNumberedItem(3, 'Cliquez sur "Enregistrer"');
    this.addSpace(8);

    this.addText('Gérer les utilisateurs :', 10, 'bold');
    this.addBulletPoint('Modifier : Changez les informations, le rôle ou le statut d\'un utilisateur');
    this.addBulletPoint('Désactiver : Mettez le statut sur "Inactif" pour bloquer l\'accès sans supprimer le compte');
    this.addBulletPoint('Supprimer : Supprime définitivement l\'utilisateur (nécessite confirmation)');
    this.addBulletPoint('Réinitialiser le mot de passe : Créez un nouveau mot de passe pour l\'utilisateur');
    this.addSpace(8);

    this.addText('Rôles et permissions :', 10, 'bold');
    this.addText(
      'Consultez la page Rôles pour voir en détail toutes les permissions associées à chaque rôle. ' +
      'Les permissions sont organisées par module (stock, ventes, clients, etc.) et par action (lire, créer, modifier, supprimer).'
    );
    this.addSpace(5);

    this.addBox(
      'SÉCURITÉ : Ne donnez le rôle ADMIN qu\'aux personnes de confiance. Changez régulièrement les mots de passe. ' +
      'Désactivez immédiatement les comptes des employés qui quittent la boutique.',
      [255, 240, 240]
    );

    this.addPageNumber();

    // 5.8 Analytics
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addSubtitle('5.8 Analyses et rapports');
    this.addText(
      'Les pages Analytics et Dashboard Admin fournissent des analyses détaillées et des visualisations pour piloter votre boutique.'
    );
    this.addSpace(5);

    this.addText('Dashboard Administrateur :', 10, 'bold');
    this.addText('Accessible via le menu Admin > Dashboard, cette page affiche :');
    this.addBulletPoint('Graphique des ventes par jour avec objectifs');
    this.addBulletPoint('Distribution des ventes par catégorie (camembert)');
    this.addBulletPoint('Évolution mensuelle du chiffre d\'affaires et du bénéfice');
    this.addBulletPoint('Indicateurs de performance clés');
    this.addBulletPoint('Comparaisons avec les périodes précédentes');
    this.addSpace(8);

    this.addText('Page Analytics :', 10, 'bold');
    this.addText('Cette page offre une vue complète avec :');
    this.addBulletPoint('Valeur totale du stock');
    this.addBulletPoint('Nombre d\'articles : OK, en alerte, en rupture, critiques');
    this.addBulletPoint('Total des dettes fournisseurs');
    this.addBulletPoint('Nombre de fournisseurs actifs');
    this.addBulletPoint('Montant total acheté aux fournisseurs');
    this.addBulletPoint('Tendances et évolution des ventes');
    this.addBulletPoint('Graphiques de croissance');
    this.addSpace(8);

    this.addText('Retours clients et fournisseurs :', 10, 'bold');
    this.addText(
      'Les pages Retours Clients et Retours Fournisseurs permettent de gérer les retours d\'articles. ' +
      'Pour chaque retour, indiquez la raison (défaut, taille incorrecte, changement d\'avis, etc.). ' +
      'Le stock est automatiquement réajusté et un remboursement ou crédit est généré.'
    );

    this.addPageNumber();
  }

  generateFAQ() {
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addTitle('6. Questions fréquentes (FAQ)');
    this.addSpace(10);

    const faqs = [
      {
        q: 'Comment puis-je imprimer une facture ?',
        a: 'Dans la page Ventes, cliquez sur le menu actions (trois points) de la vente concernée, puis sélectionnez "Imprimer facture". La facture s\'ouvrira dans une nouvelle fenêtre avec le logo de votre boutique et toutes les informations légales. Vous pourrez alors l\'imprimer ou l\'enregistrer en PDF.'
      },
      {
        q: 'Que faire si un client a un crédit en cours ?',
        a: 'Allez dans la page "Versements clients", cliquez sur "Nouveau versement", sélectionnez le client et enregistrez le montant payé avec le mode de paiement. Le crédit du client sera automatiquement mis à jour. Vous pouvez voir le nouveau solde dans la fiche du client.'
      },
      {
        q: 'Comment gérer un retour d\'article ?',
        a: 'Allez dans la page "Retours clients", créez un nouveau retour en sélectionnant la vente concernée et les articles retournés. Indiquez la raison du retour (défaut, taille incorrecte, etc.). Le stock sera automatiquement réajusté et un remboursement ou crédit sera créé pour le client selon votre choix.'
      },
      {
        q: 'Comment savoir quels articles sont en rupture de stock ?',
        a: 'Le tableau de bord principal affiche les alertes stock les plus urgentes. Dans la page Stock, les articles en rouge sont ceux dont la quantité est inférieure au seuil d\'alerte. Vous pouvez également aller dans la page Analytics qui affiche le nombre d\'articles en rupture et en alerte.'
      },
      {
        q: 'Comment modifier mon mot de passe ?',
        a: 'Cliquez sur votre nom d\'utilisateur en haut à droite de l\'écran, puis sélectionnez "Changer le mot de passe". Entrez votre ancien mot de passe, puis votre nouveau mot de passe deux fois pour confirmation. Le nouveau mot de passe doit contenir au moins 8 caractères.'
      },
      {
        q: 'Puis-je annuler une vente ?',
        a: 'Oui, si vous avez les permissions nécessaires. Dans la page Ventes, cliquez sur le menu actions de la vente et sélectionnez "Supprimer". Vous devrez confirmer l\'action. Attention : le stock sera réajusté automatiquement (les articles retournent en stock) et l\'opération ne peut pas être annulée une fois confirmée.'
      },
      {
        q: 'Comment voir l\'historique des achats d\'un client ?',
        a: 'Dans la page Clients, cliquez sur le bouton "Voir détails" du client concerné. Une fenêtre s\'ouvrira avec toutes les informations du client, l\'historique complet de ses achats (avec dates, montants et articles), et l\'historique de ses paiements si applicable.'
      },
      {
        q: 'Que faire en cas d\'erreur de quantité dans le stock ?',
        a: 'Utilisez la fonction Inventaire pour corriger les quantités. Créez un nouvel inventaire, comptez les articles physiques réels et entrez les quantités comptées dans le système. Une fois validé, le système ajustera automatiquement le stock pour qu\'il corresponde à la réalité.'
      },
      {
        q: 'Comment partager une facture par WhatsApp ?',
        a: 'Dans la page Ventes, cliquez sur le menu actions de la vente et sélectionnez "Partager WhatsApp". Cela ouvrira automatiquement WhatsApp avec un message pré-rempli contenant tous les détails de la facture. Vous pourrez alors sélectionner le contact et envoyer le message.'
      },
      {
        q: 'Où puis-je voir les statistiques de vente du mois ?',
        a: 'Les statistiques du mois sont affichées en haut de la page Ventes (total CA, bénéfice, dettes). Pour des statistiques plus détaillées avec graphiques, consultez le tableau de bord principal ou la page Analytics qui offre des analyses complètes avec évolution dans le temps.'
      }
    ];

    faqs.forEach((faq, index) => {
      this.addSubtitle(`${index + 1}. ${faq.q}`, 11);
      this.addText(faq.a);
      this.addSpace(8);
    });

    this.addPageNumber();
  }

  generateSupport() {
    this.doc.addPage();
    this.pageNumber++;
    this.currentY = this.margin;

    this.addTitle('7. Support et assistance');
    this.addSpace(10);

    this.addSubtitle('Besoin d\'aide ?');
    this.addText(
      'Si vous rencontrez un problème non résolu dans ce manuel, plusieurs options s\'offrent à vous :'
    );
    this.addSpace(5);

    this.addBulletPoint('Contactez votre administrateur système qui pourra vous aider avec les problèmes techniques');
    this.addBulletPoint('Consultez votre responsable pour les questions relatives aux procédures de la boutique');
    this.addBulletPoint('Vérifiez que vous utilisez la dernière version de l\'application');
    this.addBulletPoint('Assurez-vous d\'avoir les permissions nécessaires pour accéder à la fonctionnalité souhaitée');
    this.addSpace(10);

    this.addSubtitle('Conseils d\'utilisation');
    this.addText('Pour une utilisation optimale de l\'application :');
    this.addSpace(3);

    this.addBulletPoint('Utilisez toujours un navigateur web à jour (Chrome, Firefox, Edge ou Safari)');
    this.addBulletPoint('Assurez-vous d\'avoir une connexion internet stable');
    this.addBulletPoint('Déconnectez-vous toujours après utilisation pour des raisons de sécurité');
    this.addBulletPoint('Vérifiez régulièrement les alertes stock affichées sur le tableau de bord');
    this.addBulletPoint('Effectuez des sauvegardes régulières de vos données importantes');
    this.addBulletPoint('Changez votre mot de passe régulièrement');
    this.addSpace(10);

    this.addSubtitle('Mises à jour');
    this.addText(
      'L\'application est régulièrement mise à jour pour ajouter de nouvelles fonctionnalités et améliorer les performances. ' +
      'Votre administrateur vous informera des nouvelles versions et des changements importants. ' +
      'N\'hésitez pas à faire part de vos suggestions d\'amélioration.'
    );
    this.addSpace(15);

    this.addBox(
      'Ce manuel est un document évolutif qui sera mis à jour en fonction des nouvelles fonctionnalités et des retours d\'expérience des utilisateurs.',
      [240, 248, 255]
    );
    this.addSpace(15);

    // Footer
    this.currentY = this.pageHeight - 40;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(51, 102, 153);
    const thanks = 'Merci d\'utiliser notre application !';
    const thanksWidth = this.doc.getTextWidth(thanks);
    this.doc.text(thanks, (this.pageWidth - thanksWidth) / 2, this.currentY);

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'italic');
    this.doc.setTextColor(100, 100, 100);
    this.currentY += 8;
    const footer = 'WALLI INDUSTRIE - Application de Gestion de Boutique';
    const footerWidth = this.doc.getTextWidth(footer);
    this.doc.text(footer, (this.pageWidth - footerWidth) / 2, this.currentY);

    this.addPageNumber();
  }

  save() {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    this.doc.save(OUTPUT_PDF);
    console.log(`\n✅ Manuel utilisateur généré avec succès !`);
    console.log(`📄 Fichier: ${OUTPUT_PDF}`);
    console.log(`📊 Pages: ${this.pageNumber}`);
  }
}

async function main() {
  console.log('🚀 Génération du manuel utilisateur...\n');

  const generator = new ManualGenerator();

  console.log('Génération de la page de couverture...');
  generator.generateCoverPage();

  console.log('Génération de la table des matières...');
  generator.generateTableOfContents();

  console.log('Génération de l\'introduction...');
  generator.generateIntroduction();

  console.log('Génération de la section connexion...');
  generator.generateLoginSection();

  console.log('Génération de la section interface...');
  generator.generateInterfaceSection();

  console.log('Génération du guide vendeurs...');
  generator.generateVendeurGuide();

  console.log('Génération du guide administrateurs...');
  generator.generateAdminGuide();

  console.log('Génération de la FAQ...');
  generator.generateFAQ();

  console.log('Génération de la section support...');
  generator.generateSupport();

  console.log('Sauvegarde du fichier...');
  generator.save();

  console.log('\n✅ Génération terminée !');
}

main().catch(console.error);
