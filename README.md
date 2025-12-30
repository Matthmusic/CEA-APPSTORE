# CEA AppStore

App Store interne pour les applications CEA - Installez et mettez à jour toutes vos applications depuis un seul endroit.

## 🚀 Fonctionnalités

- **Catalogue dynamique** : Récupération automatique des applications depuis GitHub
- **Installation automatique** : Téléchargement et installation en un clic
- **Mises à jour intelligentes** : Détection automatique des nouvelles versions
- **Vérification en arrière-plan** : Check des MAJ toutes les 30 minutes
- **Interface moderne** : Design cyan avec animations fluides
- **Auto-update** : L'App Store se met à jour automatiquement

## 📦 Applications disponibles

- **ListX** - Gestion de listes et exports (PDF, Excel)
- **To-DoX** - Gestionnaire de tâches
- **AUTONUM** - Renommage automatique de fichiers
- **RENDEXPRESS** - Générateur de rendus formatés

## 🛠️ Stack Technique

- **Frontend** : React 19 + TypeScript + Tailwind CSS
- **Desktop** : Electron 39
- **Build** : Vite 7
- **API** : GitHub REST API (@octokit/rest)
- **Updates** : electron-updater
- **Versioning** : semver

## 🏗️ Architecture

```
CEA-APPSTORE/
├── electron/           # Process principal Electron
│   ├── main.cjs       # Configuration Electron + IPC
│   └── preload.cjs    # API sécurisée pour le renderer
├── src/
│   ├── components/    # Composants React
│   ├── context/       # State management (Context API)
│   ├── pages/         # Pages de l'app
│   ├── services/      # Services (GitHub API, etc.)
│   └── types/         # Types TypeScript
└── .github/workflows/ # CI/CD GitHub Actions
```

## 📥 Installation

### Pour les utilisateurs

1. Téléchargez le dernier `CEA AppStore-Setup-X.X.X.exe` depuis [Releases](https://github.com/Matthmusic/CEA-APPSTORE/releases)
2. Lancez l'installateur
3. L'application se lancera automatiquement

### Pour le développement

```bash
# Cloner le repo
git clone https://github.com/Matthmusic/CEA-APPSTORE.git
cd CEA-APPSTORE

# Installer les dépendances
npm install

# Lancer en mode dev
npm run electron:dev

# Build pour production
npm run electron:build
```

## 🔄 Système de versioning

Suit le versioning sémantique : `vMAJOR.MINOR.PATCH`

- **PATCH (v0.0.X)** : Corrections de bugs, améliorations mineures
- **MINOR (v0.X.0)** : Nouvelles fonctionnalités, améliorations UI
- **MAJOR (vX.0.0)** : Changements majeurs, breaking changes

## 🚢 Releases

Les releases sont automatisées via GitHub Actions :

```bash
# Créer une nouvelle version
npm version patch  # v0.0.1 → v0.0.2
git push origin main --tags

# GitHub Actions build automatiquement et crée la release
```

## 🔐 Sécurité

- **Context Isolation** : Séparation complète entre Node.js et navigateur
- **Preload sécurisé** : API limitée via contextBridge
- **Pas de nodeIntegration** : Renderer process isolé
- **HTTPS uniquement** : Toutes les communications sécurisées

## 🎨 Thème

Couleur principale : **#38FAFF** (Cyan)

- Barre de titre personnalisée sans bordures Windows
- Scrollbars customs avec le thème cyan
- Animations et gradients fluides
- Mode sombre par défaut

## 📝 Utilisation

### Installer une application

1. Parcourez le catalogue
2. Cliquez sur "Installer"
3. Le téléchargement démarre automatiquement
4. L'installateur s'ouvre une fois terminé
5. L'app est marquée comme installée

### Mettre à jour une application

1. Un badge "MAJ" apparaît sur les apps avec des updates
2. Cliquez sur "Mettre à jour"
3. La nouvelle version se télécharge et s'installe

### Filtres

- **Toutes** : Affiche toutes les applications
- **Installées** : Uniquement les apps installées
- **Mises à jour** : Uniquement les apps avec des MAJ disponibles

## 🤝 Contribution

Pour ajouter une nouvelle application au catalogue :

1. Créez l'app avec Electron + React
2. Configurez electron-builder avec GitHub releases
3. Ajoutez l'app dans `src/services/githubService.ts` (tableau `KNOWN_APPS`)

```typescript
{
  id: 'myapp',
  repo: 'MyApp',
  name: 'My App',
  category: 'Utilitaires',
  description: 'Description de mon app'
}
```

4. L'app apparaîtra automatiquement dans le catalogue !

## 📄 License

ISC

## 👤 Auteur

**Matthmusic**

- GitHub: [@Matthmusic](https://github.com/Matthmusic)
- Organisation: CEA

---

**v0.0.1** - Première version de l'App Store CEA 🎉
