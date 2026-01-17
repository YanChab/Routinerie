# Spécifications - Routinerie

## Vue d'ensemble

### Objectif du projet
Routinerie est une application web de planification de menus hebdomadaires, conçue pour une utilisation personnelle avec une interface simplifiée et intuitive. L'application permet d'organiser les repas du midi et du soir pour chaque jour de la semaine (du lundi au vendredi).

### Public cible
Utilisateur unique (usage personnel) avec accès depuis différents appareils, notamment iPad.

## Fonctionnalités implémentées

### Planification de menus
- ✅ Tableau hebdomadaire avec grille midi/soir pour chaque jour (lundi à vendredi)
- ✅ Navigation entre semaines intégrée dans le tableau (format "Sem X")
- ✅ Affichage des dates sous chaque jour
- ✅ Sélection de recettes depuis une liste déroulante
- ✅ Création de recettes directement depuis le planificateur
- ✅ Modification de recettes directement depuis le planificateur
- ✅ Drag & drop pour déplacer/échanger des menus entre les cases
- ✅ Suppression de menus

### Gestion des recettes
- ✅ Création de recettes avec nom et instructions
- ✅ Association d'ingrédients aux recettes (sans quantité)
- ✅ Liste de toutes les recettes
- ✅ Vue détaillée d'une recette
- ✅ Recherche de recettes
- ✅ Modification de recettes
- ✅ Suppression de recettes

### Gestion des ingrédients
- ✅ Création d'ingrédients avec nom, unité et catégorie
- ✅ 11 catégories d'ingrédients (Légumes, Fruits, Viandes, Poissons, Produits laitiers, Céréales & Féculents, Épices & Condiments, Huiles & Matières grasses, Sucres & Produits sucrés, Boissons, Autre)
- ✅ Liste de tous les ingrédients
- ✅ Modification d'ingrédients
- ✅ Suppression d'ingrédients

### Interface utilisateur
- ✅ Design simplifié sans header séparé pour le planificateur
- ✅ Navigation intégrée dans le coin du tableau
- ✅ Boutons icônes circulaires pour les actions (✔ vert, 🗑 rouge, ✏️ bleu, + gris)
- ✅ Modals pour la création et modification de recettes
- ✅ Notifications pour les actions (succès/erreur)
- ✅ Interface responsive optimisée pour iPad

## Architecture technique

### Technologies utilisées
- **Frontend**: HTML5/CSS3, JavaScript vanilla
- **Backend**: Python 3.9.6 avec Flask 3.0.0
- **Base de données**: SQLite avec Flask-SQLAlchemy 3.1.1
- **Serveur**: Développement sur 0.0.0.0:5001
- **Accès réseau**: Local (127.0.0.1:5001) et iPad (192.168.1.90:5001)
- **Environnement**: Virtual environment Python (.venv)
- **Autres**: python-dotenv 1.0.0, reportlab 4.0.7, Pillow 10.1.0

### Structure du projet
```
Routinerie/
├── app/
│   ├── __init__.py              # Factory Flask
│   ├── models.py                # Modèles SQLAlchemy (Menu, Recette, Ingredient, RecetteIngredient)
│   ├── routes.py                # Blueprint avec API REST et vues
│   └── templates/               # Templates Jinja2
│       ├── base.html            # Template de base avec navigation
│       ├── menu_planner.html    # Planificateur de menus avec modals
│       ├── recipes.html         # Liste des recettes
│       ├── recipe_detail.html   # Détail d'une recette
│       └── ingredients.html     # Gestion des ingrédients
├── static/
│   ├── css/
│   │   └── style.css           # Styles complets avec boutons icônes
│   └── js/
│       ├── main.js             # Fonctions utilitaires (showModal, hideModal, apiRequest, showNotification)
│       ├── planner.js          # Logique du planificateur (drag-drop, modals recettes)
│       ├── recipes.js          # Gestion des recettes
│       └── ingredients.js      # Gestion des ingrédients
├── instance/
│   └── database.db             # Base de données SQLite
├── .venv/                      # Environnement virtuel Python
├── config.py                   # Configuration Flask
├── requirements.txt            # Dépendances Python
├── run.py                      # Point d'entrée (port 5001)
└── specificatio.md             # Ce fichier
```

## Modèles de données

### Menu
- **id**: Integer (clé primaire)
- **jour**: String (lundi, mardi, mercredi, jeudi, vendredi)
- **moment**: String (midi, soir)
- **semaine**: Date (date du lundi de la semaine)
- **recette_id**: Integer (clé étrangère vers Recette, nullable)
- **description**: Text (nullable, non utilisé dans l'interface actuelle)
- **created_at**: DateTime
- **updated_at**: DateTime

### Recette
- **id**: Integer (clé primaire)
- **nom**: String(200) (nom de la recette)
- **description**: Text (instructions de préparation)
- **temps_preparation**: Integer (en minutes, non utilisé dans l'interface actuelle)
- **portions**: Integer (nombre de portions, non utilisé dans l'interface actuelle)
- **created_at**: DateTime
- **updated_at**: DateTime

### Ingredient
- **id**: Integer (clé primaire)
- **nom**: String(100) (nom de l'ingrédient)
- **unite**: String(20) (kg, g, L, ml, pièce, etc.)
- **categorie**: String(50) (catégorie parmi 11 types prédéfinis, défaut: 'Autre')
- Catégories disponibles: Légumes, Fruits, Viandes, Poissons, Produits laitiers, Céréales & Féculents, Épices & Condiments, Huiles & Matières grasses, Sucres & Produits sucrés, Boissons, Autre

### RecetteIngredient (table de liaison)
- **id**: Integer (clé primaire)
- **recette_id**: Integer (clé étrangère vers Recette)
- **ingredient_id**: Integer (clé étrangère vers Ingredient)
- **quantite**: Float (quantité nécessaire, non utilisée dans l'interface actuelle)
- **unite**: String(20) (unité spécifique, non utilisée dans l'interface actuelle)

Note: Les quantités et unités dans RecetteIngredient ne sont pas utilisées dans l'interface actuelle qui se concentre uniquement sur la liste des ingrédients nécessaires.

## Interface utilisateur

### Pages principales
1. **Planificateur de menus** (page d'accueil - /)
   - Tableau hebdomadaire avec 5 jours (lundi à vendredi) × 2 moments (midi/soir)
   - Navigation entre semaines dans le coin supérieur gauche du tableau
   - Format "Sem X" avec boutons rectangulaires ◀ ▶
   - Dates affichées sous chaque jour (format DD/MM)
   - Clic sur une case pour ouvrir le modal de menu
   - Drag & drop pour déplacer/échanger les menus
   - Modal de menu avec:
     - Boutons ✔ (enregistrer) et 🗑 (supprimer) en haut à gauche
     - Liste déroulante de recettes
     - Boutons + (créer recette) et ✏️ (modifier recette) en bas à droite
   - Modal de création de recette avec:
     - Nom de la recette
     - Instructions (textarea)
     - Liste d'ingrédients (sélection sans quantité)
     - Auto-sélection et auto-soumission après création
   - Modal de modification de recette similaire

2. **Gestion des recettes** (/recettes)
   - Liste de toutes les recettes avec recherche
   - Bouton d'ajout de nouvelle recette
   - Actions : voir détail, modifier, supprimer

3. **Détail d'une recette** (/recette/<id>)
   - Nom et description de la recette
   - Liste des ingrédients associés

4. **Gestion des ingrédients** (/ingredients)
   - Liste de tous les ingrédients avec catégories
   - Formulaire d'ajout/modification d'ingrédient
   - Catégorie sélectionnable parmi 11 options
   - Actions : modifier, supprimer

### Composants UI
- **Boutons icônes circulaires** (40px):
  - ✔ Vert (#27ae60) : enregistrer/valider
  - 🗑 Rouge (#e74c3c) : supprimer
  - ✏️ Bleu (#3498db) : modifier
  - + Gris (#95a5a6) : créer/ajouter
- **Modals**: Overlay avec fond semi-transparent, contenu centré
- **Notifications**: Messages de succès/erreur en haut de l'écran
- **Drag & drop**: Feedback visuel avec opacité et bordure en pointillés

### Navigation
Navigation principale dans le header (fond #2c3e50):
- Routinerie (logo)
- Planificateur
- Recettes
- Ingrédients

## API REST

### Endpoints implémentés

#### Menus
- **GET /** - Affiche le planificateur avec paramètre `week` optionnel
- **POST /api/menu** - Crée ou met à jour un menu (requiert recette_id)
- **DELETE /api/menu/<id>** - Supprime un menu
- **PUT /api/menu/<id>/move** - Déplace/échange un menu (drag & drop)

#### Recettes
- **GET /recettes** - Liste toutes les recettes
- **GET /recette/<id>** - Affiche le détail d'une recette
- **GET /api/recette/<id>** - Récupère une recette en JSON (avec ingrédients)
- **POST /api/recette** - Crée une nouvelle recette (avec ingrédients optionnels)
- **PUT /api/recette/<id>** - Met à jour une recette (avec ingrédients optionnels)
- **DELETE /api/recette/<id>** - Supprime une recette

#### Ingrédients
- **GET /ingredients** - Liste tous les ingrédients
- **POST /api/ingredient** - Crée un nouvel ingrédient
- **PUT /api/ingredient/<id>** - Met à jour un ingrédient
- **DELETE /api/ingredient/<id>** - Supprime un ingrédient

### Validation serveur
- Nom de recette: requis, max 200 caractères
- Nom d'ingrédient: requis, max 100 caractères
- Temps de préparation: 0-1440 minutes (si fourni)
- Portions: 1-100 (si fourni)
- Menu: requiert recette_id (description optionnelle non utilisée)

## Exigences non fonctionnelles

### Performance
- ✅ Temps de chargement instantané sur connexion locale
- ✅ Interface réactive et fluide sur iPad
- ✅ Sauvegarde avec rechargement de page après création/modification
- ✅ Auto-reload du serveur Flask en mode debug

### Sécurité
- ⚠️ Pas d'authentification (utilisation locale personnelle)
- ⚠️ HTTP uniquement (connexion locale)
- ✅ Validation des données côté serveur
- ✅ Protection contre les injections SQL via SQLAlchemy ORM

### Accessibilité
- ✅ Interface responsive compatible iPad et desktop
- ✅ Design adaptatif avec breakpoints
- ✅ Navigation tactile optimisée (drag & drop, boutons icônes)
- ✅ Contraste et lisibilité adaptés
- ✅ Boutons suffisamment grands (40px) pour utilisation tactile

## Historique du développement

### Phase 1: Setup et structure de base ✅
- ✅ Initialisation du projet Flask
- ✅ Configuration de la base de données SQLite
- ✅ Création des modèles de données (Menu, Recette, Ingredient, RecetteIngredient)
- ✅ Mise en place de la structure des dossiers
- ✅ Template de base HTML/CSS avec navigation

### Phase 2: Gestion des ingrédients ✅
- ✅ Formulaire d'ajout d'ingrédients avec catégorie
- ✅ Liste des ingrédients
- ✅ Modification et suppression d'ingrédients
- ✅ Migration vers système de catégories (11 types)

### Phase 3: Gestion des recettes ✅
- ✅ Formulaire de création de recettes (simplifié: nom + instructions)
- ✅ Association ingrédients-recettes (sans quantité)
- ✅ Liste et recherche de recettes
- ✅ Vue détaillée d'une recette
- ✅ Modification et suppression de recettes

### Phase 4: Planificateur de menus ✅
- ✅ Tableau hebdomadaire (5 jours × 2 moments)
- ✅ Navigation entre semaines intégrée dans le tableau
- ✅ Affichage des dates sous les jours
- ✅ Association recettes aux menus via modal
- ✅ Drag & drop avec échange de menus
- ✅ Création de recettes inline depuis le planificateur
- ✅ Modification de recettes inline depuis le planificateur
- ✅ Boutons icônes pour toutes les actions

### Phase 5: Simplification de l'interface ✅
- ✅ Suppression de la liste de courses automatique
- ✅ Suppression de la page statistiques
- ✅ Suppression de l'import/export JSON
- ✅ Suppression du header séparé du planificateur
- ✅ Suppression du footer
- ✅ Simplification des modals (suppression temps/portions)
- ✅ Simplification des ingrédients (liste simple sans quantités dans l'UI)
- ✅ Réorganisation des boutons dans les modals

### Phase 6: Déploiement ✅
- ✅ Configuration du serveur sur port 5001
- ✅ Tests sur iPad (accès réseau 192.168.1.90:5001)
- ✅ Mode debug avec auto-reload
- ✅ Sauvegarde sur GitHub (https://github.com/YanChab/Routinerie)

## Notes et remarques

### Fonctionnalités retirées
Les fonctionnalités suivantes ont été initialement implémentées puis retirées pour simplifier l'application:
- Liste de courses automatique avec export PDF
- Page de statistiques (recettes les plus utilisées)
- Import/export de recettes au format JSON
- Champs temps de préparation et portions dans l'interface des recettes
- Quantités et unités d'ingrédients dans l'interface

Ces fonctionnalités restent dans les modèles de données pour une éventuelle réactivation future.

### Décisions de design
- **Interface simplifiée**: Focus sur l'essentiel (nom, instructions, liste d'ingrédients)
- **Boutons icônes**: Gain d'espace et utilisation tactile optimisée
- **Modals intégrés**: Évite la navigation entre pages
- **Drag & drop avec échange**: Plus intuitif que le remplacement simple
- **Auto-soumission**: Workflow fluide lors de la création de recette depuis le planificateur

### Considérations techniques
- L'architecture MVC avec Blueprint facilite la maintenance
- SQLAlchemy ORM évite les injections SQL
- JavaScript vanilla (pas de framework) pour la simplicité
- Mode debug Flask avec auto-reload pour le développement rapide
- Git pour le versioning avec commits réguliers (~20+ commits)
