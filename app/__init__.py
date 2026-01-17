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
        db.create_all()
    
    return app
