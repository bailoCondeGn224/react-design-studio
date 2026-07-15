# Mode de Vente Frontend Simplifié - Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplifier l'interface de création d'article pour permettre à l'utilisateur de choisir facilement le type de vente (Gros, Détail, ou les deux) avec génération automatique des modes de vente.

**Architecture:** Interface simplifiée en 3 choix visuels → génération automatique des ModeVente correspondants → envoi au backend existant.

**Tech Stack:** React, TypeScript, Shadcn UI (RadioGroup, Input), Tailwind CSS (thème vert existant)

## Global Constraints

- Respecter la charte graphique verte existante (primary: hsl 119 80% 35%)
- Mobile-first: Sheet pour mobile, Dialog pour desktop
- Utiliser les composants Shadcn UI existants
- Ne pas modifier le backend (il est déjà correct)
- Le champ `uniteStock` doit être obligatoire si modes de vente sont configurés

---

### Task 1: Ajouter le composant de sélection du type de vente

**Files:**
- Create: `src/components/TypeVenteSelector.tsx`

**Interfaces:**
- Consumes: rien
- Produces: `TypeVenteSelector` component avec props `{ value: TypeVente, onChange: (value: TypeVente) => void, uniteStock: string, quantiteGros: number, onQuantiteGrosChange: (q: number) => void }`

- [ ] **Step 1: Créer le composant TypeVenteSelector**

```tsx
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Package, ShoppingBag, Layers } from "lucide-react";

export type TypeVente = "detail" | "gros" | "gros_et_detail";

interface TypeVenteSelectorProps {
  value: TypeVente;
  onChange: (value: TypeVente) => void;
  uniteStock: string;
  quantiteGros: number;
  onQuantiteGrosChange: (q: number) => void;
}

export function TypeVenteSelector({
  value,
  onChange,
  uniteStock,
  quantiteGros,
  onQuantiteGrosChange,
}: TypeVenteSelectorProps) {
  const options = [
    {
      value: "detail" as TypeVente,
      label: "Détail uniquement",
      description: `Vente à l'unité (1 ${uniteStock || "unité"})`,
      icon: ShoppingBag,
    },
    {
      value: "gros" as TypeVente,
      label: "Gros uniquement",
      description: `Vente en gros (par ${quantiteGros} ${uniteStock || "unités"})`,
      icon: Package,
    },
    {
      value: "gros_et_detail" as TypeVente,
      label: "Gros et Détail",
      description: "Les deux modes de vente disponibles",
      icon: Layers,
    },
  ];

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Type de vente</Label>

      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as TypeVente)}
        className="grid gap-3"
      >
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value={option.value} className="sr-only" />
              <div
                className={`p-2 rounded-full ${
                  isSelected ? "bg-primary text-white" : "bg-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{option.label}</p>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </label>
          );
        })}
      </RadioGroup>

      {/* Champ quantité gros - visible si gros ou gros_et_detail */}
      {(value === "gros" || value === "gros_et_detail") && (
        <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-3">
          <Label htmlFor="quantiteGros">
            Quantité par unité de gros
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="quantiteGros"
              type="number"
              min={2}
              value={quantiteGros}
              onChange={(e) => onQuantiteGrosChange(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-muted-foreground">
              {uniteStock || "unités"} par vente en gros
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Ex: 12 bouteilles par casier, 6 pièces par pack
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Vérifier que le fichier compile**

Run: `cd "C:\Users\Bailo conde\Documents\projects\Gestion _boutique _walli_indistrie\react-design-studio" && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/TypeVenteSelector.tsx
git commit -m "feat: add TypeVenteSelector component for simplified mode selection"
```

---

### Task 2: Intégrer TypeVenteSelector dans StockForm

**Files:**
- Modify: `src/components/StockForm.tsx`

**Interfaces:**
- Consumes: `TypeVenteSelector` component, `TypeVente` type
- Produces: StockForm avec section type de vente intégrée, génération automatique des modesVente

- [ ] **Step 1: Ajouter les imports et états dans StockForm**

Ajouter en haut du fichier après les imports existants:
```tsx
import { TypeVenteSelector, TypeVente } from "./TypeVenteSelector";
```

Ajouter les états dans le composant (après les useState existants):
```tsx
const [typeVente, setTypeVente] = useState<TypeVente>("detail");
const [quantiteGros, setQuantiteGros] = useState(12);
```

- [ ] **Step 2: Remplacer la section "Modes de Vente" par TypeVenteSelector**

Trouver la section existante qui commence par `{/* Section Modes de Vente */}` et la remplacer par:

```tsx
{/* Section Type de Vente */}
<div className="space-y-4 p-4 rounded-lg border bg-gradient-to-br from-primary/5 via-background to-background">
  <TypeVenteSelector
    value={typeVente}
    onChange={setTypeVente}
    uniteStock={uniteStock}
    quantiteGros={quantiteGros}
    onQuantiteGrosChange={setQuantiteGros}
  />
</div>
```

- [ ] **Step 3: Modifier la fonction handleSubmit pour générer les modesVente**

Dans la fonction handleSubmit, avant l'appel API, ajouter la logique de génération:

```tsx
// Générer les modes de vente en fonction du type sélectionné
const generatedModesVente: ModeVenteInline[] = [];

if (typeVente === "detail" || typeVente === "gros_et_detail") {
  generatedModesVente.push({
    nom: "Détail",
    quantiteStock: 1,
    prixVente: prixVente,
    parDefaut: typeVente === "detail",
  });
}

if (typeVente === "gros" || typeVente === "gros_et_detail") {
  // Prix gros = prix unitaire × quantité avec remise potentielle
  const prixGros = prixVente * quantiteGros;
  generatedModesVente.push({
    nom: "Gros",
    quantiteStock: quantiteGros,
    prixVente: prixGros,
    parDefaut: typeVente === "gros",
  });
}
```

Puis modifier l'objet envoyé à l'API pour inclure `modesVente: generatedModesVente`.

- [ ] **Step 4: Ajouter l'état uniteStock s'il n'existe pas**

Vérifier et ajouter si nécessaire:
```tsx
const [uniteStock, setUniteStock] = useState(article?.uniteStock || "Unité");
```

Et le champ input correspondant dans le formulaire:
```tsx
<div className="space-y-2">
  <Label htmlFor="uniteStock">Unité de stock</Label>
  <Input
    id="uniteStock"
    value={uniteStock}
    onChange={(e) => setUniteStock(e.target.value)}
    placeholder="Ex: Bouteille, Pièce, Kilo"
  />
  <p className="text-xs text-muted-foreground">
    L'unité de base pour le comptage du stock
  </p>
</div>
```

- [ ] **Step 5: Vérifier la compilation**

Run: `cd "C:\Users\Bailo conde\Documents\projects\Gestion _boutique _walli_indistrie\react-design-studio" && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/StockForm.tsx
git commit -m "feat: integrate TypeVenteSelector into StockForm with auto mode generation"
```

---

### Task 3: Ajouter le champ prix de gros optionnel

**Files:**
- Modify: `src/components/TypeVenteSelector.tsx`

**Interfaces:**
- Consumes: existing props
- Produces: Updated component avec `prixGros` et `onPrixGrosChange` props

- [ ] **Step 1: Étendre les props du composant**

```tsx
interface TypeVenteSelectorProps {
  value: TypeVente;
  onChange: (value: TypeVente) => void;
  uniteStock: string;
  quantiteGros: number;
  onQuantiteGrosChange: (q: number) => void;
  prixUnitaire: number;
  prixGros: number;
  onPrixGrosChange: (p: number) => void;
}
```

- [ ] **Step 2: Ajouter le champ prix de gros dans la section gros**

Après le champ quantité, ajouter:
```tsx
<div className="space-y-2 mt-3">
  <Label htmlFor="prixGros">
    Prix de vente en gros
  </Label>
  <div className="flex items-center gap-2">
    <Input
      id="prixGros"
      type="number"
      min={0}
      value={prixGros}
      onChange={(e) => onPrixGrosChange(Number(e.target.value))}
      className="w-32"
    />
    <span className="text-muted-foreground">GNF</span>
  </div>
  <p className="text-xs text-muted-foreground">
    Prix suggéré: {(prixUnitaire * quantiteGros).toLocaleString()} GNF
    (sans remise)
  </p>
</div>
```

- [ ] **Step 3: Mettre à jour StockForm avec les nouvelles props**

Ajouter l'état:
```tsx
const [prixGros, setPrixGros] = useState(prixVente * quantiteGros);
```

Mettre à jour le composant:
```tsx
<TypeVenteSelector
  value={typeVente}
  onChange={setTypeVente}
  uniteStock={uniteStock}
  quantiteGros={quantiteGros}
  onQuantiteGrosChange={(q) => {
    setQuantiteGros(q);
    setPrixGros(prixVente * q); // Auto-update prix gros
  }}
  prixUnitaire={prixVente}
  prixGros={prixGros}
  onPrixGrosChange={setPrixGros}
/>
```

- [ ] **Step 4: Mettre à jour la génération des modes**

Modifier la génération du mode gros:
```tsx
if (typeVente === "gros" || typeVente === "gros_et_detail") {
  generatedModesVente.push({
    nom: "Gros",
    quantiteStock: quantiteGros,
    prixVente: prixGros, // Utiliser le prix gros configuré
    parDefaut: typeVente === "gros",
  });
}
```

- [ ] **Step 5: Vérifier la compilation**

Run: `cd "C:\Users\Bailo conde\Documents\projects\Gestion _boutique _walli_indistrie\react-design-studio" && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/TypeVenteSelector.tsx src/components/StockForm.tsx
git commit -m "feat: add customizable wholesale price in TypeVenteSelector"
```

---

### Task 4: Gérer le mode édition avec initialisation des valeurs

**Files:**
- Modify: `src/components/StockForm.tsx`

**Interfaces:**
- Consumes: `article` prop avec `modesVente` existants
- Produces: Initialisation correcte des états à partir des modesVente existants

- [ ] **Step 1: Ajouter la fonction d'analyse des modes existants**

```tsx
// Fonction pour déduire le type de vente à partir des modes existants
function inferTypeVente(modes: ModeVente[] | undefined): {
  typeVente: TypeVente;
  quantiteGros: number;
  prixGros: number;
} {
  if (!modes || modes.length === 0) {
    return { typeVente: "detail", quantiteGros: 12, prixGros: 0 };
  }

  const modeDetail = modes.find((m) => m.quantiteStock === 1);
  const modeGros = modes.find((m) => m.quantiteStock > 1);

  if (modeDetail && modeGros) {
    return {
      typeVente: "gros_et_detail",
      quantiteGros: modeGros.quantiteStock,
      prixGros: modeGros.prixVente,
    };
  } else if (modeGros) {
    return {
      typeVente: "gros",
      quantiteGros: modeGros.quantiteStock,
      prixGros: modeGros.prixVente,
    };
  } else {
    return {
      typeVente: "detail",
      quantiteGros: 12,
      prixGros: 0,
    };
  }
}
```

- [ ] **Step 2: Utiliser la fonction pour initialiser les états**

```tsx
const initialVenteConfig = useMemo(
  () => inferTypeVente(article?.modesVente),
  [article?.modesVente]
);

const [typeVente, setTypeVente] = useState<TypeVente>(
  initialVenteConfig.typeVente
);
const [quantiteGros, setQuantiteGros] = useState(
  initialVenteConfig.quantiteGros
);
const [prixGros, setPrixGros] = useState(
  initialVenteConfig.prixGros || prixVente * initialVenteConfig.quantiteGros
);
```

- [ ] **Step 3: Vérifier la compilation**

Run: `cd "C:\Users\Bailo conde\Documents\projects\Gestion _boutique _walli_indistrie\react-design-studio" && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/StockForm.tsx
git commit -m "feat: initialize type vente from existing modes when editing"
```

---

### Task 5: Mettre à jour VenteForm pour afficher les modes simplement

**Files:**
- Modify: `src/components/VenteForm.tsx`

**Interfaces:**
- Consumes: `article.modesVente` array
- Produces: Sélecteur de mode simplifié (Détail/Gros) au lieu de liste technique

- [ ] **Step 1: Simplifier l'affichage du sélecteur de mode**

Remplacer le Select des modes par une version simplifiée:

```tsx
{article.modesVente && article.modesVente.length > 1 && (
  <div className="flex gap-2 mt-2">
    {article.modesVente.map((mode) => (
      <button
        key={mode.id}
        type="button"
        onClick={() => handleModeChange(ligne.id, mode.id)}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          ligne.modeVenteId === mode.id
            ? "bg-primary text-white"
            : "bg-muted hover:bg-muted/80"
        }`}
      >
        {mode.nom} ({mode.prixVente.toLocaleString()} GNF)
      </button>
    ))}
  </div>
)}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `cd "C:\Users\Bailo conde\Documents\projects\Gestion _boutique _walli_indistrie\react-design-studio" && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/VenteForm.tsx
git commit -m "feat: simplify mode selection UI with pill buttons"
```

---

### Task 6: Tests et vérification finale

**Files:**
- None (verification only)

- [ ] **Step 1: Build de production**

Run: `cd "C:\Users\Bailo conde\Documents\projects\Gestion _boutique _walli_indistrie\react-design-studio" && npm run build`
Expected: Build successful

- [ ] **Step 2: Test manuel des scénarios**

Tester via navigateur:
1. Créer un article avec "Détail uniquement" → Vérifier qu'un seul mode est créé
2. Créer un article avec "Gros uniquement" → Vérifier mode avec quantiteStock > 1
3. Créer un article avec "Gros et Détail" → Vérifier les 2 modes créés
4. Éditer un article existant → Vérifier que le type est correctement détecté
5. Faire une vente → Vérifier que le sélecteur de mode fonctionne

- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "chore: complete simplified mode vente UI implementation"
```

---

## Résumé des changements

| Avant (Complexe) | Après (Simplifié) |
|------------------|-------------------|
| Liste de modes avec nom/quantité/prix | 3 boutons radio: Détail / Gros / Les deux |
| Formulaire technique par mode | Auto-génération des modes |
| Confusion utilisateur | Interface intuitive |

Le backend reste inchangé - seule l'interface frontend est simplifiée.
