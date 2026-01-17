# Spécifications - Routinerie

## Vue d'ensemble

### Objectif du projet
Routinerie est une plateforme modulaire conçue pour s'adapter aux besoins évolutifs de son utilisateur. L'objectif principal est de créer une application web flexible permettant d'ajouter des fonctionnalités au fur et à mesure des besoins.

La première fonctionnalité implémentée est un système de planification des menus hebdomadaires, permettant d'organiser les repas du midi et du soir pour chaque jour de la semaine (du lundi au vendredi).

### Public cible
Utilisateur unique (usage personnel) avec accès depuis différents appareils, notamment iPad.

## Fonctionnalités

### Fonctionnalités principales - Phase 1 : Planification de menus
- [ ] Tableau hebdomadaire avec grille midi/soir pour chaque jour (lundi à vendredi)
- [ ] Saisie et modification de menus dans chaque case du tableau
- [ ] Gestion d'une liste d'ingrédients
- [ ] Création et gestion de recettes basées sur les ingrédients
- [ ] Association des recettes aux menus du tableau

### Fonctionnalités secondaires
- [ ] Sauvegarde automatique des modifications
- [ ] Navigation entre différentes semaines
- [ ] Recherche de recettes
- [ ] Calcul automatique des ingrédients nécessaires pour la semaine

## Architecture technique

### Technologies utilisées
- Frontend: HTML/CSS, JavaScript (ou framework Python comme Flask templates/Jinja2)
- Backend: Python (Flask ou FastAPI)
- Base de données: SQLite (pour commencer) ou PostgreSQL
- Hébergement: Serveur personnel
- Autres: Responsive design pour compatibilité iPad

### Structure du projet
```
Routinerie/
├── app/
│   ├── __init__.py
│   ├── models.py          # Modèles de données (Menu, Recette, Ingrédient)
│   ├── routes.py          # Routes et endpoints de l'API
│   └── templates/         # Templates HTML
│       ├── base.html
│       ├── menu_planner.html
│       ├── recipes.html
│       └── ingredients.html
├── static/
│   ├── css/
│   ├── js/
│   └── img/
├── database.db            # Base de données SQLite
├── config.py              # Configuration de l'application
├── requirements.txt       # Dépendances Python
└── run.py                # Point d'entrée de l'application
```

## Modèles de données

### Menu
- id: Integer (clé primaire)
- jour: String (lundi, mardi, mercredi, jeudi, vendredi)
- moment: String (midi, soir)
- semaine: Date (date du lundi de la semaine)
- recette_id: Integer (clé étrangère vers Recette, nullable)
- description: Text (optionnel, si pas de recette associée)
- created_at: DateTime
- updated_at: DateTime

### Recette
- id: Integer (clé primaire)
- nom: String (nom de la recette)
- description: Text (instructions de préparation)
- temps_preparation: Integer (en minutes, optionnel)
- portions: Integer (nombre de portions)
- created_at: DateTime
- updated_at: DateTime

### Ingredient
- id: Integer (clé primaire)
- nom: String (nom de l'ingrédient)
- unite: String (kg, g, L, ml, pièce, etc.)
- created_at: DateTime

### RecetteIngredient (table de liaison)
- id: Integer (clé primaire)
- recette_id: Integer (clé étrangère vers Recette)
- ingredient_id: Integer (clé étrangère vers Ingredient)
- quantite: Float (quantité nécessaire)
- unite: String (unité spécifique pour cette recette)

## Interface utilisateur

### Pages principales
1. **Planificateur de menus** (page d'accueil)
   - Tableau hebdomadaire avec 5 jours (lundi à vendredi) × 2 moments (midi/soir)
   - Navigation entre semaines (précédent/suivant)
   - Boutons pour ajouter/modifier un menu dans chaque case

2. **Gestion des recettes**
   - Liste de toutes les recettes
   - Formulaire de création/édition de recette
   - Association des ingrédients avec quantités
   - Recherche et filtrage

3. **Gestion des ingrédients**
   - Liste de tous les ingrédients disponibles
   - Formulaire d'ajout/modification d'ingrédient
   - Gestion des unités de mesure

### Wireframes
Tableau planificateur (exemple):
```
|           | Lundi      | Mardi      | Mercredi   | Jeudi      | Vendredi   |
|-----------|------------|------------|------------|------------|------------|
| Midi      | [Menu]     | [Menu]     | [Menu]     | [Menu]     | [Menu]     |
| Soir      | [Menu]     | [Menu]     | [Menu]     | [Menu]     | [Menu]     |
```
Chaque case [Menu] est cliquable pour saisir/modifier le menu ou sélectionner une recette.

## Exigences non fonctionnelles

### Performance
- Temps de chargement < 2 secondes sur connexion locale
- Interface réactive et fluide sur iPad
- Sauvegarde automatique des modifications sans rechargement de page

### Sécurité
- Authentification utilisateur (même si utilisateur unique pour commencer)
- Accès HTTPS depuis l'extérieur du réseau local
- Protection CSRF pour les formulaires
- Validation des données côté serveur

### Accessibilité
- Interface responsive compatible tablette (iPad) et desktop
- Design adaptatif avec breakpoints pour différentes tailles d'écran
- Navigation tactile optimisée
- Contraste et lisibilité adaptés

## Planning

### Phase 1: Setup et structure de base
- [ ] Initialiser le projet Python (Flask/FastAPI)
- [ ] Configurer la base de données SQLite
- [ ] Créer les modèles de données
- [ ] Mettre en place la structure des dossiers
- [ ] Créer le template de base HTML/CSS

### Phase 2: Gestion des ingrédients
- [ ] Formulaire d'ajout d'ingrédients
- [ ] Liste des ingrédients
- [ ] Modification et suppression d'ingrédients

### Phase 3: Gestion des recettes
- [ ] Formulaire de création de recettes
- [ ] Association ingrédients-recettes avec quantités
- [ ] Liste et recherche de recettes
- [ ] Modification et suppression de recettes

### Phase 4: Planificateur de menus
- [ ] Créer le tableau hebdomadaire (5 jours × 2 moments)
- [ ] Saisie de menus dans les cases
- [ ] Association recettes aux menus
- [ ] Navigation entre semaines
- [ ] Sauvegarde automatique

### Phase 5: Déploiement
- [ ] Configuration du serveur
- [ ] Mise en place de l'authentification
- [ ] Configuration HTTPS
- [ ] Tests sur iPad
- [ ] Déploiement sur le serveur personnel

## Notes et remarques

### Évolutions futures possibles
- Export de la liste de courses hebdomadaire
- Gestion des favoris et rotations de menus
- Statistiques sur les recettes les plus utilisées
- Import/export de recettes
- Ajout d'autres modules (gestion de tâches, budgets, etc.)

### Considérations techniques
- L'architecture modulaire permettra d'ajouter facilement de nouvelles fonctionnalités
- La base de données peut être migrée vers PostgreSQL si nécessaire
- Prévoir une API REST pour faciliter de futures intégrations
