import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationMeta } from "@/types";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

const Pagination = ({ meta, onPageChange }: PaginationProps) => {
  const { page, totalPages, hasNextPage, hasPreviousPage } = meta;

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Nombre maximum de pages visibles

    if (totalPages <= maxVisible) {
      // Afficher toutes les pages si moins de maxVisible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Toujours afficher la première page
      pages.push(1);

      if (page > 3) {
        pages.push('...');
      }

      // Pages autour de la page courante
      for (let i = Math.max(2, page - 1); i <= Math.min(page + 1, totalPages - 1); i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push('...');
      }

      // Toujours afficher la dernière page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 border-t border-border">
      {/* Info texte - Version desktop */}
      <div className="hidden sm:block text-sm text-muted-foreground">
        Affichage de <span className="font-medium">{((page - 1) * meta.limit) + 1}</span> à{' '}
        <span className="font-medium">{Math.min(page * meta.limit, meta.total)}</span> sur{' '}
        <span className="font-medium">{meta.total}</span> résultats
      </div>

      {/* Info texte - Version mobile (compacte) */}
      <div className="sm:hidden text-xs text-muted-foreground">
        {((page - 1) * meta.limit) + 1}-{Math.min(page * meta.limit, meta.total)} sur {meta.total}
      </div>

      {/* Boutons de navigation */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Bouton Précédent */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
          className="px-2 sm:px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden md:inline">Précédent</span>
        </button>

        {/* Numéros de page - Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-muted-foreground">
                  ...
                </span>
              );
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum as number)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  page === pageNum
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Page courante (mobile/tablette) */}
        <div className="md:hidden px-2 sm:px-3 py-1.5 text-sm font-medium text-muted-foreground">
          <span className="text-primary">{page}</span> / {totalPages}
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="px-2 sm:px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent flex items-center gap-1"
        >
          <span className="hidden md:inline">Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
