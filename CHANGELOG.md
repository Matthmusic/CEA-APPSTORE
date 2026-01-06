# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [0.0.9] - 2026-01-06

### Added
- CaneFlow ajouté au scan du catalogue via `cea-app.json`.
- Alerte visuelle sur le bouton de rafraîchissement quand le catalogue est vide ou en erreur.

### Changed
- Tri alphabétique des applications dans le catalogue et le sélecteur de signalement.
- Le sélecteur de signalement n'affiche plus la version dans le libellé.

## [0.0.10] - 2026-01-06

### Fixed
- Lancement des apps via les chemins de dÇ¸tection du manifest CEA quand le registre ne renvoie rien.
- RÇ¸solution de `%LOCALAPPDATA%` alignÇ¸e sur le dossier utilisateur Windows.

## [0.0.1] - 2025-12-30

### Added

#### Fonctionnalités principales
- Catalogue dynamique récupérant automatiquement les apps depuis GitHub (@Matthmusic)
- Installation automatique des applications en un clic
- Système de tracking des applications installées (JSON local)
- Détection automatique des mises à jour disponibles
- Vérification des MAJ en arrière-plan (toutes les 30 minutes)
- Auto-update de l'App Store lui-même via electron-updater

#### Interface utilisateur
- Design moderne avec thème cyan (#38FAFF)
- Barre de titre personnalisée sans bordures Windows
- Grille responsive d'applications (1-4 colonnes selon taille écran)
- Cards interactives avec hover effects
- Progress bar animée pour les téléchargements
- Badges de statut (Installé, MAJ disponible)
- Scrollbars customs avec le thème cyan

#### Filtres et recherche
- Filtre "Toutes" : Affiche toutes les applications
- Filtre "Installées" : Uniquement les apps installées
- Filtre "Mises à jour" : Uniquement les apps avec MAJ dispo
- Barre de recherche en temps réel (nom, description, catégorie)

#### Applications disponibles
- ListX v1.3.17+ (Gestion de listes et exports)
- To-DoX v1.8.12+ (Gestionnaire de tâches)
- AUTONUM v0.0.10+ (Renommage de fichiers)
- RENDEXPRESS v0.0.7+ (Générateur de rendus)

#### Technique
- Stack : React 19 + TypeScript + Vite 7 + Electron 39
- API GitHub via @octokit/rest pour fetch dynamique
- Comparaison de versions avec semver
- IPC sécurisé avec contextBridge
- Context isolation pour la sécurité
- GitHub Actions pour releases automatiques

#### Documentation
- README.md complet avec instructions
- VERSIONING.md avec guide de versioning
- CHANGELOG.md pour suivi des versions

### Technical Details

- **Frontend** : React 19, TypeScript, Tailwind CSS
- **Desktop** : Electron 39, electron-builder 26, electron-updater
- **Build** : Vite 7
- **APIs** : @octokit/rest, axios, semver
- **CI/CD** : GitHub Actions

---

**Note** : Ceci est la première version de CEA AppStore. Toutes les fonctionnalités sont nouvelles.

[0.0.1]: https://github.com/Matthmusic/CEA-APPSTORE/releases/tag/v0.0.1
[0.0.9]: https://github.com/Matthmusic/CEA-APPSTORE/releases/tag/v0.0.9
[0.0.10]: https://github.com/Matthmusic/CEA-APPSTORE/releases/tag/v0.0.10
