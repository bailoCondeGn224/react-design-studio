import { Package, Edit, Trash2, History, AlertCircle, Flame, Zap, Clock, Snail } from "lucide-react";
import { getPhotoUrl } from "@/lib/api-client";

interface ArticleCardProps {
  article: any;
  formatPrix: (prix: number) => string;
  getStockStatus: (stock: number, seuil: number) => { label: string; color: string };
  onEdit: (article: any) => void;
  onDelete: (id: string) => void;
  onViewHistory: (id: string) => void;
  onViewPhoto?: (photo: string, nom: string) => void;
}

const ArticleCard = ({
  article,
  formatPrix,
  getStockStatus,
  onEdit,
  onDelete,
  onViewHistory,
  onViewPhoto
}: ArticleCardProps) => {
  const status = getStockStatus(article.stock, article.seuilAlerte);
  const photoUrl = article.photo ? getPhotoUrl(article.photo) : null;

  // Badge de rotation
  const getRotationIcon = () => {
    const vitesse = article.vitesseRotation;
    if (vitesse === 'RAPIDE') return <Flame className="w-3.5 h-3.5 text-destructive" />;
    if (vitesse === 'MOYENNE') return <Zap className="w-3.5 h-3.5 text-warning" />;
    if (vitesse === 'LENTE') return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
    if (vitesse === 'STAGNANT') return <Snail className="w-3.5 h-3.5 text-muted-foreground" />;
    return null;
  };

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-border">
      {/* IMAGE - Style Post Facebook (pleine largeur, edge-to-edge) */}
      <div
        className="relative w-full aspect-square bg-gradient-to-br from-muted/50 to-secondary/30 cursor-pointer overflow-hidden"
        onClick={() => photoUrl && onViewPhoto && onViewPhoto(article.photo, article.nom)}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={article.nom}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground/20" />
          </div>
        )}

        {/* Badge Stock - Overlay en haut à droite */}
        {article.stock === 0 && (
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-bold shadow-lg flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            RUPTURE
          </div>
        )}
        {article.stock > 0 && article.stock <= article.seuilAlerte && (
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-warning text-white text-xs font-bold shadow-lg">
            FAIBLE
          </div>
        )}

        {/* Badge Rotation - Overlay en haut à gauche */}
        {article.vitesseRotation && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-background/90 backdrop-blur-sm flex items-center gap-1 shadow-md">
            {getRotationIcon()}
          </div>
        )}
      </div>

      {/* INFORMATIONS - Style Post Facebook */}
      <div className="p-3 space-y-2.5">
        {/* Titre */}
        <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-tight">
          {article.nom}
        </h3>

        {/* Prix - Grand et visible comme un "like count" */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-black text-primary">
              {formatPrix(article.prixVente)}
            </span>
            {article.prixAchat && (
              <p className="text-xs text-muted-foreground">
                Achat: {formatPrix(article.prixAchat)}
              </p>
            )}
          </div>

          {/* Badge Stock - Moderne et visible */}
          <div className="flex flex-col items-end gap-1">
            <div className={`px-3 py-2 rounded-lg ${
              article.stock === 0
                ? 'bg-destructive/20 border-2 border-destructive/50'
                : article.stock <= article.seuilAlerte
                ? 'bg-warning/20 border-2 border-warning/50'
                : 'bg-success/20 border-2 border-success/50'
            }`}>
              <div className="flex items-center gap-1.5">
                <Package className={`w-4 h-4 ${
                  article.stock === 0
                    ? 'text-destructive'
                    : article.stock <= article.seuilAlerte
                    ? 'text-warning'
                    : 'text-success'
                }`} />
                <span className={`text-xl font-black ${
                  article.stock === 0
                    ? 'text-destructive'
                    : article.stock <= article.seuilAlerte
                    ? 'text-warning'
                    : 'text-success'
                }`}>
                  {article.stock}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">en stock</p>
          </div>
        </div>

        {/* Catégorie et Zone - Style "localisation" Facebook */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border">
          <span>📍 {article.zone || '-'}</span>
          <span>•</span>
          <span className="truncate">{article.categorieNom || '-'}</span>
        </div>

        {/* Code article */}
        {article.code && (
          <p className="text-xs text-muted-foreground font-mono">
            {article.code}
          </p>
        )}

        {/* Actions - Style boutons Facebook */}
        <div className="flex gap-1.5 pt-2 border-t border-border">
          <button
            onClick={() => onEdit(article)}
            className="flex-1 h-9 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5" />
            Modifier
          </button>
          <button
            onClick={() => onViewHistory(article.id)}
            className="flex-1 h-9 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            Historique
          </button>
          <button
            onClick={() => onDelete(article.id)}
            className="h-9 px-3 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-medium transition-colors flex items-center justify-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
