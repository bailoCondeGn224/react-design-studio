import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import CanAccess from "@/components/CanAccess";
import { Package, History, Edit, Trash, AlertCircle, AlertTriangle } from "lucide-react";
import { getPhotoUrl } from "@/lib/api-client";

interface StockMobileCardProps {
  article: any;
  onEdit: (article: any) => void;
  onDelete: (id: string) => void;
  onViewHistory: (id: string) => void;
  onViewPhoto: (photo: string, nom: string) => void;
  formatPrix: (prix: number) => string;
  getStockStatus: (stock: number, seuilAlerte: number) => any;
  categorieName: string;
}

const StockMobileCard = ({
  article,
  onEdit,
  onDelete,
  onViewHistory,
  onViewPhoto,
  formatPrix,
  getStockStatus,
  categorieName
}: StockMobileCardProps) => {
  const status = getStockStatus(article.stock, article.seuilAlerte);
  const StatusIcon = status.icon;
  const isLowStock = article.stock <= article.seuilAlerte;
  const isOutOfStock = article.stock === 0;

  return (
    <Card className={`transition-shadow hover:shadow-lg ${
      isOutOfStock ? 'border-destructive/50 bg-destructive/5' :
      isLowStock ? 'border-warning/30 bg-warning/5' : 'hover:border-primary/30'
    }`}>
      <CardContent className="p-0">
        {/* Photo et info principale */}
        <div className="flex items-center gap-3 p-4">
          {/* Photo grande et cliquable */}
          <div
            className={`w-20 h-20 rounded-xl border-2 border-border overflow-hidden bg-muted/50 flex-shrink-0 ${
              article.photo ? 'cursor-pointer active:scale-95 transition-transform' : ''
            }`}
            onClick={() => article.photo && onViewPhoto(article.photo, article.nom)}
          >
            {article.photo ? (
              <img
                src={getPhotoUrl(article.photo) || ''}
                alt={article.nom}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Nom, catégorie et prix */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground mb-1 line-clamp-2 leading-tight">
              {article.nom}
            </h3>
            <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide">{categorieName}</p>
            <p className="text-xl font-bold text-primary">
              {formatPrix(article.prixVente)}
            </p>
          </div>
        </div>

        {/* Stock et statut - Section importante */}
        <div className={`px-4 py-3 border-t ${
          isOutOfStock ? 'bg-destructive/10 border-destructive/20' :
          isLowStock ? 'bg-warning/10 border-warning/20' : 'bg-secondary/30 border-border'
        }`}>
          <div className="flex items-center justify-between">
            {/* Stock avec indicateur visuel */}
            <div className="flex items-center gap-2">
              {(isOutOfStock || isLowStock) && (
                <div className={`w-2.5 h-2.5 rounded-full ${
                  isOutOfStock ? 'bg-destructive animate-pulse' : 'bg-warning'
                }`} />
              )}
              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Disponible</p>
                <div className="flex items-baseline gap-1">
                  <p className={`text-3xl font-black leading-none ${
                    isOutOfStock ? 'text-destructive' :
                    isLowStock ? 'text-warning' : 'text-foreground'
                  }`}>
                    {article.stock}
                  </p>
                  <span className="text-sm font-medium text-muted-foreground">unités</span>
                </div>
              </div>
            </div>

            {/* Badge statut */}
            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-3">
            <div className="w-full h-2 rounded-full bg-background overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isOutOfStock ? "bg-destructive" :
                  isLowStock ? "bg-warning" : "bg-success"
                }`}
                style={{ width: `${Math.min((article.stock / Math.max(article.seuilAlerte, article.stock)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-t border-border bg-card">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="lg" className="w-full h-12 text-sm font-semibold">
                Actions
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[85vh]">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-left text-lg">{article.nom}</SheetTitle>
                <p className="text-sm text-muted-foreground text-left">{categorieName}</p>
              </SheetHeader>

              {/* Infos détaillées dans le Sheet */}
              <div className="space-y-4 mb-6">
                {article.reference && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Référence</span>
                    <span className="text-sm font-medium">{article.reference}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Zone</span>
                  <span className="text-sm font-medium">{article.zone}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Seuil d'alerte</span>
                  <span className="text-sm font-medium">{article.seuilAlerte}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">Stock actuel</span>
                  <span className="text-lg font-bold text-primary">{article.stock}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-14 justify-start text-left text-base"
                  onClick={() => onViewHistory(article.id)}
                >
                  <History className="w-5 h-5 mr-3" />
                  Voir l'historique
                </Button>
                <CanAccess permissions={['stock.update']}>
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full h-14 justify-start text-left text-base"
                    onClick={() => onEdit(article)}
                  >
                    <Edit className="w-5 h-5 mr-3" />
                    Modifier l'article
                  </Button>
                </CanAccess>
                <CanAccess permissions={['stock.delete']}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-14 justify-start text-left text-base text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                    onClick={() => onDelete(article.id)}
                  >
                    <Trash className="w-5 h-5 mr-3" />
                    Supprimer l'article
                  </Button>
                </CanAccess>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockMobileCard;
