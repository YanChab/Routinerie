# Routinerie - Déploiement avec Docker

## Prérequis
- Docker et Docker Compose V2 installés sur votre serveur

### Vérifier votre version de Docker Compose
```bash
docker compose version
```

### Si vous avez une erreur "distutils" avec docker-compose
Votre version de docker-compose est obsolète. Installez Docker Compose V2 :

```bash
# Supprimer l'ancienne version
sudo apt-get remove docker-compose

# Installer Docker Compose V2 (plugin Docker)
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Vérifier l'installation
docker compose version
```

**Note importante** : Utilisez `docker compose` (avec un espace) au lieu de `docker-compose` (avec un tiret).

## Déploiement

### 1. Cloner le projet sur votre serveur
```bash
git clone https://github.com/YanChab/Routinerie.git
cd Routinerie
git checkout Docker
```

### 2. Construire et lancer l'application
```bash
docker compose up -d --build
```

### 3. Vérifier que l'application fonctionne
```bash
docker compose ps
docker compose logs -f
```

L'application sera accessible sur `http://votre-serveur:5001`

## Commandes utiles

### Arrêter l'application
```bash
docker compose down
```

### Redémarrer l'application
```bash
docker compose restart
```

### Voir les logs
```bash
docker compose logs -f
```

### Reconstruire l'image après modifications
```bash
docker compose up -d --build
```

### Accéder au shell du conteneur
```bash
docker compose exec web bash
```

## Persistance des données

⚠️ **IMPORTANT** : La base de données SQLite est stockée dans le dossier `instance/` qui est monté comme volume Docker. Les données persisteront même si vous recréez le conteneur.

### ✅ Commande sûre
```bash
docker compose down  # Sans le flag -v
```

### ❌ Commande DANGEREUSE (à NE JAMAIS utiliser)
```bash
docker compose down -v  # Le flag -v SUPPRIME les volumes et vos données !
```

## Sauvegarde automatique de la base de données

### Script de sauvegarde

Un script de sauvegarde automatique `backup.sh` est fourni. Il :
- Crée une sauvegarde horodatée de la base de données
- La stocke dans le dossier `backups/`
- Supprime automatiquement les sauvegardes de plus de 30 jours
- Affiche un rapport détaillé

**Utilisation** :
```bash
./backup.sh
```

### Sauvegarde manuelle

Si vous préférez faire une sauvegarde manuelle :
```bash
# Créer le dossier de sauvegarde
mkdir -p backups

# Créer une sauvegarde
docker compose exec -T web cp /app/instance/database.db /tmp/backup_$(date +%Y%m%d_%H%M%S).db

# Copier sur le serveur hôte
docker cp routinerie_app:/tmp/backup_$(date +%Y%m%d_%H%M%S).db ./backups/
```

### Automatiser les sauvegardes avec cron

Pour sauvegarder automatiquement tous les jours à 2h du matin :

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne (ajustez le chemin)
0 2 * * * cd /chemin/vers/Routinerie && ./backup.sh >> ./backups/backup.log 2>&1
```

## Mise à jour de l'application

### ✅ Procédure recommandée (avec sauvegarde)

```bash
# 1. Créer une sauvegarde avant la mise à jour
./backup.sh

# 2. Récupérer les dernières modifications
git pull

# 3. Reconstruire et relancer l'application
docker compose up -d --build

# 4. Vérifier les logs
docker compose logs -f
```

### Restaurer une sauvegarde en cas de problème

```bash
# Arrêter l'application
docker compose down

# Restaurer la sauvegarde (remplacer DATE par la date de votre sauvegarde)
cp ./backups/database_backup_DATE.db ./instance/database.db

# Relancer l'application
docker compose up -d
```

## Sauvegarde de la base de données (ancienne méthode)

```bash
# Créer une sauvegarde (méthode manuelle alternative)
docker compose exec web cp /app/instance/database.db /app/instance/database_backup_$(date +%Y%m%d).db

# Copier la sauvegarde sur le serveur hôte
docker cp routinerie_app:/app/instance/database_backup_$(date +%Y%m%d).db ./
```

## Configuration

Si vous avez besoin de modifier le port ou d'autres paramètres, éditez le fichier `docker-compose.yml`.

Pour changer le port (par exemple 8080) :
```yaml
ports:
  - "8080:5001"
```

## Dépannage

### L'application ne démarre pas
```bash
docker compose logs web
```

### Réinitialiser complètement
```bash
docker compose down -v
docker compose up -d --build
```

### Problèmes de permissions sur le dossier instance
```bash
chmod -R 755 instance/
```
