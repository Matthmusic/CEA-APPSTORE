# Guide CEA-APP.json

Ce document explique comment créer et maintenir le fichier `cea-app.json` pour intégrer votre application dans le CEA App Store.

## 📋 Vue d'ensemble

Le fichier `cea-app.json` est un **manifeste standardisé** que chaque application doit inclure dans son repository GitHub. Il permet au CEA App Store de récupérer automatiquement toutes les informations nécessaires sur votre application.

## 🎯 Emplacement

Placez le fichier `cea-app.json` **à la racine de votre repository** :

```
mon-app/
├── cea-app.json          ← ICI
├── src/
├── assets/
└── README.md
```

## 📦 Structure du fichier

### 1. **Informations de base** (`app`)

```json
"app": {
  "id": "unique-app-id",           // ID unique (kebab-case recommandé)
  "name": "Nom de l'Application",   // Nom affiché dans l'App Store
  "version": "1.0.0",               // Version actuelle (Semantic Versioning)
  "description": {
    "short": "Description courte",  // Max 100 caractères
    "long": "Description détaillée" // Texte complet
  }
}
```

### 2. **Ressources visuelles** (`resources`)

```json
"resources": {
  "logo": {
    "path": "assets/logo.png",     // Chemin relatif dans le repo
    "url": "https://raw.githubusercontent.com/..."  // URL directe
  },
  "screenshots": [
    {
      "path": "assets/screenshots/screenshot1.png",
      "url": "https://raw.githubusercontent.com/...",
      "caption": "Description"
    }
  ]
}
```

**Recommandations :**
- Logo : 512x512px, format PNG avec transparence
- Screenshots : 1920x1080px ou ratio 16:9

### 3. **Détection d'installation** (`detection`)

Cette section est **cruciale** pour que l'App Store détecte si votre app est installée sur le PC de l'utilisateur.

```json
"detection": {
  "windows": {
    "files": [
      {
        "path": "C:\\Program Files\\MonApp\\app.exe",
        "description": "Fichier exécutable principal"
      }
    ],
    "directories": [
      {
        "path": "%APPDATA%\\MonApp",
        "description": "Dossier de configuration"
      }
    ]
  },
  "priority": "files"  // "files" | "directories" | "registry"
}
```

**Variables d'environnement supportées :**
- `%APPDATA%` → `C:\Users\Username\AppData\Roaming`
- `%LOCALAPPDATA%` → `C:\Users\Username\AppData\Local`
- `%PROGRAMFILES%` → `C:\Program Files`
- `%PROGRAMFILES(X86)%` → `C:\Program Files (x86)`

### 4. **Métadonnées** (`metadata`)

```json
"metadata": {
  "author": {
    "name": "Votre Nom",
    "email": "email@example.com"
  },
  "category": "development",  // Voir catégories disponibles ci-dessous
  "tags": ["productivity", "tools"],
  "repository": {
    "type": "github",
    "url": "https://github.com/username/repo",
    "branch": "main"
  },
  "license": "MIT"
}
```

**Catégories disponibles :**
- `development` - Outils de développement
- `productivity` - Productivité
- `utilities` - Utilitaires
- `creative` - Création
- `communication` - Communication
- `games` - Jeux

### 5. **Installation** (`installation`)

```json
"installation": {
  "type": "installer",  // "installer" | "portable" | "script"
  "downloadUrl": "https://github.com/username/repo/releases/latest/download/setup.exe",
  "installCommand": "setup.exe /SILENT",
  "uninstallCommand": "uninstall.exe /SILENT"
}
```

### 6. **Changelog** (`changelog`)

```json
"changelog": {
  "1.0.0": {
    "date": "2025-12-30",
    "changes": [
      "Initial release",
      "Feature 1"
    ]
  },
  "1.0.1": {
    "date": "2025-12-31",
    "changes": [
      "Bug fix"
    ]
  }
}
```

## 🔄 Workflow recommandé

1. **Création initiale** : Copiez `cea-app-template.json` et remplissez-le
2. **Commit** : Ajoutez le fichier à votre repo
3. **Mise à jour** : Modifiez le fichier à chaque release
4. **Automatisation** : Utilisez un script pour mettre à jour automatiquement la version et le changelog

## ✅ Validation

Avant de commit, vérifiez que :
- [ ] Le fichier est un JSON valide
- [ ] L'ID est unique
- [ ] La version suit le Semantic Versioning (X.Y.Z)
- [ ] Les URLs des ressources sont accessibles
- [ ] Les chemins de détection sont corrects
- [ ] Le changelog est à jour

## 🚀 Exemple complet

Voir [cea-app-template.json](cea-app-template.json) pour un exemple complet et annoté.

## 📞 Support

Pour toute question sur l'intégration, consultez la documentation du CEA App Store ou contactez l'équipe de développement.
