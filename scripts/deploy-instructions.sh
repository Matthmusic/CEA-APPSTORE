#!/bin/bash

# Script Bash pour déployer INSTRUCTIONS-POUR-REPOS.md dans les repos d'apps

# Configuration
BASE_DIR="/c/DEV"
APP_STORE_DIR="/c/DEV/CEA APPSTORE"
INSTRUCTIONS_FILE="$APP_STORE_DIR/INSTRUCTIONS-POUR-REPOS.md"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Liste des repos à chercher (patterns de recherche)
REPO_PATTERNS=(
    "ListX"
    "To-DoX"
    "AUTONUM"
    "RENDEXPRESS"
    "TONTONKAD*"
)

echo -e "${CYAN}==========================================="
echo -e "Déploiement des instructions CEA App Manifest"
echo -e "===========================================${NC}"
echo ""

# Vérifie que le fichier d'instructions existe
if [ ! -f "$INSTRUCTIONS_FILE" ]; then
    echo -e "${RED}❌ Erreur: $INSTRUCTIONS_FILE n'existe pas${NC}"
    exit 1
fi

# Cherche les repos
FOUND_REPOS=()
NOT_FOUND_REPOS=()

for pattern in "${REPO_PATTERNS[@]}"; do
    echo -e "${YELLOW}🔍 Recherche de repos correspondant à: $pattern${NC}"

    # Cherche les dossiers correspondants
    matches=$(find "$BASE_DIR" -maxdepth 1 -type d -name "$pattern" 2>/dev/null)

    if [ -n "$matches" ]; then
        while IFS= read -r match; do
            FOUND_REPOS+=("$match")
            echo -e "${GREEN}  ✓ Trouvé: $match${NC}"
        done <<< "$matches"
    else
        NOT_FOUND_REPOS+=("$pattern")
        echo -e "${YELLOW}  ⚠ Non trouvé: $pattern${NC}"
    fi
done

echo ""
echo -e "${CYAN}==========================================="
echo -e "Résumé de la recherche"
echo -e "===========================================${NC}"
echo -e "${GREEN}Repos trouvés: ${#FOUND_REPOS[@]}${NC}"
echo -e "${YELLOW}Patterns non trouvés: ${#NOT_FOUND_REPOS[@]}${NC}"
echo ""

if [ ${#FOUND_REPOS[@]} -eq 0 ]; then
    echo -e "${RED}❌ Aucun repo trouvé. Arrêt du script.${NC}"
    exit 0
fi

# Affiche les fichiers qui seront copiés
echo -e "${CYAN}Les fichiers suivants seront copiés:${NC}"
for repo in "${FOUND_REPOS[@]}"; do
    echo -e "${WHITE}  → $repo/INSTRUCTIONS-POUR-REPOS.md${NC}"
done
echo ""

# Demande confirmation
read -p "Voulez-vous continuer? (O/N): " confirmation
if [ "$confirmation" != "O" ] && [ "$confirmation" != "o" ]; then
    echo -e "${YELLOW}❌ Opération annulée${NC}"
    exit 0
fi

echo ""
echo -e "${CYAN}==========================================="
echo -e "Copie des fichiers"
echo -e "===========================================${NC}"
echo ""

SUCCESS_COUNT=0
ERROR_COUNT=0

for repo in "${FOUND_REPOS[@]}"; do
    destination="$repo/INSTRUCTIONS-POUR-REPOS.md"
    repo_name=$(basename "$repo")

    if cp "$INSTRUCTIONS_FILE" "$destination" 2>/dev/null; then
        echo -e "${GREEN}✓ Copié dans: $repo_name${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}❌ Erreur lors de la copie dans: $repo_name${NC}"
        ((ERROR_COUNT++))
    fi
done

echo ""
echo -e "${CYAN}==========================================="
echo -e "Rapport final"
echo -e "===========================================${NC}"
echo -e "${GREEN}✓ Succès: $SUCCESS_COUNT${NC}"
echo -e "${RED}❌ Erreurs: $ERROR_COUNT${NC}"
echo ""

if [ ${#NOT_FOUND_REPOS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠ Repos non trouvés dans $BASE_DIR:${NC}"
    for pattern in "${NOT_FOUND_REPOS[@]}"; do
        echo -e "${YELLOW}  - $pattern${NC}"
    done
    echo ""
    echo -e "${CYAN}💡 Si ces repos existent ailleurs, ajoutez-les manuellement:${NC}"
    echo -e "${WHITE}   cp '$INSTRUCTIONS_FILE' '/chemin/vers/repo/INSTRUCTIONS-POUR-REPOS.md'${NC}"
fi

echo ""
echo -e "${GREEN}✅ Terminé!${NC}"
echo ""
echo -e "${CYAN}Prochaines étapes:${NC}"
echo -e "${WHITE}1. Ouvrez chaque repo avec votre IA de code${NC}"
echo -e "${WHITE}2. Demandez-lui de créer le fichier cea-app.json${NC}"
echo -e "${WHITE}3. Committez et pushez les changements${NC}"
echo ""
