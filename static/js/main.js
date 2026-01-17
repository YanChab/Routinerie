// Fonctions utilitaires communes
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Gestion des fermetures de modal
document.addEventListener('DOMContentLoaded', function() {
    // Fermer les modals en cliquant sur le X ou en dehors
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
});

// Fonction pour faire des requêtes API
async function apiRequest(url, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        return await response.json();
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
}
