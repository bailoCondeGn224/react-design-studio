import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Inventaire } from '@/types';

export const generateFinancesPDF = (inventaire: Inventaire) => {
  // Formater les montants pour le PDF (formatage manuel pour éviter les problèmes d'encodage)
  const formatMontant = (montant: number): string => {
    // Convertir en entier et en string
    const montantStr = Math.round(montant).toString();

    // Ajouter des espaces tous les 3 chiffres en partant de la droite
    const parts: string[] = [];
    for (let i = montantStr.length - 1, j = 0; i >= 0; i--, j++) {
      if (j > 0 && j % 3 === 0) {
        parts.unshift(' ');
      }
      parts.unshift(montantStr[i]);
    }

    return parts.join('') + ' GNF';
  };

  const doc = new jsPDF({
    format: 'a4',
    unit: 'mm'
  });

  // Palette cohérente avec votre UI
  const colors = {
    primary: [37, 99, 235],        // Bleu moderne
    dark: [15, 23, 42],             // Slate 900
    success: [16, 185, 129],        // Emerald 500
    danger: [239, 68, 68],          // Red 500
    warning: [251, 146, 60],        // Orange 400
    lightBg: [248, 250, 252],       // Slate 50
    border: [226, 232, 240],        // Slate 200
  };

  const beneficeNet = parseFloat(inventaire.beneficeNet?.toString() || '0');
  const isBeneficiaire = beneficeNet >= 0;

  // ========== EN-TÊTE COMPACT ==========
  doc.setFillColor(...colors.dark);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RAPPORT FINANCIER', 105, 12, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(
    `${format(new Date(inventaire.dateDebut), 'dd/MM/yyyy', { locale: fr })} - ${format(new Date(inventaire.dateFin), 'dd/MM/yyyy', { locale: fr })} (${inventaire.dureeJours}j) • ${inventaire.nombreVentes || 0} ventes`,
    105, 20, { align: 'center' }
  );

  doc.setFontSize(6);
  doc.text(
    `Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`,
    105, 28, { align: 'center' }
  );

  let yPos = 42;

  // ========== CARTES MÉTRIQUES ALIGNÉES ==========
  doc.setTextColor(0, 0, 0);

  const cardWidth = 58;
  const cardHeight = 24;
  const cardSpacing = 5;
  const startX = 15;

  // Carte CA
  doc.setFillColor(...colors.lightBg);
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.5);
  doc.roundedRect(startX, yPos, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('CHIFFRE D\'AFFAIRES', startX + 3, yPos + 6);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text(formatMontant(inventaire.chiffreAffaires || 0), startX + 3, yPos + 16);

  // Carte Bénéfice Net
  const card2X = startX + cardWidth + cardSpacing;
  doc.setFillColor(isBeneficiaire ? 240 : 254, isBeneficiaire ? 253 : 242, isBeneficiaire ? 244 : 242);
  doc.setDrawColor(...(isBeneficiaire ? colors.success : colors.danger));
  doc.roundedRect(card2X, yPos, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('BÉNÉFICE NET', card2X + 3, yPos + 6);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...(isBeneficiaire ? colors.success : colors.danger));
  doc.text(formatMontant(beneficeNet), card2X + 3, yPos + 16);

  // Carte CMV
  const card3X = card2X + cardWidth + cardSpacing;
  doc.setFillColor(...colors.lightBg);
  doc.setDrawColor(...colors.warning);
  doc.roundedRect(card3X, yPos, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('COÛT MARCHANDISES', card3X + 3, yPos + 6);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.warning);
  doc.text(formatMontant(inventaire.coutMarchandises || 0), card3X + 3, yPos + 16);

  yPos += cardHeight + 8;

  // ========== LAYOUT 2 COLONNES ÉQUILIBRÉES ==========
  const col1X = 15;
  const col2X = 110;
  const colWidth = 85;
  const sectionStartY = yPos;

  // Colonne gauche: Résultats
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSULTATS', col1X, sectionStartY);

  doc.setFillColor(...colors.primary);
  doc.rect(col1X, sectionStartY + 1, 12, 0.5, 'F');

  autoTable(doc, {
    startY: sectionStartY + 5,
    head: [['INDICATEUR', 'VALEUR']],
    body: [
      ['Bénéfice brut', formatMontant(inventaire.beneficeBrut || 0)],
      ['Marge brute', `${parseFloat(inventaire.tauxMarge?.toString() || '0').toFixed(1)} %`],
      ['Panier moyen', formatMontant(inventaire.panierMoyen || 0)],
      ['Rentabilité', `${parseFloat(inventaire.tauxRentabilite?.toString() || '0').toFixed(1)} %`],
    ],
    theme: 'plain',
    headStyles: {
      fillColor: colors.lightBg,
      textColor: colors.dark,
      fontSize: 6,
      fontStyle: 'bold',
      cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
    },
    alternateRowStyles: {
      fillColor: [253, 253, 253],
    },
    columnStyles: {
      0: { cellWidth: 48, textColor: [60, 60, 60] },
      1: { cellWidth: 37, halign: 'right', fontStyle: 'bold', textColor: colors.primary },
    },
    margin: { left: col1X },
  });

  const resultatsEndY = (doc as any).lastAutoTable.finalY;

  // Colonne droite: Dépenses
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('DÉPENSES', col2X, sectionStartY);

  doc.setFillColor(...colors.warning);
  doc.rect(col2X, sectionStartY + 1, 12, 0.5, 'F');

  autoTable(doc, {
    startY: sectionStartY + 5,
    head: [['CATÉGORIE', 'MONTANT']],
    body: [
      ['Fixes', formatMontant(inventaire.depensesFixes || 0)],
      ['Variables', formatMontant(inventaire.depensesVariables || 0)],
      ['Exceptionnelles', formatMontant(inventaire.depensesExceptionnelles || 0)],
    ],
    foot: [['TOTAL', formatMontant(inventaire.totalDepenses || 0)]],
    theme: 'plain',
    headStyles: {
      fillColor: colors.lightBg,
      textColor: colors.dark,
      fontSize: 6,
      fontStyle: 'bold',
      cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
    },
    footStyles: {
      fillColor: colors.warning,
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
    },
    alternateRowStyles: {
      fillColor: [253, 253, 253],
    },
    columnStyles: {
      0: { cellWidth: 48, textColor: [60, 60, 60] },
      1: { cellWidth: 37, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: col2X },
  });

  yPos = Math.max(resultatsEndY, (doc as any).lastAutoTable.finalY) + 10;

  // ========== PERTES (pleine largeur) ==========
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('PERTES D\'INVENTAIRE', 15, yPos);

  doc.setFillColor(...colors.danger);
  doc.rect(15, yPos + 1, 12, 0.5, 'F');

  autoTable(doc, {
    startY: yPos + 5,
    head: [['TYPE DE PERTE', 'VALEUR']],
    body: [
      ['Articles manquants', formatMontant(inventaire.valeurArticlesManquants || 0)],
      ['Articles abîmés', formatMontant(inventaire.valeurArticlesAbimes || 0)],
    ],
    foot: [['TOTAL DES PERTES', formatMontant(inventaire.totalPertes || 0)]],
    theme: 'plain',
    headStyles: {
      fillColor: colors.lightBg,
      textColor: colors.dark,
      fontSize: 6,
      fontStyle: 'bold',
      cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
    },
    footStyles: {
      fillColor: colors.danger,
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
    },
    alternateRowStyles: {
      fillColor: [253, 253, 253],
    },
    columnStyles: {
      0: { cellWidth: 145, textColor: [60, 60, 60] },
      1: { cellWidth: 37, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 15, right: 13 },
  });

  // ========== PIED DE PAGE MINIMALISTE ==========
  doc.setFillColor(...colors.dark);
  doc.rect(0, 285, 210, 12, 'F');

  doc.setFontSize(6);
  doc.setTextColor(160, 160, 160);
  doc.setFont('helvetica', 'normal');
  doc.text('Confidentiel', 15, 291);
  doc.text(format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr }), 195, 291, { align: 'right' });

  return doc;
};
