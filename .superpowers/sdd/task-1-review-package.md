# Task 1 Review Package

## Commits
0e38d78 feat(types): ajouter ModeVente types

## Files Changed
src/types/index.ts | 37 ++++++

## Diff

```diff
diff --git a/src/types/index.ts b/src/types/index.ts
index 7fa40ec..c66099a 100644
--- a/src/types/index.ts
+++ b/src/types/index.ts
@@ -265,6 +265,9 @@ export interface Article {
   fournisseurPrefereNom?: string;
   prixMoyenAchat?: number; // Prix moyen d'achat chez tous les fournisseurs
   nombreFournisseurs?: number; // Nombre de fournisseurs qui fournissent cet article
+  // Modes de vente (gros/détail)
+  uniteStock?: string;
+  modesVente?: ModeVente[];
   createdAt?: string;
   updatedAt?: string;
 }
@@ -296,6 +299,38 @@ export interface CreateArticleDto {
   photo?: string;
   dateExpiration?: string;
   delaiAlerteExpiration?: number;
+  uniteStock?: string;
+  modesVente?: ModeVenteInline[];
+}
+
+// Types pour les Modes de Vente (Gros/Détail)
+export interface ModeVente {
+  id: string;
+  articleId: string;
+  nom: string;
+  quantiteStock: number;
+  prixVente: number;
+  codeBarre?: string;
+  parDefaut: boolean;
+  createdAt?: string;
+  updatedAt?: string;
+}
+
+export interface ModeVenteInline {
+  nom: string;
+  quantiteStock: number;
+  prixVente: number;
+  codeBarre?: string;
+  parDefaut?: boolean;
+}
+
+export interface CreateModeVenteDto {
+  articleId: string;
+  nom: string;
+  quantiteStock: number;
+  prixVente: number;
+  codeBarre?: string;
+  parDefaut?: boolean;
 }
 
 // Types pour les Ventes
@@ -305,6 +340,8 @@ export interface LigneVente {
   quantite: number;
   prixUnitaire: number;
   sousTotal: number;
+  modeVenteId?: string;
+  modeVenteNom?: string;
 }
```
