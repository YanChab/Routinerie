// Gestion des ingrédients
document.addEventListener('DOMContentLoaded', function() {
    const addIngredientBtn = document.getElementById('add-ingredient');
    const ingredientModal = document.getElementById('ingredient-modal');
    const ingredientForm = document.getElementById('ingredient-form');
    const cancelBtn = document.getElementById('cancel-ingredient');
    
    // Ouvrir le modal pour ajouter un ingrédient
    if (addIngredientBtn) {
        addIngredientBtn.addEventListener('click', () => {
            showModal('ingredient-modal');
        });
    }
    
    // Annuler l'ajout
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            hideModal('ingredient-modal');
            ingredientForm.reset();
        });
    }
    
    // Soumettre le formulaire
    if (ingredientForm) {
        ingredientForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const data = {
                nom: document.getElementById('ingredient-nom').value,
                unite: document.getElementById('ingredient-unite').value
            };
            
            try {
                const result = await apiRequest('/api/ingredient', 'POST', data);
                if (result.success) {
                    location.reload();
                }
            } catch (error) {
                alert('Erreur lors de la création de l\'ingrédient');
            }
        });
    }
    
    // Gérer la suppression des ingrédients
    const deleteButtons = document.querySelectorAll('.delete-ingredient');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', async function() {
            const ingredientId = this.dataset.id;
            
            if (!confirm('Êtes-vous sûr de vouloir supprimer cet ingrédient ?')) {
                return;
            }
            
            try {
                const result = await apiRequest(`/api/ingredient/${ingredientId}`, 'DELETE');
                if (result.success) {
                    location.reload();
                }
            } catch (error) {
                alert('Erreur lors de la suppression de l\'ingrédient');
            }
        });
    });
});
