# 🌟 Élégance - Gestion de Boutique

Application moderne de gestion pour boutiques de vêtements traditionnels avec authentification complète et intégration API.

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![React](https://img.shields.io/badge/React-18.3-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)

---

## ✨ Fonctionnalités

### 🔐 Authentification
- ✅ Connexion sécurisée avec JWT
- ✅ Protection des routes
- ✅ Bouton déconnexion dans la sidebar
- ✅ Page de connexion élégante et responsive

### 📦 Modules de Gestion
- ✅ **Stock** - Inventaire complet par zones
- ✅ **Fournisseurs** - Base de données fournisseurs
- ✅ **Ventes** - Enregistrement et suivi
- ✅ **Versements** - Gestion des paiements fournisseurs
- ✅ **Finances** - Trésorerie et rapports

### 🎨 Design
- ✅ Thème vert moderne
- ✅ 100% Responsive (Mobile/Tablette/Desktop)
- ✅ Textes adaptatifs selon la taille d'écran
- ✅ Tableaux redesignés et optimisés

---

## 🚀 Installation

### ⚠️ Prérequis: Backend

**IMPORTANT:** Avant de lancer le frontend, vous devez configurer et démarrer le backend.

📖 **Guide complet:** [BACKEND_SETUP.md](./BACKEND_SETUP.md)

**Résumé rapide:**
```bash
# 1. Créer la base PostgreSQL
psql -U postgres -c "CREATE DATABASE boutique_abayas;"

# 2. Aller dans le dossier backend
cd ../Gestion_boutique_backend

# 3. Installer les dépendances
npm install

# 4. Exécuter le seed (créer admin)
npm run seed

# 5. Démarrer le backend
npm run start:dev
```

### Frontend

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le fichier d'environnement
cp .env.example .env

# 3. Configurer l'URL de l'API dans .env
VITE_API_BASE_URL=http://localhost:3000

# 4. Lancer le serveur
npm run dev
```

**Credentials de test:**
- Email: `admin@boutique.com`
- Password: `admin123`

---

## 📡 Configuration API

Le frontend nécessite un backend REST avec les endpoints suivants :

### Authentification
- `POST /auth/login` - Connexion
- `GET /auth/me` - Utilisateur actuel

### Données
- `GET/POST/PATCH/DELETE /stock` - Articles
- `GET/POST/PATCH/DELETE /fournisseurs` - Fournisseurs
- `GET/POST/PATCH/DELETE /ventes` - Ventes
- `GET/POST /versements` - Versements

📖 **Guides complets:**
- [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Configuration du backend et base de données
- [AUTHENTIFICATION.md](./AUTHENTIFICATION.md) - Documentation API et authentification

---

## 🛠️ Technologies

- **React 18** + **TypeScript**
- **TailwindCSS** + **Shadcn/ui**
- **React Query** - Gestion d'état
- **Axios** - Client HTTP
- **React Router** - Navigation
- **Recharts** - Graphiques

---

## 📂 Structure

```
src/
├── api/              # Services API
├── hooks/            # React Query hooks
├── components/       # Composants UI
├── pages/            # Pages de l'app
├── types/            # Types TypeScript
└── lib/              # Utilitaires
```

---

## 🔒 Sécurité

- ✅ Routes protégées avec `ProtectedRoute`
- ✅ Token JWT stocké en localStorage
- ✅ Déconnexion auto sur erreur 401
- ✅ Intercepteurs Axios configurés

---

## 📱 Responsive

| Taille | Breakpoint | Comportement |
|--------|------------|--------------|
| Mobile | < 640px | Menu hamburger, 1 colonne |
| Tablette | 640-1024px | 2-3 colonnes |
| Desktop | > 1024px | Layout complet |

---

## 📚 Documentation

- [**AUTHENTIFICATION.md**](./AUTHENTIFICATION.md) - Guide complet Auth & API
- Types : `src/types/index.ts`
- Hooks : `src/hooks/`

---

## 🎯 Scripts

```bash
npm run dev      # Développement
npm run build    # Build production
npm run preview  # Prévisualiser build
```

---

<div align="center">

**Fait avec ❤️ pour la gestion moderne des boutiques**

</div>
