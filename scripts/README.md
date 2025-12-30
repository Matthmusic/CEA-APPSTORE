# Scripts de déploiement CEA App Manifest

Ce dossier contient des scripts pour automatiser le déploiement du fichier `INSTRUCTIONS-POUR-REPOS.md` dans tous vos repos d'applications.

## 📋 Scripts disponibles

### 1. PowerShell (Windows recommandé)
**Fichier:** `deploy-instructions.ps1`

```powershell
# Exécuter depuis ce dossier
.\deploy-instructions.ps1
```

### 2. Bash (Git Bash / WSL)
**Fichier:** `deploy-instructions.sh`

```bash
# Rendre le script exécutable (première fois uniquement)
chmod +x deploy-instructions.sh

# Exécuter
./deploy-instructions.sh
```

## 🎯 Ce que font les scripts

1. **Recherche** les repos dans `C:\DEV` correspondant aux patterns :
   - ListX
   - To-DoX
   - AUTONUM
   - RENDEXPRESS
   - TONTONKAD*

2. **Affiche** les repos trouvés et demande confirmation

3. **Copie** le fichier `INSTRUCTIONS-POUR-REPOS.md` dans chaque repo trouvé

4. **Génère** un rapport avec succès/erreurs

## ⚙️ Configuration

Si vos repos sont ailleurs que dans `C:\DEV`, modifiez la variable en haut du script :

**PowerShell:**
```powershell
$baseDir = "C:\DEV"  # ← Changez ici
```

**Bash:**
```bash
BASE_DIR="/c/DEV"  # ← Changez ici
```

## 📝 Après l'exécution

Une fois les fichiers copiés, pour chaque repo :

1. Ouvrez le repo avec votre IA de code
2. Utilisez ce prompt :

```
Crée un fichier `cea-app.json` à la racine de ce repository en suivant
le template du fichier `INSTRUCTIONS-POUR-REPOS.md`.

Remplis toutes les informations spécifiques à cette application :
- Trouve le nom de l'app et son ID
- Écris une description courte et longue pertinente
- Identifie où l'app s'installe (cherche dans le code de l'installeur
  ou electron-builder config)
- Trouve le nom exact du fichier setup dans les releases GitHub
- Mets à jour le changelog avec la version actuelle

Assure-toi que les chemins de détection sont corrects et que le JSON est valide.
```

3. Vérifiez le fichier `cea-app.json` généré
4. Committez et pushez

## 🔍 Troubleshooting

### Erreur "execution policy" (PowerShell)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Repo non trouvé
Si un repo existe mais n'est pas trouvé :
- Vérifiez le nom exact du dossier dans `C:\DEV`
- Ajoutez le pattern dans le script
- Ou copiez manuellement :
  ```powershell
  Copy-Item "C:\DEV\CEA APPSTORE\INSTRUCTIONS-POUR-REPOS.md" `
            -Destination "C:\chemin\vers\votre\repo\INSTRUCTIONS-POUR-REPOS.md"
  ```

## ✅ Vérification

Après exécution, vérifiez que chaque repo a bien reçu le fichier :

```bash
# Bash
ls -la "C:\DEV\To-DoX\INSTRUCTIONS-POUR-REPOS.md"
```

```powershell
# PowerShell
Test-Path "C:\DEV\To-DoX\INSTRUCTIONS-POUR-REPOS.md"
```
