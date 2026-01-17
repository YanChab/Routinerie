#!/bin/bash

# Script de sauvegarde automatique de la base de données Routinerie
# Usage: ./backup.sh

set -e  # Arrêter en cas d'erreur

# Configuration
CONTAINER_NAME="routinerie_app"
BACKUP_DIR="./backups"
DB_PATH="/app/instance/database.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILENAME="database_backup_${TIMESTAMP}.db"

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Sauvegarde de la base de données Routinerie ===${NC}"

# Vérifier si le conteneur est en cours d'exécution
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}❌ Erreur: Le conteneur ${CONTAINER_NAME} n'est pas en cours d'exécution${NC}"
    echo "Lancez l'application avec: docker compose up -d"
    exit 1
fi

# Créer le dossier de sauvegarde s'il n'existe pas
mkdir -p "${BACKUP_DIR}"

echo -e "${YELLOW}📦 Création de la sauvegarde...${NC}"

# Créer une sauvegarde à l'intérieur du conteneur
docker compose exec -T web cp ${DB_PATH} /tmp/${BACKUP_FILENAME} 2>/dev/null || {
    echo -e "${RED}❌ Erreur lors de la création de la sauvegarde dans le conteneur${NC}"
    exit 1
}

# Copier la sauvegarde sur le serveur hôte
docker cp ${CONTAINER_NAME}:/tmp/${BACKUP_FILENAME} ${BACKUP_DIR}/${BACKUP_FILENAME} || {
    echo -e "${RED}❌ Erreur lors de la copie de la sauvegarde${NC}"
    exit 1
}

# Nettoyer le fichier temporaire dans le conteneur
docker compose exec -T web rm /tmp/${BACKUP_FILENAME} 2>/dev/null

# Vérifier que la sauvegarde existe et a une taille non nulle
if [ -f "${BACKUP_DIR}/${BACKUP_FILENAME}" ] && [ -s "${BACKUP_DIR}/${BACKUP_FILENAME}" ]; then
    FILE_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILENAME}" | cut -f1)
    echo -e "${GREEN}✅ Sauvegarde créée avec succès!${NC}"
    echo -e "   📁 Fichier: ${BACKUP_DIR}/${BACKUP_FILENAME}"
    echo -e "   📊 Taille: ${FILE_SIZE}"
else
    echo -e "${RED}❌ Erreur: La sauvegarde est vide ou n'existe pas${NC}"
    exit 1
fi

# Supprimer les sauvegardes de plus de 30 jours
echo -e "${YELLOW}🧹 Nettoyage des anciennes sauvegardes (> 30 jours)...${NC}"
find "${BACKUP_DIR}" -name "database_backup_*.db" -type f -mtime +30 -delete 2>/dev/null

# Compter le nombre de sauvegardes restantes
BACKUP_COUNT=$(find "${BACKUP_DIR}" -name "database_backup_*.db" -type f | wc -l)
echo -e "${GREEN}📚 Nombre total de sauvegardes: ${BACKUP_COUNT}${NC}"

echo -e "${GREEN}=== Sauvegarde terminée ===${NC}"
