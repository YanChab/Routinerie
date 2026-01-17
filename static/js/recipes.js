// Gestion des recettes
document.addEventListener('DOMContentLoaded', function() {
    const addRecetteBtn = document.getElementById('add-recette');
    const recetteModal = document.getElementById('recette-modal');
    const recetteForm = document.getElementById('recette-form');
    const cancelBtn = document.getElementById('cancel-recette');
    
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
                    location.reload();
                }
            } catch (error) {
                alert('Erreur lors de la création de la recette');
            }
        });
    }
});
