// src/pages/Livreurs.tsx
import { useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLivreurs, useCreateLivreur, useUpdateLivreur, useDeleteLivreur } from "@/hooks/useLivreurs";
import { Livreur, CreateLivreurDto, UpdateLivreurDto } from "@/types";
import { Plus, Search, Pencil, Trash2, Loader2, User, Phone, Mail, Navigation } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Livreurs = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLivreur, setSelectedLivreur] = useState<Livreur | null>(null);
  const [formData, setFormData] = useState<CreateLivreurDto>({
    nom: "",
    telephone: "",
    email: "",
    password: "",
  });

  const { data: livreurs, isLoading } = useLivreurs();
  const createLivreur = useCreateLivreur();
  const updateLivreur = useUpdateLivreur();
  const deleteLivreur = useDeleteLivreur();

  const filteredLivreurs = livreurs?.filter(l =>
    l.nom.toLowerCase().includes(search.toLowerCase()) ||
    l.telephone.includes(search)
  ) || [];

  const handleOpenCreate = () => {
    setSelectedLivreur(null);
    setFormData({ nom: "", telephone: "", email: "", password: "" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (livreur: Livreur) => {
    setSelectedLivreur(livreur);
    setFormData({
      nom: livreur.nom,
      telephone: livreur.telephone,
      email: livreur.email || "",
      password: "",
    });
    setDialogOpen(true);
  };

  const handleOpenDelete = (livreur: Livreur) => {
    setSelectedLivreur(livreur);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (selectedLivreur) {
      // Update
      const dto: UpdateLivreurDto = {
        nom: formData.nom,
        telephone: formData.telephone,
        email: formData.email || undefined,
      };
      if (formData.password) {
        dto.password = formData.password;
      }
      await updateLivreur.mutateAsync({ id: selectedLivreur.id, dto });
    } else {
      // Create
      await createLivreur.mutateAsync(formData);
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (selectedLivreur) {
      await deleteLivreur.mutateAsync(selectedLivreur.id);
      setDeleteDialogOpen(false);
    }
  };

  const handleToggleActive = async (livreur: Livreur) => {
    await updateLivreur.mutateAsync({
      id: livreur.id,
      dto: { isActive: !livreur.isActive },
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Livreurs</h1>
            <p className="text-muted-foreground">Gérez vos livreurs pour le suivi des livraisons</p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un livreur
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Liste */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredLivreurs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Aucun livreur trouvé</p>
              <Button onClick={handleOpenCreate} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter votre premier livreur
              </Button>
            </CardContent>
          </Card>
        ) : isMobile ? (
          <div className="space-y-4">
            {filteredLivreurs.map((livreur) => (
              <Card key={livreur.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{livreur.nom}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {livreur.telephone}
                        </div>
                        {livreur.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {livreur.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Switch
                        checked={livreur.isActive}
                        onCheckedChange={() => handleToggleActive(livreur)}
                      />
                      {livreur.isDelivering && (
                        <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                          <Navigation className="h-3 w-3" />
                          En livraison
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleOpenEdit(livreur)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleOpenDelete(livreur)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actif</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLivreurs.map((livreur) => (
                    <TableRow key={livreur.id}>
                      <TableCell className="font-medium">{livreur.nom}</TableCell>
                      <TableCell>{livreur.telephone}</TableCell>
                      <TableCell>{livreur.email || "-"}</TableCell>
                      <TableCell>
                        {livreur.isDelivering ? (
                          <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full w-fit">
                            <Navigation className="h-3 w-3" />
                            En livraison
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Disponible</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={livreur.isActive}
                          onCheckedChange={() => handleToggleActive(livreur)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(livreur)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleOpenDelete(livreur)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLivreur ? "Modifier le livreur" : "Ajouter un livreur"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Nom du livreur"
              />
            </div>
            <div>
              <Label htmlFor="telephone">Téléphone *</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="Ex: 620000000"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemple.com"
              />
            </div>
            <div>
              <Label htmlFor="password">
                {selectedLivreur ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe *"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.nom ||
                !formData.telephone ||
                (!selectedLivreur && !formData.password) ||
                createLivreur.isPending ||
                updateLivreur.isPending
              }
            >
              {(createLivreur.isPending || updateLivreur.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {selectedLivreur ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce livreur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le livreur "{selectedLivreur?.nom}" sera supprimé définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLivreur.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Livreurs;
