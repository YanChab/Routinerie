"""
Script de migration pour ajouter la colonne 'categorie' à la table ingredient
et supprimer la colonne 'created_at'
"""
import sqlite3
import os

def migrate_database():
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'database.db')
    
    if not os.path.exists(db_path):
        print("❌ Base de données non trouvée. Aucune migration nécessaire.")
        print(f"   Chemin recherché: {db_path}")
        return
    
    print("🔄 Début de la migration de la base de données...")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Vérifier si la colonne 'categorie' existe déjà
        cursor.execute("PRAGMA table_info(ingredient)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'categorie' in columns:
            print("✅ La colonne 'categorie' existe déjà. Migration déjà effectuée.")
            conn.close()
            return
        
        print("📋 Sauvegarde de la table ingredient...")
        
        # Créer une table temporaire avec la nouvelle structure
        cursor.execute("""
            CREATE TABLE ingredient_new (
                id INTEGER PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                unite VARCHAR(20) NOT NULL,
                categorie VARCHAR(50) NOT NULL DEFAULT 'Autre'
            )
        """)
        
        # Copier les données existantes (en assignant 'Autre' comme catégorie par défaut)
        cursor.execute("""
            INSERT INTO ingredient_new (id, nom, unite, categorie)
            SELECT id, nom, unite, 'Autre'
            FROM ingredient
        """)
        
        # Supprimer l'ancienne table
        cursor.execute("DROP TABLE ingredient")
        
        # Renommer la nouvelle table
        cursor.execute("ALTER TABLE ingredient_new RENAME TO ingredient")
        
        conn.commit()
        print("✅ Migration réussie!")
        print("   - Colonne 'created_at' supprimée")
        print("   - Colonne 'categorie' ajoutée (valeur par défaut: 'Autre')")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Erreur lors de la migration: {e}")
        raise
    
    finally:
        conn.close()

if __name__ == '__main__':
    migrate_database()
