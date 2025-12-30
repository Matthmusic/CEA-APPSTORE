#!/bin/bash

# Script de test pour voir quels repos seront trouvés

BASE_DIR="/c/DEV"

REPO_PATTERNS=(
    "ListX"
    "To-DoX"
    "AUTONUM"
    "RENDEXPRESS"
    "TONTONKAD*"
)

echo "=========================================="
echo "Test de recherche des repos"
echo "=========================================="
echo ""
echo "Recherche dans: $BASE_DIR"
echo ""

for pattern in "${REPO_PATTERNS[@]}"; do
    echo "🔍 Pattern: $pattern"

    matches=$(find "$BASE_DIR" -maxdepth 1 -type d -name "$pattern" 2>/dev/null)

    if [ -n "$matches" ]; then
        while IFS= read -r match; do
            echo "  ✓ $(basename "$match")"
        done <<< "$matches"
    else
        echo "  ✗ Aucun repo trouvé"
    fi
    echo ""
done

echo "=========================================="
echo "Tous les dossiers dans $BASE_DIR:"
echo "=========================================="
ls -1 "$BASE_DIR" | grep -v "^@"
