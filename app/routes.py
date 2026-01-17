from flask import Blueprint, render_template, request, jsonify, redirect, url_for
from datetime import datetime, timedelta
from app import db
from app.models import Menu, Recette, Ingredient, RecetteIngredient

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    """Page d'accueil - Planificateur de menus"""
    # Obtenir la semaine demandée ou la semaine actuelle
    week_offset = request.args.get('week', 0, type=int)
    today = datetime.now().date()
    monday = today - timedelta(days=today.weekday()) + timedelta(weeks=week_offset)
    
    # Récupérer les menus de la semaine
    jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']
    moments = ['midi', 'soir']
    
    menus = {}
    for jour in jours:
        menus[jour] = {}
        for moment in moments:
            menu = Menu.query.filter_by(
                jour=jour,
                moment=moment,
                semaine=monday
            ).first()
            menus[jour][moment] = menu
    
    # Récupérer toutes les recettes pour le sélecteur
    recettes = Recette.query.order_by(Recette.nom).all()
    
    return render_template('menu_planner.html', 
                         menus=menus, 
                         jours=jours, 
                         moments=moments,
                         semaine=monday,
                         recettes=recettes,
                         week_offset=week_offset)


@bp.route('/recettes')
def recettes():
    """Page de gestion des recettes"""
    recettes_list = Recette.query.order_by(Recette.nom).all()
    return render_template('recipes.html', recettes=recettes_list)


@bp.route('/ingredients')
def ingredients():
    """Page de gestion des ingrédients"""
    ingredients_list = Ingredient.query.order_by(Ingredient.nom).all()
    return render_template('ingredients.html', ingredients=ingredients_list)


@bp.route('/api/menu', methods=['POST'])
def create_menu():
    """API pour créer ou modifier un menu"""
    data = request.get_json()
    
    jour = data.get('jour')
    moment = data.get('moment')
    semaine = datetime.strptime(data.get('semaine'), '%Y-%m-%d').date()
    recette_id = data.get('recette_id')
    description = data.get('description')
    
    # Vérifier si le menu existe déjà
    menu = Menu.query.filter_by(jour=jour, moment=moment, semaine=semaine).first()
    
    if menu:
        menu.recette_id = recette_id
        menu.description = description
        menu.updated_at = datetime.utcnow()
    else:
        menu = Menu(
            jour=jour,
            moment=moment,
            semaine=semaine,
            recette_id=recette_id,
            description=description
        )
        db.session.add(menu)
    
    db.session.commit()
    return jsonify({'success': True, 'menu_id': menu.id})


@bp.route('/api/recette', methods=['POST'])
def create_recette():
    """API pour créer une recette"""
    data = request.get_json()
    
    recette = Recette(
        nom=data.get('nom'),
        description=data.get('description'),
        temps_preparation=data.get('temps_preparation'),
        portions=data.get('portions', 4)
    )
    db.session.add(recette)
    db.session.commit()
    
    # Ajouter les ingrédients
    ingredients = data.get('ingredients', [])
    for ing in ingredients:
        recette_ingredient = RecetteIngredient(
            recette_id=recette.id,
            ingredient_id=ing['ingredient_id'],
            quantite=ing['quantite'],
            unite=ing['unite']
        )
        db.session.add(recette_ingredient)
    
    db.session.commit()
    return jsonify({'success': True, 'recette_id': recette.id})


@bp.route('/api/ingredient', methods=['POST'])
def create_ingredient():
    """API pour créer un ingrédient"""
    data = request.get_json()
    
    ingredient = Ingredient(
        nom=data.get('nom'),
        unite=data.get('unite')
    )
    db.session.add(ingredient)
    db.session.commit()
    
    return jsonify({'success': True, 'ingredient_id': ingredient.id})


@bp.route('/api/ingredient/<int:id>', methods=['DELETE'])
def delete_ingredient(id):
    """API pour supprimer un ingrédient"""
    ingredient = Ingredient.query.get_or_404(id)
    db.session.delete(ingredient)
    db.session.commit()
    return jsonify({'success': True})


@bp.route('/api/recette/<int:id>', methods=['DELETE'])
def delete_recette(id):
    """API pour supprimer une recette"""
    recette = Recette.query.get_or_404(id)
    db.session.delete(recette)
    db.session.commit()
    return jsonify({'success': True})


@bp.route('/api/menu/<int:id>', methods=['DELETE'])
def delete_menu(id):
    """API pour supprimer un menu"""
    menu = Menu.query.get_or_404(id)
    db.session.delete(menu)
    db.session.commit()
    return jsonify({'success': True})
