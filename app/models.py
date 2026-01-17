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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relation avec Recette
    recette = db.relationship('Recette', back_populates='menus')
    
    def __repr__(self):
        return f'<Menu {self.jour} {self.moment}>'
