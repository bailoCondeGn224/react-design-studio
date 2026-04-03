import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Package, AlertTriangle, Search, Filter } from "lucide-react";
import { useState } from "react";

type Categorie = "all" | "abayas" | "foulards" | "bazin" | "autres";

const stockItems = [
  { id: 1, nom: "Abaya Noire Premium", categorie: "abayas", zone: "A", stock: 25, seuil: 10, max: 50, prix: "85 000 GNF" },
  { id: 2, nom: "Abaya Bleu Marine M", categorie: "abayas", zone: "A", stock: 3, seuil: 10, max: 50, prix: "90 000 GNF" },
  { id: 3, nom: "Abaya Bordeaux L", categorie: "abayas", zone: "A", stock: 18, seuil: 10, max: 50, prix: "95 000 GNF" },
  { id: 4, nom: "Hijab Soie Crème", categorie: "foulards", zone: "B", stock: 42, seuil: 20, max: 100, prix: "25 000 GNF" },
  { id: 5, nom: "Foulard Coton Blanc", categorie: "foulards", zone: "B", stock: 8, seuil: 20, max: 100, prix: "15 000 GNF" },
  { id: 6, nom: "Shaïla Noir", categorie: "foulards", zone: "B", stock: 55, seuil: 20, max: 100, prix: "20 000 GNF" },
  { id: 7, nom: "Bazin Riche Doré", categorie: "bazin", zone: "C", stock: 2, seuil: 5, max: 30, prix: "180 000 GNF/rouleau" },
  { id: 8, nom: "Bazin Brodé Bleu", categorie: "bazin", zone: "C", stock: 12, seuil: 5, max: 30, prix: "220 000 GNF/rouleau" },
  { id: 9, nom: "Djellaba Homme Blanche", categorie: "autres", zone: "D", stock: 15, seuil: 5, max: 40, prix: "120 000 GNF" },
  { id: 10, nom: "Boubou Femme Wax", categorie: "autres", zone: "D", stock: 7, seuil: 5, max: 40, prix: "65 000 GNF" },
];

const categories: { key: Categorie; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "abayas", label: "Abayas" },
  { key: "foulards", label: "Foulards" },
  { key: "bazin", label: "Bazin" },
  { key: "autres", label: "Autres" },
];

const Stock = () => {
  const [cat, setCat] = useState<Categorie>("all");
  const [search, setSearch] = useState("");

  const filtered = stockItems.filter(item => {
    const matchCat = cat === "all" || item.categorie === cat;
    const matchSearch = item.nom.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getStockStatus = (stock: number, seuil: number) => {
    if (stock <= seuil * 0.3) return { label: "Critique", color: "bg-destructive/10 text-destructive" };
    if (stock <= seuil) return { label: "Bas", color: "bg-warning/10 text-warning" };
    return { label: "OK", color: "bg-success/10 text-success" };
  };

  return (
    <AppLayout>
      <PageHeader
        title="Gestion du Stock"
        description="Suivi des articles par zone — Organisation ABCDE"
        action={
          <button className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity">
            <Package className="w-4 h-4" /> Inventaire
          </button>
        }
      />

      {/* Zones Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {["A — Abayas", "B — Foulards", "C — Bazin", "D — Autres", "E — Sécurité"].map((zone, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-3 text-center shadow-card">
            <p className="text-xs text-muted-foreground">Zone</p>
            <p className="text-sm font-semibold text-foreground">{zone}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex gap-1.5">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                cat === c.key
                  ? "gradient-gold text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Article</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Zone</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Stock</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Seuil</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Statut</th>
              <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Prix</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const status = getStockStatus(item.stock, item.seuil);
              return (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {item.stock <= item.seuil && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                      <span className="text-sm font-medium text-foreground">{item.nom}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.zone}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{item.stock}</span>
                      <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.stock <= item.seuil * 0.3 ? "bg-destructive" : item.stock <= item.seuil ? "bg-warning" : "bg-success"
                          }`}
                          style={{ width: `${Math.min((item.stock / item.max) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.seuil}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-foreground">{item.prix}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
};

export default Stock;
