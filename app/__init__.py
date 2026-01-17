from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

def create_app():
    """Factory pour créer l'application Flask"""
    # Définir les chemins pour static et templates
    basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    app = Flask(__name__,
                static_folder=os.path.join(basedir, 'static'),
                template_folder=os.path.join(basedir, 'app', 'templates'))
    
    # Charger la configuration
    app.config.from_object('config.Config')
    
    # Initialiser la base de données
    db.init_app(app)
    
    # Enregistrer les blueprints
    from app import routes
    app.register_blueprint(routes.bp)
    
    # Créer les tables si elles n'existent pas
    with app.app_context():
        try:
            # Utiliser inspect pour vérifier si les tables existent avant de les créer
            from sqlalchemy import inspect, text
            inspector = inspect(db.engine)
            existing_tables = inspector.get_table_names()
            
            if not existing_tables:
                # Base de données vide, créer toutes les tables
                db.create_all()
            else:
                # Optimisation : Ajouter la colonne equilibre_cache si elle n'existe pas
                if 'menu' in existing_tables:
                    columns = [col['name'] for col in inspector.get_columns('menu')]
                    if 'equilibre_cache' not in columns:
                        try:
                            with db.engine.connect() as conn:
                                conn.execute(text('ALTER TABLE menu ADD COLUMN equilibre_cache TEXT'))
                                conn.commit()
                            print("✅ Colonne equilibre_cache ajoutée avec succès")
                        except Exception as alter_error:
                            print(f"Info: Colonne equilibre_cache déjà présente ou erreur - {str(alter_error)[:100]}")
        except Exception as e:
            # En cas d'erreur, logger et continuer
            # Les tables existent probablement déjà
            print(f"Info: Tables probablement déjà créées - {str(e)[:100]}")
    
    return app
