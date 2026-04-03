import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Search, Plus, Star, Phone, Mail, MapPin, MoreVertical } from "lucide-react";
import { useState } from "react";

const fournisseurs = [
  { id: 1, nom: "Al-Nour Textiles", ville: "Dubaï", tel: "+971 55 123 4567", email: "contact@alnour.ae", produits: ["Abayas", "Foulards"], rating: 4.5, statut: "actif" },
  { id: 2, nom: "Bamako Bazin", ville: "Bamako", tel: "+223 70 234 567", email: "info@bamakobazin.ml", produits: ["Bazin Riche", "Bazin Brodé"], rating: 4.2, statut: "actif" },
  { id: 3, nom: "Istanbul Fashion", ville: "Istanbul", tel: "+90 532 987 654", email: "sales@istfashion.tr", produits: ["Djellabas", "Abayas"], rating: 4.8, statut: "actif" },
  { id: 4, nom: "Dakar Couture", ville: "Dakar", tel: "+221 77 345 678", email: "cmd@dakarcouture.sn", produits: ["Boubous", "Pagne"], rating: 3.9, statut: "en attente" },
  { id: 5, nom: "Guangzhou Fabrics", ville: "Guangzhou", tel: "+86 139 876 543", email: "export@gzfabrics.cn", produits: ["Foulards", "Tissus"], rating: 4.0, statut: "actif" },
];

const Fournisseurs = () => {
  const [search, setSearch] = useState("");
  const filtered = fournisseurs.filter(f => 
    f.nom.toLowerCase().includes(search.toLowerCase()) ||
    f.ville.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <PageHeader
        title="Fournisseurs"
        description="Gestion et suivi de vos partenaires commerciaux"
        action={
          <button className="gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Nouveau Fournisseur
          </button>
        }
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un fournisseur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((f) => (
          <div key={f.id} className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-heading font-semibold text-foreground">{f.nom}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="w-3 h-3" /> {f.ville}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  f.statut === "actif" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}>
                  {f.statut}
                </span>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(f.rating) ? "text-primary fill-primary" : "text-border"}`} />
              ))}
              <span className="text-xs text-muted-foreground ml-1">{f.rating}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {f.produits.map((p) => (
                <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{p}</span>
              ))}
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3">
              <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {f.tel}</div>
              <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {f.email}</div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default Fournisseurs;
