import { useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  useLivreurs,
  useCreateLivreur,
  useUpdateLivreur,
  useDeleteLivreur,
} from '@/hooks/useLivreurs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Livreur, CreateLivreurDto, UpdateLivreurDto } from '@/types/livreur';
import LivreurMobileCard from '@/components/LivreurMobileCard';
import AppLayout from '@/components/AppLayout';

const Livreurs = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { data: livreurs = [], isLoading } = useLivreurs();
  const createLivreur = useCreateLivreur();
  const updateLivreur = useUpdateLivreur();
  const deleteLivreur = useDeleteLivreur();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLivreur, setEditingLivreur] = useState<Livreur | null>(null);
  const [formData, setFormData] = useState<CreateLivreurDto>({
    nom: '',
    telephone: '',
    password: '',
  });
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setFormData({ nom: '', telephone: '', password: '' });
    setIsActive(true);
    setEditingLivreur(null);
  };

  const handleOpenDialog = (livreur?: Livreur) => {
    if (livreur) {
      setEditingLivreur(livreur);
      setFormData({
        nom: livreur.nom,
        telephone: livreur.telephone,
        password: '',
      });
      setIsActive(livreur.isActive);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingLivreur) {
      const updateData: UpdateLivreurDto = {
        nom: formData.nom,
        telephone: formData.telephone,
        isActive,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await updateLivreur.mutateAsync({
        id: editingLivreur.id,
        data: updateData,
      });
    } else {
      await createLivreur.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce livreur ?')) {
      await deleteLivreur.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Livreurs</h1>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>

        {livreurs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Aucun livreur enregistré
          </div>
        ) : isMobile ? (
          <div className="space-y-4">
            {livreurs.map((livreur) => (
              <LivreurMobileCard
                key={livreur.id}
                livreur={livreur}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
                isDeleting={deleteLivreur.isPending}
              />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {livreurs.map((livreur) => (
                <TableRow key={livreur.id}>
                  <TableCell className="font-medium">{livreur.nom}</TableCell>
                  <TableCell>{livreur.telephone}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${livreur.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {livreur.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(livreur)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(livreur.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLivreur ? 'Modifier le livreur' : 'Nouveau livreur'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) =>
                    setFormData({ ...formData, telephone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="password">
                  Mot de passe{' '}
                  {editingLivreur && '(laisser vide pour ne pas changer)'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              {editingLivreur && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Actif</Label>
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
              )}
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={createLivreur.isPending || updateLivreur.isPending}
              >
                {(createLivreur.isPending || updateLivreur.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingLivreur ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Livreurs;
