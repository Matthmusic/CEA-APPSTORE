# 🎨 Changelog - Mise à Jour Design Orange + Cards Carrées

## 📅 30 Décembre 2025 - v0.0.2 (en préparation)

### 🎨 Changements Visuels Majeurs

#### 1. Nouveau Thème Orange
**Avant** : Cyan (#38FAFF)
**Après** : Orange (#FF751F)

- ✅ Couleur primaire : `#FF751F` (Orange vif)
- ✅ Couleur dark : `#E65A00` (Orange foncé)
- ✅ Couleur light : `#FF8F4D` (Orange clair)
- ✅ Scrollbars customs orange
- ✅ Boutons et badges orange
- ✅ Hover effects adaptés

#### 2. Cards Carrées avec Logos
**Avant** : Cards rectangulaires avec info détaillée
**Après** : Cards carrées (aspect-square) centrées sur le logo

**Nouvelle structure des cards** :
```
┌─────────────┐
│ [✓]     [⟳]│ ← Status badges
│             │
│   [LOGO]    │ ← Logo de l'app (SVG)
│             │
│   ListX     │ ← Nom
│ Productivité│ ← Catégorie
│             │
│ Version     │
│   v1.3.17   │ ← Version orange
│             │
│ [Installer] │ ← Bouton orange
│  [GitHub]   │ ← Lien GitHub
└─────────────┘
```

**Caractéristiques** :
- ✅ Format carré (aspect-square)
- ✅ Logo SVG centré avec zoom au hover
- ✅ Gradient de couleur si pas de logo
- ✅ Initiale de l'app en fallback
- ✅ Badges status en coin haut-droit
- ✅ Actions poussées en bas (mt-auto)

#### 3. Grille Responsive Optimisée
**Avant** : `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
**Après** : `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6`

- Plus de cards visibles
- Espacement augmenté (gap-6)
- Meilleure utilisation de l'espace

---

### 🖼️ Logos des Applications

Tous les logos ont été récupérés depuis GitHub et intégrés :

| Application | Logo | Source | Format |
|-------------|------|--------|--------|
| **ListX** | ✅ | [GitHub](https://github.com/Matthmusic/ListX) | SVG (3.6 KB) |
| **To-DoX** | ✅ | [GitHub](https://github.com/Matthmusic/To-DoX) | SVG (7.4 KB) |
| **AUTONUM** | ⚠️ | [GitHub](https://github.com/Matthmusic/AUTONUM) | ICO (15 KB)* |
| **RENDEXPRESS** | ✅ | [GitHub](https://github.com/Matthmusic/RENDEXPRESS) | SVG (13 KB) |
| **TONTONKAD** | ✅ | [GitHub](https://github.com/Matthmusic/TONTONKAD) | SVG (14 KB) |

*Note : AUTONUM utilise un fichier .ico car pas de SVG disponible sur GitHub

**Emplacement** : `src/img/apps/`

---

### 📝 Descriptions Mises à Jour

Les descriptions ont été récupérées depuis les README officiels :

**AVANT** → **APRÈS**

**ListX**
- Avant : "Application de gestion de listes et exports (PDF, Excel)"
- Après : "Génération et gestion de listings de documents techniques avec exports PDF/Excel"

**To-DoX**
- Avant : "Gestionnaire de tâches et to-do lists"
- Après : "Application Kanban intelligente pour la gestion de tâches avec priorités et deadlines"

**AUTONUM**
- Avant : "Renommage automatique de fichiers"
- Après : "Renommage automatique de fichiers en masse avec numérotation séquentielle"

**RENDEXPRESS**
- Avant : "Générateur de rendus formatés"
- Après : "Générateur d'arborescence de dossiers avec exports HTML et texte pour emails"

**TONTONKAD**
- Avant : "Jeu de tir 2D" ❌
- Après : "Simulation et optimisation de fourreaux électriques multitubulaires" ✅
- Catégorie changée : Jeux → **Professionnel**

---

### 🆕 Nouvelle Application Ajoutée

**TONTONKAD** a été ajouté au catalogue :
- Catégorie : Professionnel
- Logo : SVG (14 KB)
- Description complète depuis README

**Total applications** : 4 → **5 apps**

---

### 🎨 Couleurs de Gradient (Fallback)

Si un logo n'est pas disponible, un gradient de couleur s'affiche :

| App | Gradient | Couleurs |
|-----|----------|----------|
| ListX | 🔵 Bleu | #3B82F6 → #1E40AF |
| To-DoX | 🟢 Vert | #10B981 → #059669 |
| AUTONUM | 🟣 Violet | #8B5CF6 → #6D28D9 |
| RENDEXPRESS | 🌸 Rose | #EC4899 → #BE185D |
| TONTONKAD | 🟠 Amber | #F59E0B → #D97706 |

---

### 🔧 Fichiers Modifiés

**Configuration** :
- ✅ `tailwind.config.js` - Couleur primaire → #FF751F
- ✅ `src/index.css` - Scrollbar color → #FF751F

**Services** :
- ✅ `src/services/githubService.ts` - Descriptions + TONTONKAD ajouté

**Composants** :
- ✅ `src/components/AppCard.tsx` - Refonte complète (carré, logo, layout)
- ✅ `src/pages/CatalogPage.tsx` - Grille responsive optimisée

**Utilitaires** :
- ✅ `src/utils/appLogos.ts` - Nouveau fichier (mapping logos + gradients)

**Assets** :
- ✅ `src/img/apps/listx.svg` - Logo ListX
- ✅ `src/img/apps/todox.svg` - Logo To-DoX
- ✅ `src/img/apps/autonum.ico` - Logo AUTONUM
- ✅ `src/img/apps/rendexpress.svg` - Logo RENDEXPRESS
- ✅ `src/img/apps/tontonkad.svg` - Logo TONTONKAD

---

### 📊 Statistiques

**Bundle Size** :
- CSS : 16.86 KB (avant : 15.29 KB) +1.57 KB
- JS : 340.62 KB (avant : 340.30 KB) +0.32 KB
- Total : **357.48 KB** (+1.89 KB)

**Performance** :
- Build time : ~1.8s (stable)
- Logo loading : Lazy (on error → gradient)
- Hover animations : GPU-accelerated

---

### ✨ Nouvelles Fonctionnalités

1. **Logos dynamiques** :
   - Chargement automatique depuis `src/img/apps/`
   - Fallback vers gradient si erreur
   - Effet zoom au hover (scale-105)

2. **Badges status améliorés** :
   - Position fixe coin haut-droit
   - Backdrop blur pour meilleure lisibilité
   - Shadow pour contraste

3. **Layout flexible** :
   - `mt-auto` pour pousser actions en bas
   - `aspect-square` pour format carré
   - `flex flex-col` pour organisation verticale

---

### 🚀 Prochaines Étapes

- [ ] Convertir `autonum.ico` en SVG pour cohérence
- [ ] Optimiser les SVG (SVGOMG)
- [ ] Ajouter animations de transition entre states
- [ ] Créer variantes de logos (dark/light mode)
- [ ] Ajouter tooltips avec description complète

---

### 📝 Notes de Migration

Si vous mettez à jour depuis v0.0.1 :

1. Le thème est maintenant **orange** au lieu de cyan
2. Les **cards sont carrées** (pas rectangulaires)
3. **5 apps** disponibles (TONTONKAD ajouté)
4. Les **descriptions sont plus détaillées**
5. Les **logos sont affichés** (si disponibles)

---

**Version** : v0.0.2 (en préparation)
**Date** : 30/12/2025
**Build** : ✅ Successful
**Breaking changes** : Non
