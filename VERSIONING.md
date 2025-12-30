# Versioning Guide - CEA AppStore

Ce document décrit le système de versioning utilisé pour CEA AppStore.

## Format de version

CEA AppStore utilise le **Semantic Versioning** (SemVer) : `vMAJOR.MINOR.PATCH`

### Structure

```
v0.0.1
│ │ │
│ │ └─ PATCH : Correctifs et améliorations mineures
│ └─── MINOR : Nouvelles fonctionnalités
└───── MAJOR : Changements majeurs ou breaking changes
```

## Règles d'incrémentation

### PATCH (v0.0.X)

Incrémentez le numéro de PATCH quand vous faites :

- Corrections de bugs
- Améliorations de performance
- Corrections visuelles mineures
- Mise à jour de dépendances mineures
- Corrections de typos dans l'UI
- Améliorations de logs/debug

**Exemples :**
- v0.0.1 → v0.0.2 : Correction bug téléchargement
- v0.0.5 → v0.0.6 : Amélioration vitesse de chargement
- v0.1.3 → v0.1.4 : Fix crash au démarrage

### MINOR (v0.X.0)

Incrémentez le numéro de MINOR quand vous ajoutez :

- Nouvelles fonctionnalités
- Améliorations significatives de l'UI
- Nouvelles applications au catalogue
- Nouvelles options/paramètres
- Refactoring majeur (sans breaking changes)
- Nouvelles intégrations

**Exemples :**
- v0.0.12 → v0.1.0 : Ajout filtres et recherche
- v0.2.5 → v0.3.0 : Nouveau système de notifications
- v0.5.0 → v0.6.0 : Page de settings

### MAJOR (vX.0.0)

Incrémentez le numéro de MAJOR quand vous faites :

- Refonte complète de l'UI
- Changements d'architecture majeurs
- Breaking changes (incompatibilité avec versions précédentes)
- Changement de technologie de base
- Migration vers nouvelle API

**Exemples :**
- v0.12.5 → v1.0.0 : Release stable initiale
- v1.5.2 → v2.0.0 : Nouvelle architecture de données
- v2.3.0 → v3.0.0 : Migration Electron 50+

## Phase de développement (v0.x.x)

Tant que l'application est en phase de développement initial :
- Utiliser v0.x.x
- v0.0.x pour les premiers développements
- v0.1.0+ pour les fonctionnalités principales
- v1.0.0 pour la première release stable

## Workflow de release

### 1. Développement local

```bash
# Faire vos modifications
git add .
git commit -m "Add: nouvelle fonctionnalité"
```

### 2. Incrémenter la version

```bash
# Pour un PATCH
npm version patch    # 0.0.1 → 0.0.2

# Pour un MINOR
npm version minor    # 0.0.2 → 0.1.0

# Pour un MAJOR
npm version major    # 0.1.0 → 1.0.0
```

Cette commande :
- Met à jour `package.json`
- Crée un commit automatique
- Crée un tag git `vX.Y.Z`

### 3. Pousser les changements

```bash
# Pousser le code ET les tags
git push origin main --tags
```

### 4. GitHub Actions s'occupe du reste

Le workflow `.github/workflows/release.yml` :
1. Détecte le nouveau tag
2. Build l'application
3. Crée une release GitHub
4. Upload le fichier `.exe`
5. Génère le fichier `latest.yml` pour electron-updater

## Changelog

Maintenir un `CHANGELOG.md` avec chaque version :

```markdown
# Changelog

## [0.1.0] - 2025-12-30

### Added
- Système de filtres (Toutes / Installées / MAJ)
- Recherche par nom/description
- Badge de notification pour MAJ

### Fixed
- Crash lors du téléchargement simultané
- Progress bar ne se met pas à jour

## [0.0.1] - 2025-12-29

### Added
- Version initiale
- Catalogue dynamique GitHub
- Installation automatique
- Auto-update de l'App Store
```

## Bonnes pratiques

1. **Ne jamais modifier un tag existant** : Les tags sont immuables
2. **Tester avant de release** : Vérifier que `npm run electron:build` fonctionne
3. **Documenter les breaking changes** : Toujours expliquer dans le CHANGELOG
4. **Release notes** : GitHub génère automatiquement, mais vous pouvez éditer

## Exemples de scénarios

### Scenario 1 : Bug fix simple

```bash
# État actuel : v0.0.5
# Bug : Le bouton "Installer" ne répond pas

git checkout -b fix/install-button
# Corriger le bug
git commit -m "Fix: bouton Installer ne répond pas"
git checkout main
git merge fix/install-button
npm version patch  # → v0.0.6
git push origin main --tags
```

### Scenario 2 : Nouvelle fonctionnalité

```bash
# État actuel : v0.1.2
# Feature : Ajout d'une page de paramètres

git checkout -b feature/settings-page
# Développer la feature
git commit -m "Add: page de paramètres"
git checkout main
git merge feature/settings-page
npm version minor  # → v0.2.0
git push origin main --tags
```

### Scenario 3 : Release stable

```bash
# État actuel : v0.12.5
# Tous les tests passent, app stable

git checkout main
npm version major  # → v1.0.0
git push origin main --tags

# Éditer la release sur GitHub pour marquer comme "Latest release"
```

## Vérification de version dans l'app

L'utilisateur peut voir la version dans :
1. Barre de titre (coin supérieur droit)
2. Menu "À propos" (si implémenté)
3. Fichier > Propriétés de l'exe

La version est automatiquement récupérée depuis `package.json` via :

```typescript
const version = await window.electronAPI.getAppVersion()
```

---

**Dernière mise à jour** : 30/12/2025
**Version du document** : 1.0
