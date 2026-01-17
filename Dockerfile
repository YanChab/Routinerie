# Utiliser une image Python officielle
FROM python:3.9-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de requirements
COPY requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste de l'application
COPY . .

# Créer le répertoire instance s'il n'existe pas
RUN mkdir -p instance

# Exposer le port 5001
EXPOSE 5001

# Variables d'environnement
ENV FLASK_APP=run.py
ENV PYTHONUNBUFFERED=1

# Commande pour lancer l'application avec gunicorn (production)
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "4", "--timeout", "120", "run:app"]
