/**
 * Formate un nombre avec des espaces pour faciliter la lecture
 * Exemple: 1000000 -> "1 000 000"
 */
export const formatPrixInput = (value: string | number): string => {
  if (!value && value !== 0) return '';

  // Convertir en string et enlever les espaces existants
  const cleaned = String(value).replace(/\s/g, '');

  // Si vide ou 0, retourner vide
  if (!cleaned || cleaned === '0') return '';

  // Ajouter des espaces tous les 3 chiffres
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

/**
 * Nettoie un prix formaté pour obtenir le nombre brut
 * Exemple: "1 000 000" -> "1000000"
 */
export const cleanPrixInput = (value: string): string => {
  return value.replace(/\s/g, '');
};

/**
 * Gère le changement de valeur d'un input de prix
 * Retourne la valeur nettoyée (sans espaces)
 */
export const handlePrixChange = (input: string): string => {
  // Enlever tout sauf les chiffres
  return input.replace(/[^\d]/g, '');
};

/**
 * Formate un nombre en prix avec séparateur de milliers et devise GNF
 * Exemple: 1000000 -> "1 000 000 GNF"
 */
export const formatPrix = (prix: number): string => {
  if (!prix && prix !== 0) return '0 GNF';
  return new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(prix);
};
