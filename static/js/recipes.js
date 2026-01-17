// Gestion des recettes
document.addEventListener('DOMContentLoaded', function() {
    const addRecetteBtn = document.getElementById('add-recette');
    const recetteModal = document.getElementById('recette-modal');
    const recetteForm = document.getElementById('recette-form');
    const cancelBtn = document.getElementById('cancel-recette');
    const searchInput = document.getElementById('search-recettes');
    const exportBtn = document.getElementById('export-recettes');
    const importBtn = document.getElementById('import-recettes');
    const importFile = document.getElementById('import-file');
    
    // Export de recettes
    if (exportBtn) {
        exportBtn.addEventListener('click', async function() {
            try {
                window.location.href = '/api/recettes/export';
                showNotification('Export réussi !', 'success');
            } catch (error) {
                showNotification('Erreur lors de l\'export', 'error');
            }
        });
    }
    
    // Import de recettes
    if (importBtn && importFile) {
        importBtn.addEventListener('click', function() {
            importFile.click();
        });
        
        importFile.addEventListener('change', async function() {
            if (this.files.length === 0) return;
            
            const formData = new FormData();
            formData.append('file', this.files[0]);
            
            try {
                const response = await fetch('/api/recettes/import', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                if (result.success) {
                    showNotification(`${result.imported} recette(s) importée(s) avec succès !`, 'success');
                    setTimeout(() => location.reload(), 2000);
                } else {
                    showNotification(`Erreur: ${result.message}`, 'error');
                }
            } catch (error) {
                showNotification('Erreur lors de l\'import', 'error');
            }
            
            this.value = '';
        });
    }
    
    // Recherche en temps réel
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const recetteCards = document.querySelectorAll('.recette-card');
            
            recetteCards.forEach(card => {
                const titre = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('.recette-description').textContent.toLowerCase();
                
                if (titre.includes(searchTerm) || description.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Ouvrir le modal pour ajouter une recette
    if (addRecetteBtn) {
        addRecetteBtn.addEventListener('click', () => {
            showModal('recette-modal');
        });
    }
    
    // Annuler l'ajout
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            hideModal('recette-modal');
            recetteForm.reset();
        });
    }
    
    // Soumettre le formulaire
    if (recetteForm) {
        recetteForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const data = {
                nom: document.getElementById('recette-nom').value,
                description: document.getElementById('recette-description').value,
                temps_preparation: document.getElementById('recette-temps').value || null,
                portions: document.getElementById('recette-portions').value || 4,
                ingredients: [] // Pour l'instant, pas d'ingrédients
            };
            
            try {
                const result = await apiRequest('/api/recette', 'POST', data);
                if (result.success) {
                    showNotification('Recette créée avec succès !', 'success');
                    setTimeout(() => location.reload(), 1500);
                }
            } catch (error) {
                showNotification('Erreur lors de la création de la recette', 'error');
            }
        });
    }
    
    // Gérer la suppression des recettes
    const deleteButtons = document.querySelectorAll('.delete-recette');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.stopPropagation();
            const recetteId = this.dataset.id;
            
            if (!confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
                return;
            }
            
            try {
                const result = await apiRequest(`/api/recette/${recetteId}`, 'DELETE');
                if (result.success) {
                    showNotification('Recette supprimée avec succès !', 'success');
                    setTimeout(() => location.reload(), 1500);
                }
            } catch (error) {
                showNotification('Erreur lors de la suppression de la recette', 'error');
            }
        });
    });
});
