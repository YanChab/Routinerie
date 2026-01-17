// Gestion du planificateur de menus
document.addEventListener('DOMContentLoaded', function() {
    const menuCells = document.querySelectorAll('.menu-cell');
    const menuModal = document.getElementById('menu-modal');
    const menuForm = document.getElementById('menu-form');
    const cancelBtn = document.getElementById('cancel-menu');
    
    // Ouvrir le modal pour éditer un menu
    menuCells.forEach(cell => {
        cell.addEventListener('click', function() {
            const jour = this.dataset.jour;
            const moment = this.dataset.moment;
            
            document.getElementById('menu-jour').value = jour;
            document.getElementById('menu-moment').value = moment;
            
            // Récupérer le contenu actuel si présent
            const content = this.querySelector('.menu-content');
            if (content && !content.classList.contains('empty')) {
                document.getElementById('menu-description').value = content.textContent.trim();
            } else {
                document.getElementById('menu-description').value = '';
            }
            
            showModal('menu-modal');
        });
    });
    
    // Annuler l'édition
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            hideModal('menu-modal');
            menuForm.reset();
        });
    }
    
    // Soumettre le formulaire
    if (menuForm) {
        menuForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const data = {
                jour: document.getElementById('menu-jour').value,
                moment: document.getElementById('menu-moment').value,
                semaine: document.getElementById('menu-semaine').value,
                description: document.getElementById('menu-description').value,
                recette_id: null // Pour l'instant, pas de recette associée
            };
            
            try {
                const result = await apiRequest('/api/menu', 'POST', data);
                if (result.success) {
                    // Recharger la page pour voir les changements
                    location.reload();
                }
            } catch (error) {
                alert('Erreur lors de la sauvegarde du menu');
            }
        });
    }
    
    // Navigation entre semaines
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');
    
    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', () => {
            // TODO: Implémenter la navigation
            alert('Fonctionnalité à venir');
        });
    }
    
    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', () => {
            // TODO: Implémenter la navigation
            alert('Fonctionnalité à venir');
        });
    }
});
