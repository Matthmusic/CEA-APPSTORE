# Script PowerShell pour déployer INSTRUCTIONS-POUR-REPOS.md dans les repos d'apps

# Configuration
$baseDir = "C:\DEV"
$appStoreDir = "C:\DEV\CEA APPSTORE"
$instructionsFile = "$appStoreDir\INSTRUCTIONS-POUR-REPOS.md"

# Liste des repos à chercher (patterns de recherche)
$repoPatterns = @(
    "ListX",
    "To-DoX",
    "AUTONUM",
    "RENDEXPRESS",
    "TONTONKAD*"
)

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Déploiement des instructions CEA App Manifest" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifie que le fichier d'instructions existe
if (-not (Test-Path $instructionsFile)) {
    Write-Host "❌ Erreur: $instructionsFile n'existe pas" -ForegroundColor Red
    exit 1
}

# Trouve tous les dossiers dans C:\DEV
$allDirs = Get-ChildItem -Path $baseDir -Directory

$foundRepos = @()
$notFoundRepos = @()

foreach ($pattern in $repoPatterns) {
    Write-Host "🔍 Recherche de repos correspondant à: $pattern" -ForegroundColor Yellow

    $matches = $allDirs | Where-Object { $_.Name -like $pattern }

    if ($matches) {
        foreach ($match in $matches) {
            $foundRepos += $match
            Write-Host "  ✓ Trouvé: $($match.FullName)" -ForegroundColor Green
        }
    } else {
        $notFoundRepos += $pattern
        Write-Host "  ⚠ Non trouvé: $pattern" -ForegroundColor DarkYellow
    }
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Résumé de la recherche" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Repos trouvés: $($foundRepos.Count)" -ForegroundColor Green
Write-Host "Patterns non trouvés: $($notFoundRepos.Count)" -ForegroundColor Yellow
Write-Host ""

if ($foundRepos.Count -eq 0) {
    Write-Host "❌ Aucun repo trouvé. Arrêt du script." -ForegroundColor Red
    exit 0
}

# Demande confirmation
Write-Host "Les fichiers suivants seront copiés:" -ForegroundColor Cyan
foreach ($repo in $foundRepos) {
    Write-Host "  → $($repo.FullName)\INSTRUCTIONS-POUR-REPOS.md" -ForegroundColor White
}
Write-Host ""

$confirmation = Read-Host "Voulez-vous continuer? (O/N)"
if ($confirmation -ne "O" -and $confirmation -ne "o") {
    Write-Host "❌ Opération annulée" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Copie des fichiers" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$errorCount = 0

foreach ($repo in $foundRepos) {
    $destination = Join-Path $repo.FullName "INSTRUCTIONS-POUR-REPOS.md"

    try {
        Copy-Item -Path $instructionsFile -Destination $destination -Force
        Write-Host "✓ Copié dans: $($repo.Name)" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "❌ Erreur lors de la copie dans: $($repo.Name)" -ForegroundColor Red
        Write-Host "  Détails: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Rapport final" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "✓ Succès: $successCount" -ForegroundColor Green
Write-Host "❌ Erreurs: $errorCount" -ForegroundColor Red
Write-Host ""

if ($notFoundRepos.Count -gt 0) {
    Write-Host "⚠ Repos non trouvés dans C:\DEV:" -ForegroundColor Yellow
    foreach ($pattern in $notFoundRepos) {
        Write-Host "  - $pattern" -ForegroundColor DarkYellow
    }
    Write-Host ""
    Write-Host "💡 Si ces repos existent ailleurs, ajoutez-les manuellement:" -ForegroundColor Cyan
    Write-Host "   Copy-Item '$instructionsFile' -Destination 'C:\chemin\vers\repo\INSTRUCTIONS-POUR-REPOS.md'" -ForegroundColor White
}

Write-Host ""
Write-Host "✅ Terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Ouvrez chaque repo avec votre IA de code" -ForegroundColor White
Write-Host "2. Demandez-lui de créer le fichier cea-app.json" -ForegroundColor White
Write-Host "3. Committez et pushez les changements" -ForegroundColor White
Write-Host ""
