// ============================================
// Analyse d'équilibre nutritionnel
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Charger les analyses d'équilibre pour tous les menus au chargement de la page
    async function loadEquilibreAnalyses() {
        const badges = document.querySelectorAll('.equilibre-badge');
        const menuIds = Array.from(badges).map(badge => badge.dataset.menuId).filter(id => id);
        
        if (menuIds.length === 0) return;
        
        try {
            const response = await apiRequest('/api/menus/equilibre', 'POST', { menu_ids: menuIds });
            
            if (response.success) {
                // Appliquer les analyses à chaque badge
                badges.forEach(badge => {
                    const menuId = badge.dataset.menuId;
                    const analyse = response.analyses[menuId];
                    
                    if (analyse) {
                        updateEquilibreBadge(badge, analyse);
                    }
                });
            }
        } catch (error) {
            console.error('Erreur lors du chargement des analyses d\'équilibre:', error);
        }
    }
    
    // Mettre à jour un badge d'équilibre avec l'analyse
    function updateEquilibreBadge(badge, analyse) {
        const indicator = badge.querySelector('.equilibre-indicator');
        
        // Supprimer les anciennes classes
        badge.classList.remove('equilibre', 'moyen', 'desequilibre', 'vide');
        
        // Ajouter la classe appropriée
        badge.classList.add(analyse.niveau);
        
        // Mettre à jour l'icône
        const icones = {
            'equilibre': '✓',
            'moyen': '○',
            'desequilibre': '✗',
            'vide': '−'
        };
        indicator.textContent = icones[analyse.niveau] || '?';
        
        // Ajouter le tooltip
        badge.title = createTooltipText(analyse);
        
        // Ajouter les événements pour le tooltip personnalisé
        setupTooltipEvents(badge, analyse);
    }
    
    // Créer le texte du tooltip
    function createTooltipText(analyse) {
        let text = `${analyse.message}\n`;
        
        if (analyse.categories && analyse.categories.length > 0) {
            text += `\nCatégories présentes:\n`;
            analyse.categories.forEach(cat => {
                text += `• ${cat}\n`;
            });
        }
        
        if (analyse.manque && analyse.manque.length > 0) {
            text += `\nManque:\n`;
            analyse.manque.forEach(cat => {
                text += `• ${cat}\n`;
            });
        }
        
        return text;
    }
    
    // Configurer les événements de tooltip personnalisé
    let currentTooltip = null;
    
    function setupTooltipEvents(badge, analyse) {
        badge.addEventListener('mouseenter', (e) => {
            showCustomTooltip(e, badge, analyse);
        });
        
        badge.addEventListener('mouseleave', () => {
            hideCustomTooltip();
        });
    }
    
    function showCustomTooltip(event, badge, analyse) {
        // Supprimer l'ancien tooltip s'il existe
        hideCustomTooltip();
        
        // Créer le tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'equilibre-tooltip';
        
        let html = `<h4>${analyse.message}</h4>`;
        
        if (analyse.categories && analyse.categories.length > 0) {
            html += `<div style="margin-top: 0.5rem;"><strong>Présent:</strong></div>`;
            analyse.categories.forEach(cat => {
                html += `<div class="categorie-item presente-item">✓ ${cat}</div>`;
            });
        }
        
        if (analyse.manque && analyse.manque.length > 0) {
            html += `<div style="margin-top: 0.5rem;"><strong>Manque:</strong></div>`;
            analyse.manque.forEach(cat => {
                html += `<div class="categorie-item manque-item">✗ ${cat}</div>`;
            });
        }
        
        tooltip.innerHTML = html;
        document.body.appendChild(tooltip);
        
        // Positionner le tooltip
        const rect = badge.getBoundingClientRect();
        tooltip.style.position = 'fixed';
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.bottom + 10}px`;
        tooltip.style.transform = 'translateX(-50%)';
        
        currentTooltip = tooltip;
    }
    
    function hideCustomTooltip() {
        if (currentTooltip) {
            currentTooltip.remove();
            currentTooltip = null;
        }
    }
    
    // Charger les analyses au chargement de la page
    loadEquilibreAnalyses();
    
    // Fonction globale pour recharger les analyses (appelée après ajout/modification de menu)
    window.reloadEquilibreAnalyses = loadEquilibreAnalyses;
});
