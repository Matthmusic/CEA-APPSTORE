# 🚀 Quick Start - CEA AppStore

Guide rapide pour démarrer avec le développement de CEA AppStore.

## ⚡ Démarrage rapide

```bash
# 1. Installer les dépendances (déjà fait)
npm install

# 2. Lancer en mode développement
npm run electron:dev
```

L'application se lance avec :
- **Vite dev server** sur `http://localhost:5173`
- **Hot reload** activé pour React
- **DevTools** ouvertes automatiquement

## 📦 Build de production

```bash
# Build l'application complète
npm run electron:build
```

Le fichier `CEA AppStore-Setup-0.0.1.exe` sera créé dans le dossier `release/`.

## 🔧 Commandes disponibles

```bash
npm run dev              # Lancer Vite uniquement (pour tester l'UI)
npm run build            # Build React + TypeScript
npm run electron:dev     # Lancer l'app Electron en dev
npm run electron:build   # Build .exe de production
```

## 📁 Structure du projet

```
CEA-APPSTORE/
├── electron/
│   ├── main.cjs              # Process principal Electron
│   └── preload.cjs           # API sécurisée
├── src/
│   ├── components/
│   │   ├── AppCard.tsx       # Card pour chaque app
│   │   └── UpdateNotification.tsx  # Toast de MAJ
│   ├── context/
│   │   └── AppStoreContext.tsx     # State global
│   ├── pages/
│   │   └── CatalogPage.tsx   # Page principale
│   ├── services/
│   │   └── githubService.ts  # API GitHub
│   ├── types/
│   │   └── index.ts          # Types TypeScript
│   ├── App.tsx               # Composant racine
│   ├── main.tsx              # Entry point React
│   └── index.css             # Styles globaux
├── .github/workflows/
│   └── release.yml           # CI/CD GitHub Actions
├── package.json              # Dépendances + config
├── vite.config.ts            # Config Vite
├── tailwind.config.js        # Config Tailwind
└── tsconfig.json             # Config TypeScript
```

## 🎨 Personnalisation du thème

Le thème cyan (#38FAFF) est défini dans [tailwind.config.js](tailwind.config.js):

```javascript
colors: {
  primary: {
    DEFAULT: '#38FAFF',
    dark: '#2DD4D9',
    light: '#5FFBFF',
  }
}
```

Pour changer la couleur :
1. Modifier `tailwind.config.js`
2. L'app utilisera automatiquement la nouvelle couleur

## ➕ Ajouter une nouvelle app au catalogue

Éditez [src/services/githubService.ts](src/services/githubService.ts) :

```typescript
const KNOWN_APPS = [
  // Apps existantes...

  // Nouvelle app
  {
    id: 'mynewapp',              // ID unique (lowercase)
    repo: 'MyNewApp',            // Nom du repo GitHub
    name: 'My New App',          // Nom affiché
    category: 'Utilitaires',     // Catégorie
    description: 'Description'   // Description courte
  },
]
```

L'app apparaîtra automatiquement dans le catalogue !

## 🔄 Créer une release

```bash
# 1. Commiter vos changements
git add .
git commit -m "Add: nouvelle fonctionnalité"

# 2. Créer une version (choisir selon le type de changement)
npm version patch    # v0.0.1 → v0.0.2 (bug fix)
npm version minor    # v0.0.2 → v0.1.0 (feature)
npm version major    # v0.1.0 → v1.0.0 (breaking change)

# 3. Pousser avec les tags
git push origin main --tags
```

GitHub Actions build et publie automatiquement !

## 🐛 Debug

### DevTools

En mode dev, les DevTools s'ouvrent automatiquement. En production, elles sont désactivées pour la sécurité.

### Logs

Les logs apparaissent dans :
- **Console DevTools** : Logs du renderer process (React)
- **Terminal** : Logs du main process (Electron)

### Erreurs communes

**"Cannot find module electron"**
```bash
npm install
```

**"Port 5173 already in use"**
```bash
# Tuer le process qui utilise le port
npx kill-port 5173
```

**"electron-builder: command not found"**
```bash
npm install --save-dev electron-builder
```

## 📝 Workflow de développement typique

### Scénario 1 : Ajouter un nouveau composant

```bash
# 1. Créer le composant
touch src/components/MyComponent.tsx

# 2. Coder le composant (avec hot reload)
npm run electron:dev

# 3. Importer dans la page
# src/pages/CatalogPage.tsx
import MyComponent from '../components/MyComponent'

# 4. Tester et commit
git add .
git commit -m "Add: MyComponent"
```

### Scénario 2 : Modifier le style

```bash
# 1. Lancer en dev
npm run electron:dev

# 2. Modifier src/index.css ou composants
# Les changements s'appliquent automatiquement

# 3. Build et tester en production
npm run electron:build
```

### Scénario 3 : Ajouter une dépendance

```bash
# Installation
npm install ma-dependance

# Si dépendance de dev
npm install --save-dev ma-dependance-dev

# Redémarrer l'app
npm run electron:dev
```

## 🔒 Sécurité

L'app utilise les bonnes pratiques Electron :
- ✅ `contextIsolation: true`
- ✅ `nodeIntegration: false`
- ✅ API limitée via `preload.cjs`
- ✅ DevTools désactivées en production
- ✅ Pas d'eval() ou de code dynamique

## 🆘 Besoin d'aide ?

1. Lire la [documentation complète](README.md)
2. Consulter le [guide de versioning](VERSIONING.md)
3. Vérifier le [changelog](CHANGELOG.md)
4. Créer une issue sur GitHub

## 🎯 Prochaines étapes

Suggestions pour améliorer l'app :

- [ ] Ajouter une page de paramètres
- [ ] Permettre de désinstaller les apps depuis l'App Store
- [ ] Afficher les release notes dans une modal
- [ ] Ajouter des catégories personnalisées
- [ ] Statistiques d'utilisation (nombre d'installs, etc.)
- [ ] Mode light/dark toggle
- [ ] Notifications système pour les MAJ

---

**Bon développement ! 🚀**
