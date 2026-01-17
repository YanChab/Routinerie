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

La base de données SQLite est stockée dans le dossier `instance/` qui est monté comme volume Docker. Les données persisteront même si vous recréez le conteneur.

## Mise à jour de l'application

```bash
git pull
docker compose up -d --build
```

## Configuration

Si vous avez besoin de modifier le port ou d'autres paramètres, éditez le fichier `docker-compose.yml`.

Pour changer le port (par exemple 8080) :
```yaml
ports:
  - "8080:5001"
```

## Sauvegarde de la base de données

```bash
# Créer une sauvegarde
docker compose exec web cp /app/instance/menus.db /app/instance/menus_backup_$(date +%Y%m%d).db

# Copier la sauvegarde sur le serveur hôte
docker cp routinerie_app:/app/instance/menus_backup_$(date +%Y%m%d).db ./
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
