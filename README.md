# Routinerie

Application web modulaire de gestion de routines et de planification. Première fonctionnalité : planificateur de menus hebdomadaires.

## 📋 Fonctionnalités

### Phase 1 : Planification de menus (En cours)
- ✅ Tableau hebdomadaire des menus (lundi à vendredi, midi et soir)
- ✅ Gestion des recettes
- ✅ Gestion des ingrédients
- 🔄 Association recettes-menus (à venir)
- 🔄 Liste de courses automatique (à venir)

## 🛠️ Technologies

- **Backend**: Flask (Python)
- **Base de données**: SQLite
- **Frontend**: HTML/CSS/JavaScript
- **Déploiement**: Serveur personnel

## 📦 Installation

### Prérequis
- Python 3.9+
- pip

### Configuration

1. Cloner le dépôt :
```bash
git clone https://github.com/YanChab/Routinerie.git
cd Routinerie
```

2. Créer un environnement virtuel :
```bash
python -m venv .venv
source .venv/bin/activate  # Sur macOS/Linux
# ou
.venv\Scripts\activate  # Sur Windows
```

3. Installer les dépendances :
```bash
pip install -r requirements.txt
```

4. Configurer les variables d'environnement :
```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

5. Lancer l'application :
```bash
python run.py
```

L'application sera accessible sur http://localhost:5001

## 🗂️ Structure du projet

```
Routinerie/
├── app/
│   ├── __init__.py          # Factory Flask
│   ├── models.py            # Modèles de données
│   ├── routes.py            # Routes et API
│   └── templates/           # Templates HTML
│       ├── base.html
│       ├── menu_planner.html
│       ├── recipes.html
│       └── ingredients.html
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js
│       ├── planner.js
│       ├── recipes.js
│       └── ingredients.js
├── config.py                # Configuration
├── run.py                   # Point d'entrée
├── requirements.txt         # Dépendances Python
└── specificatio.md         # Spécifications détaillées
```

## 📊 Modèles de données

### Menu
- jour, moment, semaine
- recette (optionnel)
- description

### Recette
- nom, description
- temps de préparation, portions
- ingrédients associés

### Ingrédient
- nom, unité de mesure

## 🚀 Prochaines étapes

- [ ] Association recettes aux menus du tableau
- [ ] Navigation entre semaines
- [ ] Liste de courses automatique basée sur les menus
- [ ] Import/export de recettes
- [ ] Statistiques d'utilisation

## 📝 Notes

Cette application est conçue avec une architecture modulaire pour faciliter l'ajout de nouvelles fonctionnalités (gestion de tâches, budgets, etc.).

## 📄 Licence

Projet personnel - Tous droits réservés

## 👤 Auteur

Yan Chabrerie
