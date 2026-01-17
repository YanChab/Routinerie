# Routinerie - Déploiement avec Docker

## À propos de Routinerie

Routinerie est une application web de planification de menus avec analyse nutritionnelle. Elle permet de :
- Créer et gérer des recettes avec ingrédients
- Planifier des menus hebdomadaires
- Analyser l'équilibre nutritionnel des repas (Phase 1)
  - Classification automatique par groupes alimentaires (Protéines, Légumes, Féculents)
  - Badges visuels avec code couleur (vert/jaune/rouge)
  - Tooltips détaillant les catégories présentes et manquantes

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
Architecture de persistence

L'application utilise un système de persistence en trois couches :

1. **Volume Docker** : `./instance:/app/instance` monte le dossier local `instance/` dans le conteneur
2. **Base de données** : Stockée à `/app/instance/database.db` dans le conteneur
3. **Configuration** : `config.py` pointe explicitement vers `instance/database.db`

### ✅ Trois corrections critiques appliquées

Pour garantir la persistence des données, trois modifications ont été effectuées :

1. **.dockerignore** : Ajout de `instance/`, `*.db`, `*.db-journal`
   - Empêche la copie d'un dossier `instance/` vide dans l'image Docker
   - Permet au volume Docker de prendre le contrôle total du dossier

2. **Dockerfile** : Suppression de `RUN mkdir -p instance`
   - Évite la création d'un dossier vide dans l'image
   - Laisse le volume Docker gérer la création du dossier

3. **config.py** : Chemin de base de données corrigé
   - Anciennement : `basedir/database.db`
   - Maintenant : `basedir/instance/database.db`
   - Garantit que la base est créée dans le volume monté

### ✅ Commande sûre
```bash
docker compose down  # Sans le flag -v
docker compose up -d --build  # Les données persistent
```

### ❌ Commande DANGEREUSE (à NE JAMAIS utiliser)
```bash
docker compose down -v  # Le flag -v SUPPRIME les volumes et vos données !
```

### Vérifier la persistence après un rebuild

```bash
# Compter les données AVANT rebuild
echo "AVANT rebuild - Ingrédients: $(docker compose exec -T web python -c 'from app import create_app, db; from app.models import Ingredient; app = create_app(); app.app_context().push(); print(Ingredient.query.count())')"

# Rebuild complet
docker compose down
docker compose up -d --build

# Compter les données APRÈS rebuild (devrait être identique)
echo "APRÈS rebuild - Ingrédients: $(docker compose exec -T web python -c 'from app import create_app, db; from app.models import Ingredient; app = create_app(); app.app_context().push(); print(Ingredient.query.count())')"
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
./bacArrêter l'application
docker compose down

# 4. Reconstruire et relancer l'application
docker compose up -d --build

# 5. Vérifier les logs
docker compose logs -f

# 6. Vérifier que les données ont persisté
docker compose exec web ls -lh /app/instance/
```

**Note** : Grâce aux corrections de persistence, vos données (recettes, ingrédients, menus) seront conservées même après un rebuild complet.vous préférez faire une sauvegarde manuelle :
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

# 2. Récupérer les dernières modifications de la branche Docker
git pull origin Docker
La base de données n'est pas dans instance/
Si après un rebuild vous constatez que la base est à `/app/database.db` au lieu de `/app/instance/database.db` :

```bash
# Vérifier les trois corrections critiques :

# 1. Vérifier .dockerignore
grep "instance/" .dockerignore  # Doit afficher "instance/"

# 2. Vérifier Dockerfile
grep "mkdir -p instance" Dockerfile  # Ne doit RIEN afficher

# 3. Vérifier config.py
grep "instance/database.db" config.py  # Doit afficher le chemin correct
```

### Les badges d'équilibre nutritionnel ne s'affichent pas
```bash
# Vérifier que equilibre.js est chargé
docker compose logs web | grep equilibre

# Vérifier la console du navigateur (F12)
# Les endpoints doivent répondre : /api/menus/equilibre
```

### Réinitialiser complètement (⚠️ SUPPRIME LES DONNÉES)
```bash
# Créer une sauvegarde d'abord !
./backup.sh

# Puis réinitialiser
docker compose down -v
docker compose up -d --build
```

### Problèmes de permissions sur le dossier instance
```bash
chmod -R 755 instance/
```

### Restaurer après une suppression accidentelle
```bash
# Arrêter l'application
docker compose down

# Restaurer la dernière sauvegarde
ls -lt backups/ | head -2  # Voir la dernière sauvegarde
cp backups/database_backup_YYYYMMDD_HHMMSS.db instance/database.db

# Relancer
docker compose up -d
```

## Historique des corrections critiques

### 17 janvier 2025 - Correction de la persistence des données

Trois corrections successives ont été nécessaires pour garantir la persistence complète :

1. **Commit 5c3408c** : Ajout de `instance/` à `.dockerignore`
2. **Commit e8f5b4a** : Suppression de `RUN mkdir -p instance` dans Dockerfile
3. **Commit 91acd01** : Correction du chemin de base de données dans `config.py`

Ces corrections garantissent que :
- Le volume Docker contrôle entièrement le dossier `instance/`
- La base de données est toujours créée au bon endroit
- Les données persistent lors des rebuilds (`docker compose up -d --build`)
- Aucune donnée n'est perdue lors des mises à jour

### Tests de validation

Test effectué avec succès :
```
AVANT rebuild - Ingrédients: 2, Recettes: 1
[Rebuild complet avec docker compose down && up -d --build]
APRÈS rebuild - Ingrédients: 2, Recettes: 1
✅ Données conservéesegarde en cas de problème

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
