import FournisseurCombobox from '@/components/FournisseurCombobox';

interface Fournisseur {
  id: string;
  nom: string;
  telephone?: string;
  email?: string;
  totalAchats?: number;
  dette?: number;
}

interface FournisseurVersementSelectorProps {
  value: string;
  onChange: (fournisseur: Fournisseur | null) => void;
  selectedFournisseur: Fournisseur | null;
  placeholder?: string;
  disabled?: boolean;
}

const FournisseurVersementSelector = ({
  value,
  onChange,
  selectedFournisseur,
  placeholder = 'Rechercher un fournisseur...',
  disabled = false,
}: FournisseurVersementSelectorProps) => {
  const formatPrix = (montant: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    })
      .format(montant)
      .replace('GNF', 'GNF');
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium">Fournisseur *</label>
        <FournisseurCombobox
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>

      {selectedFournisseur && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="space-y-3">
            {/* Dette actuelle - Mise en évidence */}
            <div>
              <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
                Dette actuelle à régler
              </p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                {formatPrix(selectedFournisseur.dette || 0)}
              </p>
            </div>

            {/* Informations supplémentaires */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-orange-200 dark:border-orange-800">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Fournisseur</p>
                <p className="text-sm font-medium text-foreground">{selectedFournisseur.nom}</p>
              </div>
              {selectedFournisseur.telephone && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Téléphone</p>
                  <p className="text-sm font-medium text-foreground">{selectedFournisseur.telephone}</p>
                </div>
              )}
              {selectedFournisseur.totalAchats !== undefined && selectedFournisseur.totalAchats > 0 && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Total achats</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatPrix(selectedFournisseur.totalAchats)}
                  </p>
                </div>
              )}
            </div>

            {/* Indicateur visuel si dette = 0 */}
            {selectedFournisseur.dette === 0 && (
              <div className="pt-2">
                <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md px-3 py-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Aucune dette - Compte à jour</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FournisseurVersementSelector;
