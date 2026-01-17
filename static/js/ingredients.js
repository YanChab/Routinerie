// Gestion des ingrédients
document.addEventListener('DOMContentLoaded', function() {
    const addIngredientBtn = document.getElementById('add-ingredient');
    const ingredientModal = document.getElementById('ingredient-modal');
    const ingredientForm = document.getElementById('ingredient-form');
    const cancelBtn = document.getElementById('cancel-ingredient');
    const modalTitle = document.getElementById('modal-title');
    let editMode = false;
    let currentIngredientId = null;
    
    // Ouvrir le modal pour ajouter un ingrédient
    if (addIngredientBtn) {
        addIngredientBtn.addEventListener('click', () => {
            editMode = false;
            currentIngredientId = null;
            modalTitle.textContent = 'Ajouter un ingrédient';
            ingredientForm.reset();
            document.getElementById('ingredient-id').value = '';
            showModal('ingredient-modal');
        });
    }
    
    // Ouvrir le modal pour modifier un ingrédient
    const editButtons = document.querySelectorAll('.edit-ingredient');
    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            editMode = true;
            currentIngredientId = this.dataset.id;
            modalTitle.textContent = 'Modifier un ingrédient';
            
            // Remplir le formulaire avec les données actuelles
            document.getElementById('ingredient-id').value = this.dataset.id;
            document.getElementById('ingredient-nom').value = this.dataset.nom;
            document.getElementById('ingredient-categorie').value = this.dataset.categorie;
            document.getElementById('ingredient-unite').value = this.dataset.unite;
            
            showModal('ingredient-modal');
        });
    });
    
    // Annuler l'ajout/modification
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            hideModal('ingredient-modal');
            ingredientForm.reset();
            editMode = false;
            currentIngredientId = null;
        });
    }
    
    // Soumettre le formulaire
    if (ingredientForm) {
        ingredientForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const data = {
                nom: document.getElementById('ingredient-nom').value,
                categorie: document.getElementById('ingredient-categorie').value,
                unite: document.getElementById('ingredient-unite').value
            };
            
            try {
                let url = '/api/ingredient';
                let method = 'POST';
                
                if (editMode && currentIngredientId) {
                    url = `/api/ingredient/${currentIngredientId}`;
                    method = 'PUT';
                }
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    const message = editMode ? 'Ingrédient modifié avec succès !' : 'Ingrédient créé avec succès !';
                    showNotification(message, 'success');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showNotification(result.message || 'Erreur lors de l\'opération', 'error');
                }
            } catch (error) {
                showNotification('Erreur lors de l\'opération', 'error');
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
                    showNotification('Ingrédient supprimé avec succès !', 'success');
                    setTimeout(() => location.reload(), 1500);
                }
            } catch (error) {
                showNotification('Erreur lors de la suppression de l\'ingrédient', 'error');
            }
        });
    });
});
