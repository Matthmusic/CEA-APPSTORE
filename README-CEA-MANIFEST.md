# 🎯 Système CEA App Manifest

## Vue d'ensemble

Le système CEA App Manifest permet à chaque application de définir ses propres métadonnées dans un fichier `cea-app.json` situé dans son repository GitHub. L'App Store récupère automatiquement ces informations.

---

## 📚 Documentation complète

### Pour comprendre le système
1. **[DEPLOYMENT-SUMMARY.md](DEPLOYMENT-SUMMARY.md)** - Vue d'ensemble et état du déploiement
2. **[CEA-APP-GUIDE.md](CEA-APP-GUIDE.md)** - Guide détaillé pour créer un manifest

### Pour déployer dans vos repos
3. **[INSTRUCTIONS-POUR-REPOS.md](INSTRUCTIONS-POUR-REPOS.md)** - Instructions à copier dans chaque repo
4. **[scripts/README.md](scripts/README.md)** - Comment utiliser les scripts de déploiement

### Exemples et templates
5. **[cea-app-template.json](cea-app-template.json)** - Template vide à remplir
6. **[examples/listx-cea-app.json](examples/listx-cea-app.json)** - Exemple complet pour ListX

---

## 🚀 Quick Start

### 1. Déployer les instructions dans vos repos

**PowerShell:**
```powershell
cd "C:\DEV\CEA APPSTORE\scripts"
.\deploy-instructions.ps1
```

**Bash:**
```bash
cd "/c/DEV/CEA APPSTORE/scripts"
./deploy-instructions.sh
```

### 2. Créer le cea-app.json pour chaque app

Pour chaque repo, donne ce prompt à ton IA :

```
Crée un fichier `cea-app.json` à la racine de ce repository en suivant
le template du fichier `INSTRUCTIONS-POUR-REPOS.md`.

Analyse le code pour déterminer :
- Le nom et l'ID de l'app
- Où elle s'installe (cherche dans electron-builder config)
- Le nom du fichier setup dans les releases
- Les chemins de détection Windows

Assure-toi que le JSON est valide et complet.
```

### 3. Vérifier et pousser

- Vérifie les chemins de détection
- Teste les URLs
- Commit et push

---

## 🎯 Avantages

### ✅ Avant (hardcodé dans l'App Store)
```typescript
const KNOWN_APPS = [
  {
    id: 'listx',
    name: 'ListX',
    description: 'App de listing...',
    // Infos hardcodées, difficiles à maintenir
  }
]
```

### ✨ Après (avec manifests)
```typescript
// L'App Store fetch automatiquement depuis GitHub
const manifest = await fetchCeaAppManifest('Matthmusic', 'ListX')
// Toutes les infos sont dans le repo de l'app
```

**Résultat :**
- ✅ Chaque app gère ses métadonnées
- ✅ Pas besoin de mettre à jour l'App Store
- ✅ Détection d'installation intelligente
- ✅ Versioning et changelog automatiques

---

## 📋 Structure du manifest

```json
{
  "app": {
    "id": "listx",
    "name": "ListX",
    "version": "1.0.0",
    "description": { ... }
  },
  "resources": {
    "logo": { "url": "..." },
    "icon": { "url": "..." }
  },
  "detection": {
    "windows": {
      "files": [ ... ],      // Fichiers .exe à vérifier
      "directories": [ ... ]  // Dossiers AppData
    },
    "priority": "files"
  },
  "metadata": {
    "category": "Productivité",
    "tags": [ ... ]
  },
  "installation": {
    "downloadUrl": "https://github.com/.../releases/latest/download/..."
  },
  "changelog": { ... }
}
```

---

## 🔍 Comment ça marche

### 1. Fetch automatique
```typescript
// L'App Store récupère le manifest depuis GitHub
const manifest = await fetchCeaAppManifest('Matthmusic', 'ListX')
```

### 2. Conversion en AppInfo
```typescript
// Le manifest est converti en format interne
const appInfo = manifestToAppInfo(manifest, owner, repo)
```

### 3. Détection d'installation
```typescript
// Vérifie si l'app est installée selon les règles du manifest
const result = await window.electronAPI.checkAppInstallation({
  priority: 'files',
  files: [{ path: 'C:\\Program Files\\ListX\\ListX.exe' }],
  directories: [{ path: '%APPDATA%\\ListX' }]
})
```

### 4. Affichage dans l'App Store
L'app s'affiche avec toutes ses infos récupérées depuis son propre repo !

---

## 📂 Fichiers créés dans ce projet

### Services
- `src/services/ceaAppService.ts` - Fetch et parse des manifests
- `src/services/detectionService.ts` - Détection d'installation
- `src/services/githubService.ts` - Intégration (modifié)

### Types
- `src/types/index.ts` - Interface `CeaAppManifest` (ajouté)

### Electron
- `electron/main.cjs` - Handler IPC `check-app-installation` (ajouté)
- `electron/preload.cjs` - API exposée (modifié)

### Documentation
- `CEA-APP-GUIDE.md` - Guide complet
- `INSTRUCTIONS-POUR-REPOS.md` - Instructions de déploiement
- `DEPLOYMENT-SUMMARY.md` - État du déploiement
- `README-CEA-MANIFEST.md` - Ce fichier

### Templates & Exemples
- `cea-app-template.json` - Template à remplir
- `examples/listx-cea-app.json` - Exemple ListX

### Scripts
- `scripts/deploy-instructions.ps1` - PowerShell
- `scripts/deploy-instructions.sh` - Bash
- `scripts/test-search.sh` - Test de recherche
- `scripts/README.md` - Doc des scripts

---

## 🧪 Testing

### Test de détection locale

```typescript
// Dans la console DevTools de l'App Store
const result = await window.electronAPI.checkAppInstallation({
  priority: 'files',
  files: [
    { path: 'C:\\Program Files\\ListX\\ListX.exe' }
  ],
  directories: [
    { path: process.env.APPDATA + '\\ListX' }
  ]
})

console.log(result)
// { isInstalled: true/false, detectedPath: '...', detectionMethod: 'file' }
```

### Test de fetch du manifest

```typescript
// Dans la console DevTools
import { fetchCeaAppManifestAuto } from './services/ceaAppService'

const manifest = await fetchCeaAppManifestAuto('Matthmusic', 'ListX')
console.log(manifest)
```

---

## 🎯 Roadmap

### Phase 1 : Déploiement (en cours)
- [x] Créer le système de manifests
- [x] Intégrer dans l'App Store
- [x] Créer la documentation
- [x] Créer les scripts de déploiement
- [ ] Déployer dans To-DoX
- [ ] Déployer dans TONTONKAD-v2
- [ ] Déployer dans ListX
- [ ] Déployer dans AUTONUM
- [ ] Déployer dans RENDEXPRESS

### Phase 2 : Améliorations
- [ ] Cache des manifests (éviter fetch à chaque démarrage)
- [ ] Validation stricte des manifests
- [ ] Support de plusieurs OS (Linux, macOS)
- [ ] Screenshots dans l'App Store
- [ ] Système de rating/reviews

### Phase 3 : Avancé
- [ ] Auto-update basé sur les manifests
- [ ] Dépendances entre apps
- [ ] Catégories avancées
- [ ] Recherche full-text

---

## 📞 Questions fréquentes

### Q : Où placer le fichier cea-app.json ?
**R :** À la racine du repository, au même niveau que package.json

### Q : Comment trouver les chemins de détection ?
**R :** Installe l'app et cherche où se trouve le .exe principal et les dossiers de données

### Q : Que faire si mon app n'a pas de release ?
**R :** Le manifest sera quand même lu, mais l'app apparaîtra sans version/download

### Q : Peut-on avoir plusieurs versions du manifest ?
**R :** Non, une seule version par branche (main ou master)

### Q : Comment tester avant de pousser ?
**R :** Utilise un validateur JSON et vérifie les URLs manuellement

---

## 🎉 Résultat

Avec ce système, ton App Store devient **dynamique** et **autonome** :
- Plus besoin de hardcoder les apps
- Chaque app se décrit elle-même
- Détection intelligente de l'installation
- Maintenance facilitée

**C'est un vrai App Store moderne !** 🚀
