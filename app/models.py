from datetime import datetime
from app import db

class Ingredient(db.Model):
    """Modèle pour les ingrédients"""
    __tablename__ = 'ingredient'
    
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    unite = db.Column(db.String(20), nullable=False)  # kg, g, L, ml, pièce, etc.
    categorie = db.Column(db.String(50), nullable=False, default='Autre')  # Catégorie d'ingrédient
    
    # Relation avec RecetteIngredient
    recette_ingredients = db.relationship('RecetteIngredient', back_populates='ingredient', cascade='all, delete-orphan')
    
    # Catégories disponibles
    CATEGORIES = [
        'Légumes',
        'Fruits',
        'Viandes',
        'Poissons',
        'Produits laitiers',
        'Céréales & Féculents',
        'Épices & Condiments',
        'Huiles & Matières grasses',
        'Sucres & Produits sucrés',
        'Boissons',
        'Autre'
    ]
    
    def __repr__(self):
        return f'<Ingredient {self.nom}>'


class Recette(db.Model):
    """Modèle pour les recettes"""
    __tablename__ = 'recette'
    
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    temps_preparation = db.Column(db.Integer)  # en minutes
    portions = db.Column(db.Integer, default=4)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    recette_ingredients = db.relationship('RecetteIngredient', back_populates='recette', cascade='all, delete-orphan')
    menus = db.relationship('Menu', back_populates='recette')
    
    def get_categories_presentes(self):
        """Retourne la liste des catégories d'ingrédients présentes dans la recette"""
        categories = set()
        for ri in self.recette_ingredients:
            if ri.ingredient and ri.ingredient.categorie:
                categories.add(ri.ingredient.categorie)
        return list(categories)
    
    def __repr__(self):
        return f'<Recette {self.nom}>'


class RecetteIngredient(db.Model):
    """Table de liaison entre Recette et Ingredient avec quantités"""
    __tablename__ = 'recette_ingredient'
    
    id = db.Column(db.Integer, primary_key=True)
    recette_id = db.Column(db.Integer, db.ForeignKey('recette.id'), nullable=False)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredient.id'), nullable=False)
    quantite = db.Column(db.Float, nullable=False)
    unite = db.Column(db.String(20), nullable=False)
    
    # Relations
    recette = db.relationship('Recette', back_populates='recette_ingredients')
    ingredient = db.relationship('Ingredient', back_populates='recette_ingredients')
    
    def __repr__(self):
        return f'<RecetteIngredient {self.quantite} {self.unite}>'


class Menu(db.Model):
    """Modèle pour les menus de la semaine"""
    __tablename__ = 'menu'
    
    id = db.Column(db.Integer, primary_key=True)
    jour = db.Column(db.String(20), nullable=False)  # lundi, mardi, mercredi, jeudi, vendredi
    moment = db.Column(db.String(10), nullable=False)  # midi, soir
    semaine = db.Column(db.Date, nullable=False)  # date du lundi de la semaine
    recette_id = db.Column(db.Integer, db.ForeignKey('recette.id'), nullable=True)
    description = db.Column(db.Text)  # optionnel si pas de recette associée
    equilibre_cache = db.Column(db.Text)  # Cache JSON de l'analyse d'équilibre (optimisation)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relation avec Recette
    recette = db.relationship('Recette', back_populates='menus')
    
    # Catégories importantes pour l'équilibre nutritionnel
    CATEGORIES_PROTEINES = ['Viandes', 'Poissons', 'Céréales & Féculents']
    CATEGORIES_LEGUMES = ['Légumes']
    CATEGORIES_FECULENTS = ['Céréales & Féculents']
    , use_cache=True):
        """
        Analyse l'équilibre nutritionnel du menu.
        Retourne un dict avec le niveau d'équilibre et les détails.
        
        Args:
            use_cache: Si True, utilise le cache si disponible (optimisation)
        
        Niveaux:
        - 'equilibre' (vert): contient protéines + légumes + féculents
        - 'moyen' (jaune): contient 2 des 3 groupes
        - 'desequilibre' (rouge): contient 0 ou 1 groupe
        """
        # Optimisation : Utiliser le cache si disponible
        if use_cache and self.equilibre_cache:
            try:
                import json
                return json.loads(self.equilibre_cache)
            except (json.JSONDecodeError, TypeError):
                pass  # Si le cache est invalide, recalculer
        desequilibre' (rouge): contient 0 ou 1 groupe
        """
        if not self.recette:
            return {
                'niveau': 'vide',
                'score': 0,
                'categories': [],
                'manque': ['Protéines', 'Légumes', 'Féculents'],
                'message': 'Aucune recette'
            }
        
        categories = self.recette.get_categories_presentes()
        
        # Vérifier la présence des groupes alimentaires
        a_proteines = any(cat in categories for cat in self.CATEGORIES_PROTEINES)
        a_legumes = any(cat in categories for cat in self.CATEGORIES_LEGUMES)
        a_feculents = any(cat in categories for cat in self.CATEGORIES_FECULENTS)
        
        # Calculer le score (nombre de groupes présents)
        score = sum([a_proteines, a_legumes, a_feculents])
        
        # Déterminer le niveau d'équilibre
        if score == 3:
            niveau = 'equilibre'
            message = 'Repas équilibré'
        elif score == 2:
            niveau = 'moyen'
            message = 'Moyennement équilibré'
        else:
            niveau = 'desequilibre'
            message = 'Repas déséquilibré'
        
        # Identifier ce qui manque
        manque = []
        if not a_proteines:
            manque.append('Protéines')
        if not a_legumes:
            manque.append('Légumes')
        if not a_feculents:
            manque.append('Féculents')
        
        r
    
    def update_equilibre_cache(self):
        """
        Met à jour le cache de l'analyse d'équilibre.
        À appeler après modification du menu ou de la recette associée.
        """
        import json
        analyse = self.analyser_equilibre(use_cache=False)
        self.equilibre_cache = json.dumps(analyse)eturn {
            'niveau': niveau,
            'score': score,
            'categories': categories,
            'manque': manque,
            'message': message,
            'details': {
                'proteines': a_proteines,
                'legumes': a_legumes,
                'feculents': a_feculents
            }
        }
    
    def __repr__(self):
        return f'<Menu {self.jour} {self.moment}>'
