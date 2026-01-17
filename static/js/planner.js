// Gestion du planificateur de menus
document.addEventListener('DOMContentLoaded', function() {
    const menuCells = document.querySelectorAll('.menu-cell');
    const menuModal = document.getElementById('menu-modal');
    const menuForm = document.getElementById('menu-form');
    const cancelBtn = document.getElementById('cancel-menu');
    const deleteBtn = document.getElementById('delete-menu');
    let currentMenuId = null;
    
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
            
            // Réinitialiser le formulaire
            document.getElementById('menu-recette').value = '';
            document.getElementById('menu-description').value = '';
            currentMenuId = menuData || null;
            
            if (recetteId) {
                document.getElementById('menu-recette').value = recetteId;
            } else if (content && !content.classList.contains('empty')) {
                document.getElementById('menu-description').value = content.textContent.trim();
            }
            
            // Afficher/masquer le bouton supprimer
            if (currentMenuId) {
                deleteBtn.style.display = 'inline-block';
            } else {
                deleteBtn.style.display = 'none';
            }
            
            showModal('menu-modal');
        });
    });
    
    // Annuler l'édition
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            hideModal('menu-modal');
            menuForm.reset();
            currentMenuId = null;
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
            const description = document.getElementById('menu-description').value;
            
            const data = {
                jour: document.getElementById('menu-jour').value,
                moment: document.getElementById('menu-moment').value,
                semaine: document.getElementById('menu-semaine').value,
                recette_id: recetteId ? parseInt(recetteId) : null,
                description: !recetteId ? description : null
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
});
