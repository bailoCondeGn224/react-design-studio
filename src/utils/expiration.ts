/**
 * Utilitaires pour la gestion des dates d'expiration des produits
 */

export type StatutExpiration = 'expire' | 'bientot' | 'ok' | 'aucune';

export interface ExpirationInfo {
  statut: StatutExpiration;
  joursRestants?: number;
  couleur: string;
  label: string;
  urgent: boolean;
}

/**
 * Détermine le statut d'expiration d'un article
 */
export function getExpirationInfo(
  dateExpiration?: string,
  delaiAlerte: number = 30
): ExpirationInfo {
  // Pas de date d'expiration
  if (!dateExpiration) {
    return {
      statut: 'aucune',
      couleur: 'bg-muted text-muted-foreground',
      label: 'Pas de date',
      urgent: false,
    };
  }

  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);

  const expiration = new Date(dateExpiration);
  expiration.setHours(0, 0, 0, 0);

  const diffTime = expiration.getTime() - aujourdhui.getTime();
  const joursRestants = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Produit expiré
  if (joursRestants < 0) {
    return {
      statut: 'expire',
      joursRestants: Math.abs(joursRestants),
      couleur: 'bg-destructive/10 text-destructive border-destructive/20',
      label: `Expiré depuis ${Math.abs(joursRestants)}j`,
      urgent: true,
    };
  }

  // Expire aujourd'hui
  if (joursRestants === 0) {
    return {
      statut: 'expire',
      joursRestants: 0,
      couleur: 'bg-destructive/10 text-destructive border-destructive/20',
      label: 'Expire aujourd\'hui',
      urgent: true,
    };
  }

  // Expire bientôt (dans le délai d'alerte)
  if (joursRestants <= delaiAlerte) {
    return {
      statut: 'bientot',
      joursRestants,
      couleur: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      label: `Expire dans ${joursRestants}j`,
      urgent: joursRestants <= 7, // Urgent si moins d'une semaine
    };
  }

  // OK - encore loin de l'expiration
  return {
    statut: 'ok',
    joursRestants,
    couleur: 'bg-success/10 text-success border-success/20',
    label: `Expire dans ${joursRestants}j`,
    urgent: false,
  };
}

/**
 * Formate une date d'expiration pour l'affichage
 */
export function formatDateExpiration(dateExpiration?: string): string {
  if (!dateExpiration) return '-';

  const date = new Date(dateExpiration);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
