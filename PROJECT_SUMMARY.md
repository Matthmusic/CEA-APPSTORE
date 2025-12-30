# 📋 CEA AppStore - Résumé du Projet

## 🎯 Objectif

Créer un App Store interne pour CEA permettant aux collaborateurs d'installer et mettre à jour facilement toutes les applications de l'organisation depuis une interface unique et moderne.

## ✨ Fonctionnalités Principales

### 🏪 Catalogue Dynamique
- Récupération automatique des applications depuis GitHub (@Matthmusic)
- Affichage des versions disponibles, dates de release, taille des fichiers
- Filtrage : Toutes / Installées / Mises à jour disponibles
- Recherche en temps réel par nom, description ou catégorie

### 📥 Installation Automatique
- Téléchargement en un clic avec progress bar animée
- Lancement automatique de l'installateur
- Tracking local des apps installées (JSON)
- Support de l'installation silencieuse

### 🔄 Mises à Jour Intelligentes
- Détection automatique des nouvelles versions (semver)
- Vérification en arrière-plan toutes les 30 minutes
- Badge "MAJ" sur les apps avec updates disponibles
- Un clic pour mettre à jour

### 🔃 Auto-Update de l'App Store
- L'App Store se met à jour lui-même via electron-updater
- Toast notification pour les nouvelles versions
- Installation au prochain redémarrage

## 🛠️ Stack Technique Complète

### Frontend
| Technologie | Version | Rôle |
|------------|---------|------|
| React | 19.0.0 | UI Framework |
| TypeScript | 5.7.2 | Type Safety |
| Vite | 7.1.7 | Build Tool |
| Tailwind CSS | 3.4.17 | Styling |
| Lucide React | 0.468.0 | Icons |

### Desktop
| Technologie | Version | Rôle |
|------------|---------|------|
| Electron | 39.0.0 | Desktop Framework |
| electron-builder | 26.0.0 | Packaging |
| electron-updater | 6.3.9 | Auto-Updates |

### APIs & Services
| Technologie | Version | Rôle |
|------------|---------|------|
| @octokit/rest | 21.0.2 | GitHub API |
| axios | 1.7.9 | HTTP Client |
| semver | 7.6.3 | Version Comparison |

### Dev Tools
| Technologie | Version | Rôle |
|------------|---------|------|
| concurrently | 9.1.2 | Run Multiple Commands |
| wait-on | 8.0.3 | Wait for Server |
| ESLint | 9.17.0 | Linting |

## 📦 Applications Disponibles

| App | Version | Catégorie | Description |
|-----|---------|-----------|-------------|
| ListX | v1.3.17+ | Productivité | Gestion de listes et exports (PDF, Excel) |
| To-DoX | v1.8.12+ | Productivité | Gestionnaire de tâches et to-do lists |
| AUTONUM | v0.0.10+ | Utilitaires | Renommage automatique de fichiers |
| RENDEXPRESS | v0.0.7+ | Utilitaires | Générateur de rendus formatés |

## 🎨 Design System

### Couleurs
- **Principale** : `#38FAFF` (Cyan vibrant)
- **Principale Dark** : `#2DD4D9`
- **Principale Light** : `#5FFBFF`
- **Background** : `#0a0a0a` (Noir profond)
- **Card** : `#1a1a1a` (Gris foncé)
- **Border** : `#2a2a2a` (Gris moyen)

### Composants Clés
- **AppCard** : Card interactive pour chaque application
- **UpdateNotification** : Toast pour mises à jour de l'App Store
- **CatalogPage** : Page principale avec grille responsive
- **Custom Title Bar** : Barre de titre sans bordures Windows

### Animations
- Fade-in : 0.3s ease-in-out
- Slide-up : 0.3s ease-out
- Progress bars animées
- Hover effects fluides

## 🏗️ Architecture

### Structure des Dossiers
```
CEA-APPSTORE/
├── electron/              # Process principal Electron
├── src/
│   ├── components/       # Composants React réutilisables
│   ├── context/          # State management (Context API)
│   ├── pages/            # Pages de l'application
│   ├── services/         # Services (GitHub, etc.)
│   └── types/            # Définitions TypeScript
├── .github/workflows/    # CI/CD GitHub Actions
├── build/                # Ressources de build (icônes)
└── docs/                 # Documentation
```

### Pattern IPC (Inter-Process Communication)

**Main Process (electron/main.cjs)**
- Gestion de la fenêtre
- Auto-updater configuration
- IPC handlers pour download/install
- Tracking des apps installées

**Preload (electron/preload.cjs)**
- API sécurisée via contextBridge
- Exposition limitée de fonctions
- Pas d'accès direct à Node.js

**Renderer (React)**
- UI moderne et reactive
- Context API pour state global
- Communication via window.electronAPI

## 🔒 Sécurité

### Mesures Implémentées
- ✅ Context Isolation activée
- ✅ Node Integration désactivée
- ✅ API limitée via preload
- ✅ DevTools désactivées en production
- ✅ Pas d'eval() ou code dynamique
- ✅ HTTPS uniquement pour les communications
- ✅ Validation des URLs de téléchargement

### Bonnes Pratiques
- Séparation stricte main/renderer
- Sanitization des inputs utilisateur
- Vérification des signatures (à implémenter)
- Rate limiting sur API GitHub

## 🚀 Workflow de Release

### Processus Automatisé

```mermaid
Developer → Git Tag → GitHub Actions → Build → Release → Users
```

1. **Developer** : Crée un tag `vX.Y.Z`
2. **GitHub Actions** : Détecte le tag et lance le build
3. **Build** : Compile l'app et crée le `.exe`
4. **Release** : Publie sur GitHub Releases
5. **Users** : Reçoivent notification de mise à jour

### Fichiers Générés par Release
- `CEA AppStore-Setup-X.Y.Z.exe` (~100-150 MB)
- `latest.yml` (metadata pour electron-updater)
- `builder-debug.yml` (logs de debug)

## 📊 Système de Versioning

**Format** : `vMAJOR.MINOR.PATCH`

- **v0.0.X** : Phase de développement initial
- **v0.X.0** : Nouvelles fonctionnalités
- **vX.0.0** : Changements majeurs / breaking changes

**Version actuelle** : `v0.0.1` (Initial release)

## 🎯 Fonctionnalités Futures (Roadmap)

### Phase 1 - Stabilisation (v0.1.0)
- [ ] Page de paramètres
- [ ] Configuration du dossier de téléchargement
- [ ] Logs d'installation détaillés

### Phase 2 - Enrichissement (v0.2.0)
- [ ] Désinstallation depuis l'App Store
- [ ] Modal avec release notes détaillées
- [ ] Screenshots des applications
- [ ] Système de rating/favoris

### Phase 3 - Avancé (v0.3.0)
- [ ] Statistiques d'utilisation
- [ ] Notifications système
- [ ] Mode light/dark toggle
- [ ] Catégories personnalisées

### Phase 4 - Entreprise (v1.0.0)
- [ ] Authentification utilisateur
- [ ] Gestion des permissions
- [ ] Analytics centralisées
- [ ] Distribution d'apps privées

## 🔧 Configuration Requise

### Pour les Utilisateurs
- **OS** : Windows 10/11 (64-bit)
- **RAM** : 4 GB minimum
- **Stockage** : 200 MB pour l'App Store + espace pour les apps
- **Internet** : Connexion requise pour téléchargement

### Pour les Développeurs
- **Node.js** : v20.x ou supérieur
- **npm** : v10.x ou supérieur
- **Git** : v2.x ou supérieur
- **Windows** : Pour tester le build .exe

## 📈 Métriques de Performance

### Temps de Chargement
- **Démarrage** : < 2 secondes
- **Chargement catalogue** : < 3 secondes (dépend de GitHub API)
- **Affichage grille** : Instant (optimisé)

### Utilisation Ressources
- **RAM** : ~100-150 MB (idle)
- **CPU** : < 5% (idle), ~10-15% (download)
- **Disk** : ~120 MB installé

## 🧪 Tests

### À Implémenter
- [ ] Tests unitaires (Vitest)
- [ ] Tests d'intégration (Playwright)
- [ ] Tests E2E Electron (Spectron)
- [ ] Tests de performance

### Scénarios Critiques à Tester
1. Installation d'une app
2. Mise à jour d'une app
3. Auto-update de l'App Store
4. Gestion des erreurs réseau
5. Comparaison de versions

## 📚 Documentation

| Fichier | Description |
|---------|-------------|
| [README.md](README.md) | Documentation principale |
| [QUICKSTART.md](QUICKSTART.md) | Guide de démarrage rapide |
| [VERSIONING.md](VERSIONING.md) | Guide de versioning |
| [CHANGELOG.md](CHANGELOG.md) | Historique des versions |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Ce fichier - Vue d'ensemble |

## 🤝 Contribution

### Ajouter une App
1. Créer l'app avec Electron
2. Configurer GitHub releases
3. Ajouter dans `KNOWN_APPS` (githubService.ts)

### Proposer une Feature
1. Créer une issue GitHub
2. Décrire le besoin et l'implémentation
3. Attendre validation
4. Développer et créer PR

## 🐛 Support

### Problèmes Connus
- Aucun pour le moment (v0.0.1)

### Comment Signaler un Bug
1. Vérifier qu'il n'existe pas déjà
2. Créer une issue GitHub
3. Fournir : OS, version, steps to reproduce, logs

## 📞 Contacts

- **Développeur** : Matthmusic
- **Organisation** : CEA
- **GitHub** : [@Matthmusic](https://github.com/Matthmusic)
- **Repo** : [CEA-APPSTORE](https://github.com/Matthmusic/CEA-APPSTORE)

---

**Dernière mise à jour** : 30/12/2025
**Version du document** : 1.0
**Version de l'app** : v0.0.1
