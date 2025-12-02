/**
 * ==========================================
 * JAVASCRIPT PRINCIPAL - BIBLIOTECA UNIVERSITARIA
 * ==========================================
 */

// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Biblioteca Universitaria - Sistema iniciado');
    
    // Inicializar componentes
    initializeComponents();
});

/**
 * Inicializar componentes de la página
 */
function initializeComponents() {
    // Animación suave para scroll
    initializeSmoothScroll();
    
    // Efectos de hover para cards
    initializeCardEffects();
}

/**
 * Scroll suave para enlaces internos
 */
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Efectos adicionales para cards
 */
function initializeCardEffects() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

/**
 * Función para mostrar notificaciones
 */
function showNotification(message, type = 'info') {
    // Implementar sistema de notificaciones
    console.log(`${type.toUpperCase()}: ${message}`);
}