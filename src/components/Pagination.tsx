import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PaginationMeta } from "@/types";
import { useState, useEffect } from "react";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
}

const Pagination = ({
  meta,
  onPageChange,
  onLimitChange,
  showPageSizeSelector = false,
  pageSizeOptions = [10, 20, 50, 100]
}: PaginationProps) => {
  const [jumpToPage, setJumpToPage] = useState<string>("");
  const [showJumpInput, setShowJumpInput] = useState(false);

  // Sécurité: retourner null si meta n'est pas défini
  if (!meta) {
    return null;
  }

  const { page, totalPages, hasNextPage, hasPreviousPage, total, limit } = meta;

  // Réinitialiser l'input de saut quand la page change
  useEffect(() => {
    setJumpToPage("");
    setShowJumpInput(false);
  }, [page]);

  // Générer les numéros de page à afficher (optimisé pour grands datasets)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    // Pour moins de 7 pages, tout afficher
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Toujours afficher la première page
    pages.push(1);

    // Calculer la fenêtre autour de la page courante
    const windowSize = 2; // pages de chaque côté
    const windowStart = Math.max(2, page - windowSize);
    const windowEnd = Math.min(totalPages - 1, page + windowSize);

    // Ellipsis avant la fenêtre
    if (windowStart > 2) {
      pages.push('...');
    }

    // Pages dans la fenêtre
    for (let i = windowStart; i <= windowEnd; i++) {
      pages.push(i);
    }

    // Ellipsis après la fenêtre
    if (windowEnd < totalPages - 1) {
      pages.push('...');
    }

    // Toujours afficher la dernière page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setShowJumpInput(false);
      setJumpToPage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleJumpToPage();
    } else if (e.key === 'Escape') {
      setShowJumpInput(false);
      setJumpToPage("");
    }
  };

  const pageNumbers = getPageNumbers();

  // Calculer les statistiques d'affichage
  const startItem = ((page - 1) * limit) + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 px-3 sm:px-4 py-3 border-t border-border bg-card/50">
      {/* Ligne principale */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Info texte - Version desktop */}
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{startItem}</span>
            {' - '}
            <span className="font-medium text-foreground">{endItem}</span>
            {' sur '}
            <span className="font-medium text-foreground">{total.toLocaleString('fr-FR')}</span>
          </span>

          {/* Sélecteur de taille de page */}
          {showPageSizeSelector && onLimitChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Afficher</span>
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="px-2 py-1 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Info texte - Version mobile (compacte) */}
        <div className="sm:hidden text-xs text-muted-foreground">
          {startItem}-{endItem} sur {total.toLocaleString('fr-FR')}
          {totalPages > 1 && (
            <span className="ml-2 text-primary font-medium">
              (Page {page}/{totalPages})
            </span>
          )}
        </div>

        {/* Boutons de navigation */}
        <div className="flex items-center gap-1">
          {/* Première page (desktop) */}
          <button
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            className="hidden sm:flex px-2 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent items-center"
            title="Première page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Bouton Précédent */}
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPreviousPage}
            className="px-2 sm:px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden lg:inline">Précédent</span>
          </button>

          {/* Numéros de page - Desktop */}
          <div className="hidden md:flex items-center gap-0.5">
            {pageNumbers.map((pageNum, index) => {
              if (pageNum === '...') {
                return (
                  <button
                    key={`ellipsis-${index}`}
                    onClick={() => setShowJumpInput(true)}
                    className="px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    title="Aller à une page"
                  >
                    •••
                  </button>
                );
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum as number)}
                  className={`min-w-[36px] px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Page courante (mobile/tablette) - Cliquable pour jump */}
          <button
            onClick={() => setShowJumpInput(true)}
            className="md:hidden px-3 py-1.5 text-sm font-medium rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            title="Aller à une page"
          >
            <span className="text-primary font-bold">{page}</span>
            <span className="text-muted-foreground"> / {totalPages}</span>
          </button>

          {/* Bouton Suivant */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNextPage}
            className="px-2 sm:px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent flex items-center gap-1"
          >
            <span className="hidden lg:inline">Suivant</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dernière page (desktop) */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
            className="hidden sm:flex px-2 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent items-center"
            title="Dernière page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Input de saut vers page - Affiché quand activé */}
      {showJumpInput && totalPages > 7 && (
        <div className="flex items-center justify-center gap-2 py-2 px-3 bg-secondary/50 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="text-sm text-muted-foreground">Aller à la page</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpToPage}
            onChange={(e) => setJumpToPage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`1-${totalPages}`}
            className="w-20 px-2 py-1.5 rounded-md border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            autoFocus
          />
          <button
            onClick={handleJumpToPage}
            disabled={!jumpToPage || parseInt(jumpToPage) < 1 || parseInt(jumpToPage) > totalPages}
            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Aller
          </button>
          <button
            onClick={() => {
              setShowJumpInput(false);
              setJumpToPage("");
            }}
            className="px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Raccourcis rapides pour grands datasets (mobile) */}
      {totalPages > 10 && (
        <div className="sm:hidden flex items-center justify-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Aller à:</span>
          {[1, Math.floor(totalPages / 4), Math.floor(totalPages / 2), Math.floor(3 * totalPages / 4), totalPages]
            .filter((p, i, arr) => arr.indexOf(p) === i) // Unique values
            .map(p => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                disabled={page === p}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  page === p
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {p}
              </button>
            ))
          }
        </div>
      )}
    </div>
  );
};

export default Pagination;
