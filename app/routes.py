from flask import Blueprint, render_template, request, jsonify, redirect, url_for, send_file, flash
from datetime import datetime, timedelta
from app import db
from app.models import Menu, Recette, Ingredient, RecetteIngredient
from sqlalchemy import func
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import io
import json

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
    
    # Calculer les dates pour chaque jour
    dates = {}
    jour_index = {'lundi': 0, 'mardi': 1, 'mercredi': 2, 'jeudi': 3, 'vendredi': 4}
    for jour in jours:
        date = monday + timedelta(days=jour_index[jour])
        dates[jour] = date
    
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
    
    # Récupérer tous les ingrédients pour les modals
    ingredients = Ingredient.query.order_by(Ingredient.nom).all()
    
    return render_template('menu_planner.html', 
                         menus=menus, 
                         jours=jours, 
                         moments=moments,
                         semaine=monday,
                         dates=dates,
                         recettes=recettes,
                         ingredients=ingredients,
                         week_offset=week_offset)


@bp.route('/recettes')
def recettes():
    """Page de gestion des recettes"""
    recettes_list = Recette.query.order_by(Recette.nom).all()
    return render_template('recipes.html', recettes=recettes_list)


@bp.route('/recette/<int:id>')
def recette_detail(id):
    """Page de détail d'une recette"""
    recette = Recette.query.get_or_404(id)
    return render_template('recipe_detail.html', recette=recette)


@bp.route('/ingredients')
def ingredients():
    """Page de gestion des ingrédients"""
    ingredients_list = Ingredient.query.order_by(Ingredient.nom).all()
    return render_template('ingredients.html', ingredients=ingredients_list)


@bp.route('/api/menu/<int:menu_id>/move', methods=['PUT'])
def move_menu(menu_id):
    """API pour déplacer un menu vers un autre jour/moment"""
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'Données manquantes'}), 400
    
    nouveau_jour = data.get('jour')
    nouveau_moment = data.get('moment')
    
    # Validation
    jours_valides = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']
    moments_valides = ['midi', 'soir']
    
    if nouveau_jour not in jours_valides or nouveau_moment not in moments_valides:
        return jsonify({'success': False, 'message': 'Jour ou moment invalide'}), 400
    
    # Récupérer le menu à déplacer
    menu = Menu.query.get(menu_id)
    if not menu:
        return jsonify({'success': False, 'message': 'Menu non trouvé'}), 404
    
    # Sauvegarder les coordonnées d'origine
    jour_origine = menu.jour
    moment_origine = menu.moment
    
    # Vérifier s'il y a déjà un menu à la destination
    menu_existant = Menu.query.filter_by(
        jour=nouveau_jour,
        moment=nouveau_moment,
        semaine=menu.semaine
    ).first()
    
    if menu_existant and menu_existant.id != menu_id:
        # Échanger les deux menus (swap)
        menu_existant.jour = jour_origine
        menu_existant.moment = moment_origine
    
    # Déplacer le menu
    menu.jour = nouveau_jour
    menu.moment = nouveau_moment
    
    try:
        db.session.commit()
        return jsonify({'success': True, 'message': 'Menu déplacé avec succès'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@bp.route('/api/menu', methods=['POST'])
def create_menu():
    """API pour créer ou modifier un menu"""
    data = request.get_json()
    
    # Validation
    if not data:
        return jsonify({'success': False, 'message': 'Données manquantes'}), 400
    
    jour = data.get('jour')
    moment = data.get('moment')
    semaine_str = data.get('semaine')
    recette_id = data.get('recette_id')
    
    # Validation des champs obligatoires
    if not jour or not moment or not semaine_str or not recette_id:
        return jsonify({'success': False, 'message': 'Jour, moment, semaine et recette sont obligatoires'}), 400
    
    # Validation des valeurs
    jours_valides = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']
    moments_valides = ['midi', 'soir']
    
    if jour not in jours_valides:
        return jsonify({'success': False, 'message': 'Jour invalide'}), 400
    
    if moment not in moments_valides:
        return jsonify({'success': False, 'message': 'Moment invalide'}), 400
    
    try:
        semaine = datetime.strptime(semaine_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'success': False, 'message': 'Format de date invalide'}), 400
    
    # Vérifier si le menu existe déjà
    menu = Menu.query.filter_by(jour=jour, moment=moment, semaine=semaine).first()
    
    if menu:
        menu.recette_id = recette_id
        menu.description = None
        menu.updated_at = datetime.utcnow()
    else:
        menu = Menu(
            jour=jour,
            moment=moment,
            semaine=semaine,
            recette_id=recette_id,
            description=None
        )
        db.session.add(menu)
    
    db.session.commit()
    return jsonify({'success': True, 'menu_id': menu.id})


@bp.route('/api/recette', methods=['POST'])
def create_recette():
    """API pour créer une recette"""
    data = request.get_json()
    
    # Validation
    if not data:
        return jsonify({'success': False, 'message': 'Données manquantes'}), 400
    
    nom = data.get('nom', '').strip()
    if not nom:
        return jsonify({'success': False, 'message': 'Le nom de la recette est obligatoire'}), 400
    
    if len(nom) > 200:
        return jsonify({'success': False, 'message': 'Le nom ne peut pas dépasser 200 caractères'}), 400
    
    description = data.get('description', '').strip()
    temps_preparation = data.get('temps_preparation')
    portions = data.get('portions', 4)
    
    # Validation du temps de préparation
    if temps_preparation is not None:
        try:
            temps_preparation = int(temps_preparation)
            if temps_preparation < 0 or temps_preparation > 1440:  # Max 24h
                return jsonify({'success': False, 'message': 'Temps de préparation invalide (0-1440 min)'}), 400
        except (ValueError, TypeError):
            return jsonify({'success': False, 'message': 'Temps de préparation invalide'}), 400
    
    # Validation des portions
    try:
        portions = int(portions)
        if portions < 1 or portions > 100:
            return jsonify({'success': False, 'message': 'Nombre de portions invalide (1-100)'}), 400
    except (ValueError, TypeError):
        portions = 4
    
    recette = Recette(
        nom=nom,
        description=description,
        temps_preparation=temps_preparation,
        portions=portions
    )
    db.session.add(recette)
    db.session.commit()
    
    # Ajouter les ingrédients
    ingredients = data.get('ingredients', [])
    for ing in ingredients:
        if not ing.get('ingredient_id'):
            continue
        
        try:
            recette_ingredient = RecetteIngredient(
                recette_id=recette.id,
                ingredient_id=int(ing['ingredient_id']),
                quantite=1,  # Valeur par défaut
                unite='unité'  # Valeur par défaut
            )
            db.session.add(recette_ingredient)
        except (ValueError, TypeError):
            continue
    
    db.session.commit()
    return jsonify({
        'success': True, 
        'message': 'Recette créée avec succès',
        'recette': {
            'id': recette.id,
            'nom': recette.nom,
            'description': recette.description,
            'temps_preparation': recette.temps_preparation,
            'portions': recette.portions
        }
    }), 201


@bp.route('/api/ingredients', methods=['GET'])
def get_ingredients():
    """API pour récupérer tous les ingrédients"""
    ingredients_list = Ingredient.query.order_by(Ingredient.nom).all()
    return jsonify([{
        'id': ing.id,
        'nom': ing.nom,
        'categorie': ing.categorie
    } for ing in ingredients_list])


@bp.route('/api/recettes', methods=['GET'])
def get_recettes():
    """API pour récupérer toutes les recettes"""
    recettes_list = Recette.query.order_by(Recette.nom).all()
    return jsonify([{
        'id': rec.id,
        'nom': rec.nom,
        'description': rec.description
    } for rec in recettes_list])


@bp.route('/api/ingredient', methods=['POST'])
def create_ingredient():
    """API pour créer un ingrédient"""
    data = request.get_json()
    
    # Validation
    if not data:
        return jsonify({'success': False, 'message': 'Données manquantes'}), 400
    
    nom = data.get('nom', '').strip()
    if not nom:
        return jsonify({'success': False, 'message': 'Le nom de l\'ingrédient est obligatoire'}), 400
    
    if len(nom) > 100:
        return jsonify({'success': False, 'message': 'Le nom ne peut pas dépasser 100 caractères'}), 400
    
    # Vérifier si l'ingrédient existe déjà
    existing = Ingredient.query.filter_by(nom=nom).first()
    if existing:
        return jsonify({'success': False, 'message': 'Cet ingrédient existe déjà'}), 409
    
    categorie = data.get('categorie', 'Autre').strip()
    categories_valides = Ingredient.CATEGORIES
    if categorie not in categories_valides:
        return jsonify({'success': False, 'message': f'Catégorie invalide'}), 400
    
    unite = data.get('unite', 'g').strip()
    unites_valides = ['g', 'kg', 'ml', 'L', 'cl', 'pièce', 'cuillère', 'tasse', 'pincée', 'c. à soupe', 'c. à café']
    if unite not in unites_valides:
        return jsonify({'success': False, 'message': f'Unité invalide. Unités valides: {", ".join(unites_valides)}'}), 400
    
    ingredient = Ingredient(
        nom=nom,
        categorie=categorie,
        unite=unite
    )
    db.session.add(ingredient)
    db.session.commit()
    
    return jsonify({'success': True, 'ingredient_id': ingredient.id})


@bp.route('/api/ingredient/<int:id>', methods=['PUT'])
def update_ingredient(id):
    """API pour modifier un ingrédient"""
    ingredient = Ingredient.query.get_or_404(id)
    data = request.get_json()
    
    # Validation
    if not data:
        return jsonify({'success': False, 'message': 'Données manquantes'}), 400
    
    nom = data.get('nom', '').strip()
    if not nom:
        return jsonify({'success': False, 'message': 'Le nom de l\'ingrédient est obligatoire'}), 400
    
    if len(nom) > 100:
        return jsonify({'success': False, 'message': 'Le nom ne peut pas dépasser 100 caractères'}), 400
    
    # Vérifier si le nom existe déjà (sauf si c'est le même ingrédient)
    existing = Ingredient.query.filter(Ingredient.nom == nom, Ingredient.id != id).first()
    if existing:
        return jsonify({'success': False, 'message': 'Un autre ingrédient avec ce nom existe déjà'}), 409
    
    categorie = data.get('categorie', 'Autre').strip()
    categories_valides = Ingredient.CATEGORIES
    if categorie not in categories_valides:
        return jsonify({'success': False, 'message': 'Catégorie invalide'}), 400
    
    unite = data.get('unite', 'g').strip()
    unites_valides = ['g', 'kg', 'ml', 'L', 'cl', 'pièce', 'cuillère', 'tasse', 'pincée', 'c. à soupe', 'c. à café']
    if unite not in unites_valides:
        return jsonify({'success': False, 'message': f'Unité invalide'}), 400
    
    # Mettre à jour l'ingrédient
    ingredient.nom = nom
    ingredient.categorie = categorie
    ingredient.unite = unite
    
    db.session.commit()
    return jsonify({'success': True, 'ingredient_id': ingredient.id})


@bp.route('/api/ingredient/<int:id>', methods=['DELETE'])
def delete_ingredient(id):
    """API pour supprimer un ingrédient"""
    ingredient = Ingredient.query.get_or_404(id)
    db.session.delete(ingredient)
    db.session.commit()
    return jsonify({'success': True})


@bp.route('/api/recette/<int:id>', methods=['GET'])
def get_recette(id):
    """API pour récupérer une recette"""
    recette = Recette.query.get_or_404(id)
    
    # Récupérer les ingrédients de la recette
    ingredients = []
    for ri in recette.recette_ingredients:
        ingredients.append({
            'id': ri.id,
            'ingredient_id': ri.ingredient_id,
            'ingredient_nom': ri.ingredient.nom,
            'quantite': ri.quantite,
            'unite': ri.unite
        })
    
    return jsonify({
        'success': True,
        'recette': {
            'id': recette.id,
            'nom': recette.nom,
            'description': recette.description,
            'temps_preparation': recette.temps_preparation,
            'portions': recette.portions,
            'ingredients': ingredients
        }
    })


@bp.route('/api/recette/<int:id>', methods=['PUT'])
def update_recette(id):
    """API pour mettre à jour une recette"""
    recette = Recette.query.get_or_404(id)
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'Données manquantes'}), 400
    
    nom = data.get('nom', '').strip()
    if not nom:
        return jsonify({'success': False, 'message': 'Le nom de la recette est obligatoire'}), 400
    
    recette.nom = nom
    recette.description = data.get('description', '').strip()
    
    temps_preparation = data.get('temps_preparation')
    if temps_preparation is not None:
        try:
            temps_preparation = int(temps_preparation)
            if temps_preparation < 0 or temps_preparation > 1440:
                return jsonify({'success': False, 'message': 'Temps de préparation invalide'}), 400
            recette.temps_preparation = temps_preparation
        except (ValueError, TypeError):
            return jsonify({'success': False, 'message': 'Temps de préparation invalide'}), 400
    else:
        recette.temps_preparation = None
    
    portions = data.get('portions', 4)
    try:
        portions = int(portions)
        if portions < 1 or portions > 100:
            return jsonify({'success': False, 'message': 'Nombre de portions invalide'}), 400
        recette.portions = portions
    except (ValueError, TypeError):
        recette.portions = 4
    
    # Gérer les ingrédients
    if 'ingredients' in data:
        # Supprimer les anciens ingrédients
        RecetteIngredient.query.filter_by(recette_id=recette.id).delete()
        
        # Ajouter les nouveaux ingrédients
        ingredients = data.get('ingredients', [])
        for ing in ingredients:
            if not ing.get('ingredient_id'):
                continue
            
            try:
                recette_ingredient = RecetteIngredient(
                    recette_id=recette.id,
                    ingredient_id=int(ing['ingredient_id']),
                    quantite=1,  # Valeur par défaut
                    unite='unité'  # Valeur par défaut
                )
                db.session.add(recette_ingredient)
            except (ValueError, TypeError):
                continue
    
    db.session.commit()
    return jsonify({'success': True, 'message': 'Recette modifiée avec succès'})


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


@bp.route('/liste-courses/export-pdf')
def export_shopping_list_pdf():
    """Export de la liste de courses en PDF"""
    week_offset = request.args.get('week', 0, type=int)
    today = datetime.now().date()
    monday = today - timedelta(days=today.weekday()) + timedelta(weeks=week_offset)
    sunday = monday + timedelta(days=6)
    
    # Récupérer tous les menus de la semaine
    menus = Menu.query.filter(
        Menu.semaine == monday,
        Menu.recette_id.isnot(None)
    ).all()
    
    # Agréger les ingrédients
    ingredients_aggregated = {}
    for menu in menus:
        if menu.recette:
            for ri in menu.recette.ingredients:
                key = (ri.ingredient.nom, ri.unite)
                if key in ingredients_aggregated:
                    ingredients_aggregated[key] += ri.quantite
                else:
                    ingredients_aggregated[key] = ri.quantite
    
    # Créer le PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    
    styles = getSampleStyleSheet()
    title = Paragraph(f"<b>Liste de Courses</b><br/>Semaine du {monday.strftime('%d/%m/%Y')} au {sunday.strftime('%d/%m/%Y')}", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 20))
    
    # Créer le tableau des ingrédients
    data = [['Ingrédient', 'Quantité', 'Unité']]
    for (nom, unite), quantite in sorted(ingredients_aggregated.items()):
        data.append([nom, f"{quantite:.1f}", unite])
    
    table = Table(data, colWidths=[300, 100, 100])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    doc.build(elements)
    
    buffer.seek(0)
    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'liste_courses_{monday.strftime("%Y%m%d")}.pdf'
    )


