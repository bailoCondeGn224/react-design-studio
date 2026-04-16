// Générateur de facture pour impression/PDF
export interface InvoiceData {
  numero: string;
  date: string;
  heure?: string;
  clientNom: string;
  clientTelephone?: string;
  lignes: Array<{
    nom: string;
    quantite: number;
    prixUnitaire: number;
    sousTotal: number;
  }>;
  total: number;
  typePaiement: string;
  montantPaye?: number;
  montantRestant?: number;
  note?: string;
}

export interface CompanyInfo {
  nomComplet?: string;
  nomCourt?: string;
  slogan?: string;
  logo?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  siteWeb?: string;
  rccm?: string;
  nif?: string;
  registreCommerce?: string;
  devise?: string;
  mentionsLegales?: string;
}

const paymentLabels: Record<string, string> = {
  "especes": "Espèces",
  "mobile_money": "Mobile Money",
  "carte": "Carte Bancaire",
  "virement": "Virement",
  "cheque": "Chèque",
  "credit": "À Crédit",
  "acompte_50": "Acompte 50%",
};

export const generateInvoiceHTML = (data: InvoiceData, companyInfo?: CompanyInfo) => {
  const formatPrix = (prix: number, devise?: string) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'decimal',
      minimumFractionDigits: 0
    }).format(prix) + ' ' + (devise || 'GNF');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const company: CompanyInfo = companyInfo || {
    nomComplet: "Walli Industrie",
    adresse: "Conakry, Guinée",
    telephone: "+224 XXX XX XX XX",
    email: "contact@walli-industrie.com",
    devise: "GNF"
  };

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${data.numero}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      background: white;
      color: #1a1a1a;
      line-height: 1.6;
    }

    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2d7a3e;
    }

    .company-info {
      flex: 1;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .company-logo {
      width: 60px;
      height: 60px;
      object-fit: contain;
      border-radius: 8px;
    }

    .company-text {
      flex: 1;
    }

    .company-name {
      font-size: 28px;
      font-weight: bold;
      color: #2d7a3e;
      margin-bottom: 4px;
    }

    .company-slogan {
      font-size: 12px;
      color: #2d7a3e;
      font-style: italic;
      margin-bottom: 8px;
    }

    .company-details {
      font-size: 13px;
      color: #666;
      line-height: 1.8;
    }

    .invoice-info {
      text-align: right;
    }

    .invoice-title {
      font-size: 32px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 10px;
    }

    .invoice-number {
      font-size: 16px;
      color: #2d7a3e;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .invoice-date {
      font-size: 13px;
      color: #666;
    }

    .client-section {
      background: #f8faf9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid #2d7a3e;
    }

    .client-label {
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .client-name {
      font-size: 18px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 4px;
    }

    .client-phone {
      font-size: 14px;
      color: #666;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    thead {
      background: #2d7a3e;
      color: white;
    }

    th {
      padding: 12px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    th:last-child, td:last-child {
      text-align: right;
    }

    tbody tr {
      border-bottom: 1px solid #e5e5e5;
    }

    tbody tr:last-child {
      border-bottom: 2px solid #2d7a3e;
    }

    td {
      padding: 14px 12px;
      font-size: 14px;
    }

    .item-name {
      font-weight: 600;
      color: #1a1a1a;
    }

    .item-qty {
      color: #666;
      text-align: center;
    }

    .item-price {
      color: #666;
    }

    .item-total {
      font-weight: 600;
      color: #1a1a1a;
    }

    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }

    .totals-box {
      width: 350px;
      background: #f8faf9;
      border-radius: 8px;
      overflow: hidden;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 20px;
      border-bottom: 1px solid #e5e5e5;
    }

    .total-row:last-child {
      border-bottom: none;
      background: #2d7a3e;
      color: white;
      font-size: 18px;
      font-weight: bold;
      padding: 16px 20px;
    }

    .total-label {
      font-size: 14px;
      color: #666;
    }

    .total-row:last-child .total-label {
      color: white;
    }

    .total-value {
      font-weight: 600;
      color: #1a1a1a;
    }

    .payment-info {
      background: #fff9e6;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 30px;
    }

    .payment-method {
      display: inline-block;
      background: #2d7a3e;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .note-section {
      background: #f8faf9;
      padding: 16px 20px;
      border-radius: 8px;
      border-left: 4px solid #2d7a3e;
      margin-bottom: 30px;
    }

    .note-label {
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .note-text {
      font-size: 14px;
      color: #333;
      line-height: 1.6;
    }

    .footer {
      text-align: center;
      padding-top: 30px;
      border-top: 2px solid #e5e5e5;
      color: #999;
      font-size: 12px;
    }

    .footer-thanks {
      font-size: 16px;
      color: #2d7a3e;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .legal-info {
      margin-top: 12px;
      font-size: 11px;
      color: #666;
      line-height: 1.6;
    }

    .mentions-legales {
      margin-top: 16px;
      padding: 12px;
      background: #f8faf9;
      border-radius: 6px;
      font-size: 11px;
      color: #666;
      text-align: left;
      line-height: 1.5;
    }

    @media print {
      body {
        padding: 20px;
      }

      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        ${company.logo ? `<img src="${company.logo}" alt="Logo" class="company-logo" />` : ''}
        <div class="company-text">
          <div class="company-name">${company.nomComplet || company.nomCourt || 'Entreprise'}</div>
          ${company.slogan ? `<div class="company-slogan">${company.slogan}</div>` : ''}
          <div class="company-details">
            ${company.adresse || ''}<br>
            ${company.telephone ? `Tél: ${company.telephone}<br>` : ''}
            ${company.email ? `Email: ${company.email}` : ''}
          </div>
        </div>
      </div>
      <div class="invoice-info">
        <div class="invoice-title">FACTURE</div>
        <div class="invoice-number">${data.numero}</div>
        <div class="invoice-date">
          ${formatDate(data.date)}${data.heure ? ` à ${data.heure}` : ''}
        </div>
      </div>
    </div>

    <!-- Client Info -->
    <div class="client-section">
      <div class="client-label">Facturé à</div>
      <div class="client-name">${data.clientNom}</div>
      ${data.clientTelephone ? `<div class="client-phone">Tél: ${data.clientTelephone}</div>` : ''}
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th style="width: 50%">Article</th>
          <th style="width: 15%; text-align: center;">Quantité</th>
          <th style="width: 17%">Prix Unit.</th>
          <th style="width: 18%">Total</th>
        </tr>
      </thead>
      <tbody>
        ${data.lignes.map(ligne => `
          <tr>
            <td class="item-name">${ligne.nom}</td>
            <td class="item-qty" style="text-align: center;">${ligne.quantite}</td>
            <td class="item-price">${formatPrix(ligne.prixUnitaire, company.devise)}</td>
            <td class="item-total">${formatPrix(ligne.sousTotal, company.devise)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="totals-box">
        ${data.montantPaye !== undefined ? `
          <div class="total-row">
            <span class="total-label">Montant Payé</span>
            <span class="total-value">${formatPrix(data.montantPaye, company.devise)}</span>
          </div>
        ` : ''}
        ${data.montantRestant !== undefined && data.montantRestant > 0 ? `
          <div class="total-row">
            <span class="total-label">Montant Restant</span>
            <span class="total-value" style="color: #dc2626;">${formatPrix(data.montantRestant, company.devise)}</span>
          </div>
        ` : ''}
        <div class="total-row">
          <span class="total-label">TOTAL</span>
          <span>${formatPrix(data.total, company.devise)}</span>
        </div>
      </div>
    </div>

    <!-- Payment Info -->
    <div class="payment-info">
      <span class="payment-method">${paymentLabels[data.typePaiement] || data.typePaiement}</span>
      ${data.montantRestant && data.montantRestant > 0 ?
        '<div style="margin-top: 8px; font-size: 13px; color: #d97706;">⚠️ Paiement partiel - Solde à régler</div>' :
        ''}
    </div>

    <!-- Note -->
    ${data.note ? `
      <div class="note-section">
        <div class="note-label">Note</div>
        <div class="note-text">${data.note}</div>
      </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <div class="footer-thanks">Merci pour votre confiance !</div>
      Cette facture a été générée automatiquement par ${company.nomComplet || company.nomCourt || 'Entreprise'}

      ${company.rccm || company.nif || company.registreCommerce ? `
        <div class="legal-info">
          ${company.rccm ? `RCCM: ${company.rccm}` : ''}
          ${company.rccm && company.nif ? ' | ' : ''}
          ${company.nif ? `NIF: ${company.nif}` : ''}
          ${(company.rccm || company.nif) && company.registreCommerce ? ' | ' : ''}
          ${company.registreCommerce ? `RC: ${company.registreCommerce}` : ''}
        </div>
      ` : ''}

      ${company.mentionsLegales ? `
        <div class="mentions-legales">
          ${company.mentionsLegales}
        </div>
      ` : ''}
    </div>
  </div>

  <script>
    // Auto-print on load
    window.onload = function() {
      setTimeout(() => window.print(), 500);
    };
  </script>
</body>
</html>
  `;
};

export const printInvoice = (data: InvoiceData, companyInfo?: any) => {
  const html = generateInvoiceHTML(data, companyInfo);
  const printWindow = window.open('', '_blank', 'width=800,height=600');

  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    alert('Veuillez autoriser les pop-ups pour imprimer la facture');
  }
};
