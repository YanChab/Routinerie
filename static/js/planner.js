// Gestion du planificateur de menus
document.addEventListener('DOMContentLoaded', function() {
    const menuCells = document.querySelectorAll('.menu-cell');
    const menuModal = document.getElementById('menu-modal');
    const menuForm = document.getElementById('menu-form');
    const deleteBtn = document.getElementById('delete-menu');
    let currentMenuId = null;
    
    // Gestion des ingrédients pour le modal de création
    let ingredientsList = [];
    const ingredientsListDiv = document.getElementById('ingredients-list');
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    
    function renderIngredientsList() {
        ingredientsListDiv.innerHTML = '';
        ingredientsList.forEach((ing, index) => {
            const div = document.createElement('div');
            div.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; padding: 0.3rem; background: #ecf0f1; border-radius: 4px;';
            div.innerHTML = `
                <span style="flex: 1;">${ing.nom}</span>
                <button type="button" class="btn-icon btn-icon-danger" style="width: 30px; height: 30px; font-size: 0.8rem;" onclick="removeIngredient(${index})">🗑</button>
            `;
            ingredientsListDiv.appendChild(div);
        });
    }
    
    window.removeIngredient = function(index) {
        ingredientsList.splice(index, 1);
        renderIngredientsList();
    };
    
    // Système de recherche d'ingrédients pour le modal de création
    let allIngredients = [];
    let selectedIngredient = null;
    const ingredientSearch = document.getElementById('ingredient-search');
    const ingredientSuggestions = document.getElementById('ingredient-suggestions');
    
    // Charger tous les ingrédients au démarrage
    async function loadAllIngredients() {
        try {
            const response = await apiRequest('/api/ingredients');
            allIngredients = response;
            console.log('Ingrédients chargés:', allIngredients.length);
        } catch (error) {
            console.error('Erreur lors du chargement des ingrédients:', error);
        }
    }
    
    loadAllIngredients();
    
    function filterIngredients(searchText) {
        const search = searchText.toLowerCase().trim();
        if (!search) return [];
        
        const filtered = allIngredients.filter(ing => 
            ing.nom.toLowerCase().includes(search)
        ).slice(0, 10); // Limite à 10 suggestions
        console.log('Recherche:', search, '- Résultats:', filtered.length);
        return filtered;
    }
    
    function showIngredientSuggestions(ingredients) {
        console.log('Affichage des suggestions:', ingredients.length);
        if (ingredients.length === 0) {
            ingredientSuggestions.style.display = 'none';
            return;
        }
        
        ingredientSuggestions.innerHTML = '';
        ingredients.forEach((ing, index) => {
            const div = document.createElement('div');
            div.className = 'ingredient-suggestion-item';
            if (index === 0) div.classList.add('selected');
            div.textContent = ing.nom;
            div.dataset.id = ing.id;
            div.dataset.nom = ing.nom;
            
            div.addEventListener('click', () => {
                selectIngredientFromSuggestion(ing.id, ing.nom);
            });
            
            ingredientSuggestions.appendChild(div);
        });
        
        ingredientSuggestions.style.display = 'block';
        console.log('Suggestions affichées, display:', ingredientSuggestions.style.display);
    }
    
    function selectIngredientFromSuggestion(id, nom) {
        selectedIngredient = { id: parseInt(id), nom: nom };
        ingredientSearch.value = nom;
        ingredientSuggestions.style.display = 'none';
    }
    
    if (ingredientSearch) {
        ingredientSearch.addEventListener('input', (e) => {
            const filtered = filterIngredients(e.target.value);
            showIngredientSuggestions(filtered);
            selectedIngredient = null;
        });
        
        ingredientSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const selected = ingredientSuggestions.querySelector('.selected');
                if (selected) {
                    selectIngredientFromSuggestion(selected.dataset.id, selected.dataset.nom);
                    addIngredientBtn.click();
                }
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const items = ingredientSuggestions.querySelectorAll('.ingredient-suggestion-item');
                const selected = ingredientSuggestions.querySelector('.selected');
                if (items.length === 0) return;
                
                let newIndex = 0;
                if (selected) {
                    selected.classList.remove('selected');
                    const currentIndex = Array.from(items).indexOf(selected);
                    if (e.key === 'ArrowDown') {
                        newIndex = (currentIndex + 1) % items.length;
                    } else {
                        newIndex = (currentIndex - 1 + items.length) % items.length;
                    }
                }
                items[newIndex].classList.add('selected');
            }
        });
        
        // Fermer les suggestions si on clique ailleurs
        document.addEventListener('click', (e) => {
            if (!ingredientSearch.contains(e.target) && !ingredientSuggestions.contains(e.target)) {
                ingredientSuggestions.style.display = 'none';
            }
        });
    }
    
    if (addIngredientBtn) {
        addIngredientBtn.addEventListener('click', () => {
            if (selectedIngredient) {
                ingredientsList.push({
                    ingredient_id: selectedIngredient.id,
                    nom: selectedIngredient.nom
                });
                
                renderIngredientsList();
                ingredientSearch.value = '';
                selectedIngredient = null;
                ingredientSuggestions.style.display = 'none';
            }
        });
    }
    
    // Système de recherche de recettes pour le modal menu
    let allRecettes = [];
    let selectedRecette = null;
    const menuRecetteSearch = document.getElementById('menu-recette-search');
    const menuRecetteInput = document.getElementById('menu-recette');
    const menuRecetteSuggestions = document.getElementById('menu-recette-suggestions');
    
    // Charger toutes les recettes au démarrage
    async function loadAllRecettes() {
        try {
            const response = await apiRequest('/api/recettes');
            allRecettes = response;
            console.log('Recettes chargées:', allRecettes.length);
        } catch (error) {
            console.error('Erreur lors du chargement des recettes:', error);
        }
    }
    
    loadAllRecettes();
    
    function filterRecettes(searchText) {
        const search = searchText.toLowerCase().trim();
        if (!search) return [];
        
        const filtered = allRecettes.filter(rec => 
            rec.nom.toLowerCase().includes(search)
        ).slice(0, 10); // Limite à 10 suggestions
        console.log('Recherche recette:', search, '- Résultats:', filtered.length);
        return filtered;
    }
    
    function showRecetteSuggestions(recettes) {
        console.log('Affichage des suggestions recettes:', recettes.length);
        if (recettes.length === 0) {
            menuRecetteSuggestions.style.display = 'none';
            return;
        }
        
        menuRecetteSuggestions.innerHTML = '';
        recettes.forEach((rec, index) => {
            const div = document.createElement('div');
            div.className = 'ingredient-suggestion-item';
            if (index === 0) div.classList.add('selected');
            div.textContent = rec.nom;
            div.dataset.id = rec.id;
            div.dataset.nom = rec.nom;
            
            div.addEventListener('click', () => {
                selectRecetteFromSuggestion(rec.id, rec.nom);
            });
            
            menuRecetteSuggestions.appendChild(div);
        });
        
        menuRecetteSuggestions.style.display = 'block';
        console.log('Suggestions recettes affichées');
    }
    
    function selectRecetteFromSuggestion(id, nom) {
        selectedRecette = { id: parseInt(id), nom: nom };
        menuRecetteSearch.value = nom;
        menuRecetteInput.value = id;
        menuRecetteSuggestions.style.display = 'none';
        
        // Afficher le bouton modifier si une recette est sélectionnée
        const editRecipeBtn = document.getElementById('edit-recipe-btn');
        if (editRecipeBtn) {
            editRecipeBtn.style.display = id ? 'flex' : 'none';
        }
    }
    
    if (menuRecetteSearch) {
        menuRecetteSearch.addEventListener('input', (e) => {
            const filtered = filterRecettes(e.target.value);
            showRecetteSuggestions(filtered);
            selectedRecette = null;
            menuRecetteInput.value = '';
            
            // Masquer le bouton modifier si le champ est modifié
            const editRecipeBtn = document.getElementById('edit-recipe-btn');
            if (editRecipeBtn) {
                editRecipeBtn.style.display = 'none';
            }
        });
        
        menuRecetteSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const selected = menuRecetteSuggestions.querySelector('.selected');
                if (selected) {
                    selectRecetteFromSuggestion(selected.dataset.id, selected.dataset.nom);
                }
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const items = menuRecetteSuggestions.querySelectorAll('.ingredient-suggestion-item');
                const selected = menuRecetteSuggestions.querySelector('.selected');
                if (items.length === 0) return;
                
                let newIndex = 0;
                if (selected) {
                    selected.classList.remove('selected');
                    const currentIndex = Array.from(items).indexOf(selected);
                    if (e.key === 'ArrowDown') {
                        newIndex = (currentIndex + 1) % items.length;
                    } else {
                        newIndex = (currentIndex - 1 + items.length) % items.length;
                    }
                }
                items[newIndex].classList.add('selected');
            }
        });
        
        // Fermer les suggestions si on clique ailleurs
        document.addEventListener('click', (e) => {
            if (!menuRecetteSearch.contains(e.target) && !menuRecetteSuggestions.contains(e.target)) {
                menuRecetteSuggestions.style.display = 'none';
            }
        });
    }
    
    // Gestion des ingrédients pour le modal d'édition
    let editIngredientsList = [];
    const editIngredientsListDiv = document.getElementById('edit-ingredients-list');
    const editAddIngredientBtn = document.getElementById('edit-add-ingredient-btn');
    
    function renderEditIngredientsList() {
        editIngredientsListDiv.innerHTML = '';
        editIngredientsList.forEach((ing, index) => {
            const div = document.createElement('div');
            div.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; padding: 0.3rem; background: #ecf0f1; border-radius: 4px;';
            div.innerHTML = `
                <span style="flex: 1;">${ing.nom}</span>
                <button type="button" class="btn-icon btn-icon-danger" style="width: 30px; height: 30px; font-size: 0.8rem;" onclick="removeEditIngredient(${index})">🗑</button>
            `;
            editIngredientsListDiv.appendChild(div);
        });
    }
    
    window.removeEditIngredient = function(index) {
        editIngredientsList.splice(index, 1);
        renderEditIngredientsList();
    };
    
    // Système de recherche d'ingrédients pour le modal d'édition
    let editSelectedIngredient = null;
    const editIngredientSearch = document.getElementById('edit-ingredient-search');
    const editIngredientSuggestions = document.getElementById('edit-ingredient-suggestions');
    
    function showEditIngredientSuggestions(ingredients) {
        if (ingredients.length === 0) {
            editIngredientSuggestions.style.display = 'none';
            return;
        }
        
        editIngredientSuggestions.innerHTML = '';
        ingredients.forEach((ing, index) => {
            const div = document.createElement('div');
            div.className = 'ingredient-suggestion-item';
            if (index === 0) div.classList.add('selected');
            div.textContent = ing.nom;
            div.dataset.id = ing.id;
            div.dataset.nom = ing.nom;
            
            div.addEventListener('click', () => {
                selectEditIngredientFromSuggestion(ing.id, ing.nom);
            });
            
            editIngredientSuggestions.appendChild(div);
        });
        
        editIngredientSuggestions.style.display = 'block';
    }
    
    function selectEditIngredientFromSuggestion(id, nom) {
        editSelectedIngredient = { id: parseInt(id), nom: nom };
        editIngredientSearch.value = nom;
        editIngredientSuggestions.style.display = 'none';
    }
    
    if (editIngredientSearch) {
        editIngredientSearch.addEventListener('input', (e) => {
            const filtered = filterIngredients(e.target.value);
            showEditIngredientSuggestions(filtered);
            editSelectedIngredient = null;
        });
        
        editIngredientSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const selected = editIngredientSuggestions.querySelector('.selected');
                if (selected) {
                    selectEditIngredientFromSuggestion(selected.dataset.id, selected.dataset.nom);
                    editAddIngredientBtn.click();
                }
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const items = editIngredientSuggestions.querySelectorAll('.ingredient-suggestion-item');
                const selected = editIngredientSuggestions.querySelector('.selected');
                if (items.length === 0) return;
                
                let newIndex = 0;
                if (selected) {
                    selected.classList.remove('selected');
                    const currentIndex = Array.from(items).indexOf(selected);
                    if (e.key === 'ArrowDown') {
                        newIndex = (currentIndex + 1) % items.length;
                    } else {
                        newIndex = (currentIndex - 1 + items.length) % items.length;
                    }
                }
                items[newIndex].classList.add('selected');
            }
        });
        
        // Fermer les suggestions si on clique ailleurs
        document.addEventListener('click', (e) => {
            if (!editIngredientSearch.contains(e.target) && !editIngredientSuggestions.contains(e.target)) {
                editIngredientSuggestions.style.display = 'none';
            }
        });
    }
    
    if (editAddIngredientBtn) {
        editAddIngredientBtn.addEventListener('click', () => {
            if (editSelectedIngredient) {
                editIngredientsList.push({
                    ingredient_id: editSelectedIngredient.id,
                    nom: editSelectedIngredient.nom
                });
                
                renderEditIngredientsList();
                editIngredientSearch.value = '';
                editSelectedIngredient = null;
                editIngredientSuggestions.style.display = 'none';
            }
        });
    }
    
    // Ouvrir le modal pour éditer un menu
    menuCells.forEach(cell => {
        cell.addEventListener('click', function() {
            const jour = this.dataset.jour;
            const moment = this.dataset.moment;
            
            document.getElementById('menu-jour').value = jour;
            document.getElementById('menu-moment').value = moment;
            
            // Récupérer le contenu actuel si présent
            const content = this.querySelector('.menu-content');
            const menuData = this.dataset.menuId;
            const recetteId = this.dataset.recetteId;
            const recetteNom = content && !content.classList.contains('empty') ? content.textContent.trim() : '';
            
            // Réinitialiser le formulaire
            menuRecetteSearch.value = '';
            menuRecetteInput.value = '';
            currentMenuId = menuData || null;
            
            if (recetteId && recetteNom) {
                menuRecetteSearch.value = recetteNom;
                menuRecetteInput.value = recetteId;
            }
            
            // Afficher/masquer le bouton supprimer
            if (currentMenuId) {
                deleteBtn.style.display = 'inline-block';
            } else {
                deleteBtn.style.display = 'none';
            }
            
            // Afficher/masquer le bouton modifier recette
            const editRecipeBtn = document.getElementById('edit-recipe-btn');
            if (editRecipeBtn) {
                if (recetteId) {
                    editRecipeBtn.style.display = 'flex';
                } else {
                    editRecipeBtn.style.display = 'none';
                }
            }
            
            showModal('menu-modal');
        });
    });
    
    // Supprimer un menu
    const createRecipeBtn = document.getElementById('create-recipe-btn');
    if (createRecipeBtn) {
        createRecipeBtn.addEventListener('click', () => {
            // Réinitialiser la liste des ingrédients
            ingredientsList = [];
            renderIngredientsList();
            // Ouvrir le modal de création de recette
            showModal('recette-modal');
        });
    }
    
    // Gestion du bouton modifier recette
    const editRecipeBtn = document.getElementById('edit-recipe-btn');
    
    if (editRecipeBtn) {
        // Gérer le clic sur le bouton modifier
        editRecipeBtn.addEventListener('click', async function() {
            const recetteId = menuRecetteInput.value;
            if (!recetteId) return;
            
            try {
                const response = await fetch(`/api/recette/${recetteId}`);
                const result = await response.json();
                
                if (response.ok && result.success) {
                    const recette = result.recette;
                    
                    // Remplir le formulaire de modification
                    document.getElementById('edit-recette-id').value = recette.id;
                    document.getElementById('edit-recette-nom').value = recette.nom;
                    document.getElementById('edit-recette-description').value = recette.description || '';
                    
                    // Charger les ingrédients
                    editIngredientsList = recette.ingredients.map(ing => ({
                        ingredient_id: ing.ingredient_id,
                        nom: ing.ingredient_nom
                    }));
                    renderEditIngredientsList();
                    
                    // Ouvrir le modal de modification
                    showModal('edit-recette-modal');
                } else {
                    showNotification('Erreur lors du chargement de la recette', 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showNotification('Erreur lors du chargement de la recette', 'error');
            }
        });
    }
    
    // Supprimer un menu
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (!currentMenuId || !confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) {
                return;
            }
            
            try {
                const result = await apiRequest(`/api/menu/${currentMenuId}`, 'DELETE');
                if (result.success) {
                    showNotification('Menu supprimé avec succès !', 'success');
                    setTimeout(() => location.reload(), 1500);
                }
            } catch (error) {
                showNotification('Erreur lors de la suppression du menu', 'error');
            }
        });
    }
    
    // Soumettre le formulaire
    if (menuForm) {
        menuForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const recetteId = document.getElementById('menu-recette').value;
            
            // Validation: une recette doit être sélectionnée
            if (!recetteId) {
                showNotification('Veuillez sélectionner une recette', 'error');
                return;
            }
            
            const data = {
                jour: document.getElementById('menu-jour').value,
                moment: document.getElementById('menu-moment').value,
                semaine: document.getElementById('menu-semaine').value,
                recette_id: parseInt(recetteId)
            };
            
            try {
                const response = await fetch('/api/menu', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Menu sauvegardé avec succès !', 'success');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showNotification(result.message || 'Erreur lors de la sauvegarde', 'error');
                }
            } catch (error) {
                showNotification('Erreur lors de la sauvegarde du menu', 'error');
            }
        });
    }
    
    // Navigation entre semaines
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');
    
    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const currentWeek = parseInt(urlParams.get('week') || '0');
            window.location.href = '/?week=' + (currentWeek - 1);
        });
    }
    
    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const currentWeek = parseInt(urlParams.get('week') || '0');
            window.location.href = '/?week=' + (currentWeek + 1);
        });
    }
    
    // Gestion du drag and drop pour déplacer les menus
    let draggedElement = null;
    let draggedMenuId = null;
    
    // Événement dragstart - quand on commence à déplacer
    menuCells.forEach(cell => {
        cell.addEventListener('dragstart', function(e) {
            if (this.hasAttribute('draggable')) {
                draggedElement = this;
                draggedMenuId = this.dataset.menuId;
                this.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', this.innerHTML);
            }
        });
        
        cell.addEventListener('dragend', function(e) {
            this.classList.remove('dragging');
            // Retirer la classe drag-over de toutes les cellules
            menuCells.forEach(c => c.classList.remove('drag-over'));
        });
        
        // Événement dragover - quand on survole une cellule
        cell.addEventListener('dragover', function(e) {
            if (draggedElement) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                this.classList.add('drag-over');
            }
        });
        
        cell.addEventListener('dragleave', function(e) {
            this.classList.remove('drag-over');
        });
        
        // Événement drop - quand on lâche sur une cellule
        cell.addEventListener('drop', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            this.classList.remove('drag-over');
            
            if (draggedElement && draggedMenuId && draggedElement !== this) {
                const nouveauJour = this.dataset.jour;
                const nouveauMoment = this.dataset.moment;
                
                try {
                    const response = await fetch(`/api/menu/${draggedMenuId}/move`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            jour: nouveauJour,
                            moment: nouveauMoment
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        showNotification('Menu déplacé avec succès !', 'success');
                        setTimeout(() => location.reload(), 800);
                    } else {
                        showNotification(result.message || 'Erreur lors du déplacement', 'error');
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    showNotification('Erreur lors du déplacement du menu', 'error');
                }
            }
            
            draggedElement = null;
            draggedMenuId = null;
        });
    });
    
    // Gestion du formulaire de création de recette
    const recetteForm = document.getElementById('recette-form');
    const cancelRecetteBtn = document.getElementById('cancel-recette');
    
    if (cancelRecetteBtn) {
        cancelRecetteBtn.addEventListener('click', () => {
            hideModal('recette-modal');
            recetteForm.reset();
        });
    }
    
    if (recetteForm) {
        recetteForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const data = {
                nom: document.getElementById('recette-nom').value,
                description: document.getElementById('recette-description').value,
                ingredients: ingredientsList.map(ing => ({
                    ingredient_id: ing.ingredient_id
                }))
            };
            
            try {
                const response = await fetch('/api/recette', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    showNotification('Recette créée avec succès !', 'success');
                    
                    // Recharger la liste des recettes
                    await loadAllRecettes();
                    
                    // Sélectionner automatiquement la nouvelle recette
                    menuRecetteSearch.value = result.recette.nom;
                    menuRecetteInput.value = result.recette.id;
                    
                    // Afficher le bouton modifier
                    const editRecipeBtn = document.getElementById('edit-recipe-btn');
                    if (editRecipeBtn) {
                        editRecipeBtn.style.display = 'flex';
                    }
                    
                    // Fermer le modal de création
                    hideModal('recette-modal');
                    recetteForm.reset();
                    ingredientsList = [];
                    renderIngredientsList();
                    
                    // Soumettre automatiquement le formulaire du menu pour enregistrer
                    const menuFormElement = document.getElementById('menu-form');
                    if (menuFormElement) {
                        // Déclencher la soumission du formulaire menu
                        menuFormElement.dispatchEvent(new Event('submit'));
                    }
                } else {
                    showNotification(result.message || 'Erreur lors de la création de la recette', 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showNotification('Erreur lors de la création de la recette', 'error');
            }
        });
    }
    
    // Gestion du formulaire de modification de recette
    const editRecetteForm = document.getElementById('edit-recette-form');
    const cancelEditRecetteBtn = document.getElementById('cancel-edit-recette');
    
    if (cancelEditRecetteBtn) {
        cancelEditRecetteBtn.addEventListener('click', () => {
            hideModal('edit-recette-modal');
            editRecetteForm.reset();
        });
    }
    
    if (editRecetteForm) {
        editRecetteForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const recetteId = document.getElementById('edit-recette-id').value;
            
            const data = {
                nom: document.getElementById('edit-recette-nom').value,
                description: document.getElementById('edit-recette-description').value,
                ingredients: editIngredientsList.map(ing => ({
                    ingredient_id: ing.ingredient_id
                }))
            };
            
            try {
                const response = await fetch(`/api/recette/${recetteId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    showNotification('Recette modifiée avec succès !', 'success');
                    
                    // Mettre à jour le nom dans la liste déroulante
                    const selectMenu = document.getElementById('menu-recette');
                    const option = selectMenu.querySelector(`option[value="${recetteId}"]`);
                    if (option) {
                        option.textContent = data.nom;
                    }
                    
                    // Fermer le modal de modification
                    hideModal('edit-recette-modal');
                    editRecetteForm.reset();
                    editIngredientsList = [];
                    renderEditIngredientsList();
                    
                    // Fermer aussi le modal du menu
                    hideModal('menu-modal');
                } else {
                    showNotification(result.message || 'Erreur lors de la modification de la recette', 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showNotification('Erreur lors de la modification de la recette', 'error');
            }
        });
    }
    
    // Gestion de la création d'ingrédient depuis les modals de recettes
    const createIngredientBtn = document.getElementById('create-ingredient-btn');
    const editCreateIngredientBtn = document.getElementById('edit-create-ingredient-btn');
    const ingredientForm = document.getElementById('ingredient-form');
    const cancelIngredientBtn = document.getElementById('cancel-ingredient');
    
    if (createIngredientBtn) {
        createIngredientBtn.addEventListener('click', () => {
            showModal('ingredient-modal');
        });
    }
    
    if (editCreateIngredientBtn) {
        editCreateIngredientBtn.addEventListener('click', () => {
            showModal('ingredient-modal');
        });
    }
    
    if (cancelIngredientBtn) {
        cancelIngredientBtn.addEventListener('click', () => {
            hideModal('ingredient-modal');
            ingredientForm.reset();
        });
    }
    
    if (ingredientForm) {
        ingredientForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const data = {
                nom: document.getElementById('ingredient-nom').value,
                categorie: document.getElementById('ingredient-categorie').value
            };
            
            try {
                const response = await fetch('/api/ingredient', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    showNotification('Ingrédient créé avec succès !', 'success');
                    
                    // Recharger la liste des ingrédients
                    await loadAllIngredients();
                    
                    // Fermer le modal et réinitialiser le formulaire
                    hideModal('ingredient-modal');
                    ingredientForm.reset();
                } else {
                    showNotification(result.message || 'Erreur lors de la création de l\'ingrédient', 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showNotification('Erreur lors de la création de l\'ingrédient', 'error');
            }
        });
    }
    
    // Gestion des boutons de fermeture des modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            if (modalId) {
                hideModal(modalId);
            } else {
                // Fermer tous les modals visibles
                document.querySelectorAll('.modal').forEach(modal => {
                    if (modal.style.display === 'flex') {
                        modal.style.display = 'none';
                    }
                });
            }
        });
    });
});
