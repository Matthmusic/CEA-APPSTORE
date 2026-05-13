# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commandes de développement

```bash
# Démarrer le serveur Vite seul (frontend React sur http://localhost:5588)
npm run dev

# Démarrer l'appli Electron complète en mode dev (Vite + Electron avec DevTools)
npm run electron:dev

# Vérification de types + build du frontend vers dist/
npm run build

# Build de l'installateur Windows vers release/
npm run electron:build

# Prévisualisation du build de production (sans Electron)
npm run preview
```

Aucune suite de tests n'existe dans ce projet.

## Workflow de release

Les releases sont déclenchées par des tags git et GitHub Actions (`.github/workflows/release.yml`) :

```bash
npm version patch   # ou minor / major — suit le semver défini dans VERSIONING.md
git push && git push --tags
# GitHub Actions build l'installateur NSIS et publie une GitHub Release
```

## Architecture générale

**CEA AppStore** est une appli de bureau Electron qui fait office de magasin d'applications interne : elle récupère un catalogue d'applications CEA depuis les releases GitHub, permet aux utilisateurs de les installer/mettre à jour/lancer, et se met à jour elle-même automatiquement.

### Séparation des processus (IPC Electron)

L'appli suit l'architecture sécurisée d'Electron avec une séparation stricte des processus :

- **Processus principal** (`electron/main.cjs`) — Environnement Node.js. Gère toutes les opérations filesystem/OS : téléchargement des installateurs via `axios`, lancement des processus `.exe`, requêtes sur le registre Windows pour détecter les applis installées, et gestion de la mise à jour automatique (`electron-updater`).
- **Script preload** (`electron/preload.cjs`) — Le seul pont entre les processus. Utilise `contextBridge.exposeInMainWorld('electronAPI', {...})` pour exposer un ensemble d'appels IPC. Toute capacité OS nécessaire au renderer doit être explicitement listée ici.
- **Processus renderer** (`src/`) — Appli React 19. Zéro accès Node.js. Appelle `window.electronAPI.*` pour tout ce qui nécessite le processus principal. Le type `ElectronAPI` dans `src/types/index.ts` reflète exactement la surface du preload.

### Flux de données : comment les applis arrivent dans le catalogue

1. `githubService.ts` — Utilise `@octokit/rest` pour interroger l'API GitHub sur les releases sous l'orga `@Matthmusic`. Liste des repos hardcodée : `ListX`, `To-DoX`, `AUTONUM`, `RENDEXPRESS`, `TONTONKAD`, `CaneFlow`. Un token GitHub (stocké en `localStorage`) évite le rate limiting.
2. Pour chaque repo, il essaie de récupérer un manifeste `cea-app.json` à la racine du repo (essayé sur `main`, puis `master`). Ce manifeste (`cea-app-template.json` documente le schéma) fournit les métadonnées, la config de détection, les URLs de logos, etc. Si aucun manifeste n'existe, un fallback hardcodé dans `KNOWN_APPS` est utilisé.
3. `ceaAppService.ts` parse le manifeste en type `AppInfo`.
4. Dans le renderer, `AppStoreContext.tsx` appelle `window.electronAPI.getInstalledApps()` pour croiser le catalogue avec ce qui est réellement installé, produisant `AppWithStatus[]` utilisé partout dans l'UI.

### Détection d'installation

Déterminer si une appli est installée est non trivial sur Windows et se découpe en deux couches :

- **Processus principal** (`electron/main.cjs`) — Le handler IPC `check-app-installation` lit le bloc `detection` du `cea-app.json`. Il vérifie les fichiers, répertoires, et clés du registre Windows (avec expansion des vars d'env comme `%APPDATA%`), et retourne la méthode qui a réussi. Un chemin legacy séparé vérifie `installed-apps.json` dans le dossier `userData` de l'appli.
- **Renderer** (`detectionService.ts`) — Valide et normalise les configs de détection avant de les envoyer au processus principal.

### Gestion de l'état

`AppStoreContext.tsx` est la seule source de vérité. Il fournit :
- Le catalogue complet avec le statut installation/mise à jour
- L'orchestration téléchargement/installation (appels vers `electronAPI`)
- Un intervalle en arrière-plan de 30 minutes qui vérifie les mises à jour

Les composants consomment ce contexte ; aucune bibliothèque d'état externe n'est utilisée.

### Structure de l'UI

- `App.tsx` — Shell racine : barre de titre sans frame avec contrôles de fenêtre (min/max/fermer via IPC), toggle du modal de paramètres, badge de version, et rendu de `CatalogPage`.
- `CatalogPage.tsx` — Barre de filtres (Tous / Installés / Mises à jour), recherche, et la grille d'applis responsive.
- `AppCard.tsx` — Carte par appli avec les actions installer/mettre à jour/lancer, barre de progression du téléchargement, et badges de statut. Le bouton "Lancer" utilise une animation CSS 3D cube flip.
- `UpdateNotification.tsx` — Bannière pour les mises à jour de l'AppStore lui-même (séparé des mises à jour des applis gérées).
- `SettingsModal.tsx` — Saisie du token GitHub + nom d'utilisateur, persisté en `localStorage`.
- `TicketReporter.tsx` — Formulaire de rapport de bug qui crée des issues GitHub dans un repo séparé `CEA-APPSTORE-TICKETS`.

### Styling

Tailwind CSS avec un theme sombre. Tokens personnalisés clés dans `tailwind.config.js` :
- `primary` : `#FF751F` (accent orange)
- `dark.bg` / `dark.card` / `dark.border` : les trois grises sombres utilisées partout

CSS personnalisé dans `index.css` : theme des scrollbars, `.btn-primary`/`.btn-secondary`, le 3D `.launch-button`/`.launch-cube`, et une animation pulse `.refresh-attention`.

## Manifeste CEA App (`cea-app.json`)

Chaque appli gérée livre son propre `cea-app.json` à la racine de son repo GitHub. Le schéma est documenté dans `cea-app-template.json` et `CEA-APP-GUIDE.md`. Les sections critiques pour l'AppStore sont :
- `app.id` / `app.name` / `app.version`
- `resources.logo.url` — récupérée et affichée directement
- `detection.windows` — fichiers/répertoires/clés registre utilisés pour détecter l'installation ; `detection.priority` choisit la méthode authoritative
- `installation` — URL de téléchargement et type d'installateur

## Patterns clés & points d'attention

- **L'IPC est le gardien.** Toute nouvelle capacité OS (accès fichier, spawn de processus, etc.) doit être ajoutée en trois endroits : un `ipcMain.handle()`/`on()` dans `main.cjs`, une entrée correspondante dans `preload.cjs`, et le type `ElectronAPI` dans `src/types/index.ts`.
- **Gestion EBUSY.** Windows verrouille régulièrement les fichiers `.exe` d'installateurs immédiatement après téléchargement. `main.cjs` a une logique de retry avec délais pour le fichier temp et le spawn — les nouvelles opérations fichier sur les installateurs doivent suivre le même pattern.
- **L'expansion des vars d'env est manuelle.** Les chemins issus des configs de détection `cea-app.json` contiennent des vars d'env Windows (`%APPDATA%` etc.). La fonction `expandEnvPath()` dans `main.cjs` et `detectionService.ts` s'en charge — ne pas utiliser les chemins bruts directement.
- **Le token GitHub est optionnel mais important.** Sans lui, le rate limit de l'API GitHub (60 req/h non authentifié) sera atteint rapidement en dev. Le définir via le modal Paramètres dans l'appli ; il est stocké en `localStorage`.
- **Les fichiers `electron/` sont CommonJS (`.cjs`).** Le `"type": "commonjs"` dans `package.json` s'en occupe. Le code React dans `src/` est ESM, géré par Vite.
- **Le port du serveur Vite est fixé à 5588** (`strictPort: true`). `electron:dev` utilise `wait-on tcp:5588` pour savoir quand lancer Electron.
