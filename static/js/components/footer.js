// ==========================================
// FOOTER COMPONENT JAVASCRIPT
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Agregar animaciones al footer cuando sea visible
    const footer = document.querySelector('footer');
    
    if (footer) {
        // Observador de intersección para animar el footer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('footer-animate');
                }
            });
        }, {
            threshold: 0.1
        });
        
        observer.observe(footer);
        
        // Efectos hover mejorados para los enlaces
        const footerLinks = footer.querySelectorAll('a');
        footerLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(5px)';
            });
            
            link.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0)';
            });
        });
        
        // Efecto de pulso para los badges de contacto
        const badges = footer.querySelectorAll('.badge');
        badges.forEach(badge => {
            badge.addEventListener('mouseenter', function() {
                this.classList.add('footer-badge');
            });
        });
    }
});

// Función para mostrar información de contacto
function showContactInfo(type) {
    const messages = {
        phone: '¡Llámanos! Estamos disponibles de Lunes a Viernes de 8:00 a 20:00',
        email: '¡Escríbenos! Te responderemos en menos de 24 horas',
        location: '¡Visítanos! Estamos en el Campus Universitario de La Paz'
    };
    
    if (messages[type]) {
        // Crear tooltip o mostrar mensaje
        console.log(messages[type]);
    }
}