import { Card, CardContent } from "@/components/ui/card";
import { FolderTree, CheckCircle, XCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CanAccess from "./CanAccess";
import { Categorie } from "@/types";

interface CategoryMobileCardProps {
  categorie: Categorie;
  onEdit: (categorie: Categorie) => void;
  onDelete: (id: string) => void;
}

const CategoryMobileCard = ({
  categorie,
  onEdit,
  onDelete,
}: CategoryMobileCardProps) => {
  return (
    <Card className={`transition-shadow hover:shadow-lg ${
      categorie.actif ? 'border-success/30 bg-success/5' : 'border-border'
    }`}>
      <CardContent className="p-0">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              categorie.actif ? 'bg-success/10' : 'bg-muted'
            }`}>
              <FolderTree className={`w-5 h-5 ${categorie.actif ? 'text-success' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{categorie.nom}</p>
              <p className="text-xs text-muted-foreground font-mono">{categorie.code}</p>
            </div>
          </div>
          {categorie.actif ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 flex-shrink-0">
              <CheckCircle className="w-3 h-3" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border flex-shrink-0">
              <XCircle className="w-3 h-3" />
              Inactive
            </span>
          )}
        </div>

        {/* Description */}
        {categorie.description && (
          <div className="p-4 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-foreground">{categorie.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="p-3 border-t border-border bg-card">
          <div className="space-y-2">
            <CanAccess permissions={['categories.update']}>
              <Button
                variant="outline"
                onClick={() => onEdit(categorie)}
                className="w-full h-11"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </CanAccess>
            <CanAccess permissions={['categories.delete']}>
              <Button
                variant="destructive"
                onClick={() => onDelete(categorie.id)}
                className="w-full h-11"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </CanAccess>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryMobileCard;
