import { Card, CardContent } from "@/components/ui/card";
import { MapPin, CheckCircle, XCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CanAccess from "./CanAccess";
import { Zone } from "@/api/zones";

interface ZoneMobileCardProps {
  zone: Zone;
  onEdit: (zone: Zone) => void;
  onDelete: (id: string) => void;
}

const ZoneMobileCard = ({ zone, onEdit, onDelete }: ZoneMobileCardProps) => {
  return (
    <Card className={`transition-shadow hover:shadow-lg overflow-hidden ${
      zone.actif ? 'border-success/30 bg-success/5' : 'border-border'
    }`}>
      <CardContent className="p-0">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              zone.actif ? 'bg-success/10' : 'bg-muted'
            }`}>
              <MapPin className={`w-5 h-5 ${zone.actif ? 'text-success' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{zone.nom}</p>
              <p className="text-xs text-muted-foreground font-mono">{zone.code}</p>
            </div>
          </div>
          {zone.actif ? (
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
        {zone.description && (
          <div className="p-4 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-foreground">{zone.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="p-3 border-t border-border bg-card">
          <div className="flex gap-2">
            <CanAccess permissions={['zones.update']}>
              <Button
                variant="outline"
                onClick={() => onEdit(zone)}
                className="flex-1 h-11"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </CanAccess>
            <CanAccess permissions={['zones.delete']}>
              <Button
                variant="destructive"
                onClick={() => onDelete(zone.id)}
                className="flex-1 h-11"
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

export default ZoneMobileCard;
