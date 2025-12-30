# 📷 Guide - Ajouter les Logos des Applications

## 🎨 Nouveau Design avec Cards Carrées

Les cards sont maintenant **carrées** avec un grand espace pour le logo de chaque app !

### Aperçu du Design

```
┌─────────────┐
│ [✓]     [⟳]│ ← Badges status (coin haut-droit)
│             │
│   [LOGO]    │ ← Logo carré de l'app
│             │
│   ListX     │ ← Nom de l'app
│ Productivité│ ← Catégorie
│             │
│ Version     │
│   v1.3.17   │ ← Version orange
│             │
│ [Installer] │ ← Bouton principal
│  [GitHub]   │ ← Lien GitHub
└─────────────┘
```

---

## 📁 Où Placer les Logos

### Dossier des Logos
```
src/img/apps/
├── listx.svg         ← Logo de ListX
├── todox.svg         ← Logo de To-DoX
├── autonum.svg       ← Logo de AUTONUM
├── rendexpress.svg   ← Logo de RENDEXPRESS
└── tontonkad.svg     ← Logo de TONTONKAD
```

### Format Recommandé
- **Format** : SVG (vectoriel, meilleure qualité)
- **Fallback** : PNG (si pas de SVG)
- **Dimensions** : Carré (ex: 512x512px, 256x256px)
- **Fond** : Transparent de préférence

---

## 🎨 Couleurs de Gradient (Fallback)

Si aucun logo n'est fourni, une carte avec gradient de couleur s'affiche avec l'initiale de l'app.

**Couleurs actuelles** (définies dans `src/utils/appLogos.ts`) :

| App | Gradient | Couleurs |
|-----|----------|----------|
| ListX | 🔵 Bleu | #3B82F6 → #1E40AF |
| To-DoX | 🟢 Vert | #10B981 → #059669 |
| AUTONUM | 🟣 Violet | #8B5CF6 → #6D28D9 |
| RENDEXPRESS | 🌸 Rose | #EC4899 → #BE185D |
| TONTONKAD | 🟠 Amber | #F59E0B → #D97706 |

---

## 🚀 Comment Ajouter un Logo

### Étape 1 : Préparer le Logo

1. Créer ou exporter le logo de ton app
2. Format : **SVG** (recommandé) ou PNG
3. Dimensions : **Carré** (ex: 512x512px)
4. Fond : **Transparent**

**Exemple avec AUTONUM :**
- Utilise le logo vert d'AUTONUM
- Exporte en `autonum.svg`

### Étape 2 : Placer le Fichier

Copie le fichier dans le dossier :
```bash
src/img/apps/autonum.svg
```

### Étape 3 : C'est Tout !

Le logo s'affichera automatiquement dans la card ! ✅

Le système détecte automatiquement si le fichier existe. Si le logo n'est pas trouvé, le gradient de couleur s'affiche.

---

## 🖼️ Exemples de Logos

### Bon Logo
```
✅ Format SVG
✅ Fond transparent
✅ Centré dans l'espace carré
✅ Pas de texte (juste l'icône)
✅ Couleurs vives et contrastées
```

### Logo à Éviter
```
❌ Format JPEG (fond blanc)
❌ Dimensions rectangulaires
❌ Trop de détails (illisible en petit)
❌ Texte intégré dans le logo
```

---

## 🎨 Personnaliser les Couleurs de Gradient

Si tu veux changer les couleurs de fallback, édite :

**Fichier** : `src/utils/appLogos.ts`

```typescript
export const APP_COLORS: Record<string, { from: string; to: string }> = {
  listx: { from: '#3B82F6', to: '#1E40AF' },       // Bleu
  todox: { from: '#10B981', to: '#059669' },       // Vert
  autonum: { from: '#8B5CF6', to: '#6D28D9' },     // Violet
  rendexpress: { from: '#EC4899', to: '#BE185D' }, // Rose
  tontonkad: { from: '#F59E0B', to: '#D97706' },   // Amber/Orange
}
```

Change les codes couleur selon tes préférences !

---

## 🔧 Ajouter une Nouvelle App avec Logo

### 1. Ajouter l'app au catalogue

**Fichier** : `src/services/githubService.ts`

```typescript
const KNOWN_APPS = [
  // ... apps existantes
  {
    id: 'myapp',
    repo: 'MyApp',
    name: 'My App',
    category: 'Utilitaires',
    description: 'Description de mon app'
  },
]
```

### 2. (Optionnel) Définir le chemin du logo

**Fichier** : `src/utils/appLogos.ts`

```typescript
export const APP_LOGOS: Record<string, string> = {
  // ... logos existants
  myapp: '/src/img/apps/myapp.svg',
}
```

### 3. Ajouter le logo

```bash
src/img/apps/myapp.svg
```

### 4. (Optionnel) Définir la couleur de gradient

```typescript
export const APP_COLORS: Record<string, { from: string; to: string }> = {
  // ... couleurs existantes
  myapp: { from: '#FF6B6B', to: '#C92A2A' }, // Rouge
}
```

---

## 🎯 Résumé Rapide

1. **Prépare ton logo** : SVG carré, fond transparent
2. **Place-le dans** : `src/img/apps/[appid].svg`
3. **Rebuild** : `npm run build`
4. **Teste** : `npm run electron:dev`

C'est tout ! Le logo apparaîtra automatiquement dans la card 🚀

---

## 🖌️ Outils Recommandés

### Pour Créer/Éditer des Logos
- **Figma** (en ligne, gratuit)
- **Inkscape** (logiciel gratuit)
- **Adobe Illustrator** (payant)

### Pour Convertir en SVG
- **Convertio** : https://convertio.co/fr/png-svg/
- **CloudConvert** : https://cloudconvert.com/png-to-svg

### Pour Optimiser les SVG
- **SVGOMG** : https://jakearchibald.github.io/svgomg/

---

## 📊 État Actuel

| App | Logo Ajouté | Gradient Défini |
|-----|-------------|-----------------|
| ListX | ⏳ À ajouter | ✅ Bleu |
| To-DoX | ⏳ À ajouter | ✅ Vert |
| AUTONUM | ⏳ À ajouter | ✅ Violet |
| RENDEXPRESS | ⏳ À ajouter | ✅ Rose |
| TONTONKAD | ⏳ À ajouter | ✅ Amber |

Une fois que tu ajoutes les logos SVG, ils remplaceront automatiquement les gradients ! 🎨

---

**Créé le** : 30/12/2025
**Thème actuel** : Orange (#FF751F)
