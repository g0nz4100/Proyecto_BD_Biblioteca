// ==========================================
// HOME PAGE - CAROUSEL FUNCTIONALITY
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar carousel con configuración personalizada
    const heroCarousel = document.getElementById('heroCarousel');
    
    if (heroCarousel) {
        // Configurar Bootstrap carousel con intervalo de 5 segundos
        const carousel = new bootstrap.Carousel(heroCarousel, {
            interval: 5000, // 5 segundos
            wrap: true,     // Ciclo infinito
            pause: 'hover', // Pausar al hacer hover
            ride: 'carousel' // Iniciar automáticamente
        });

        // Agregar efectos de transición suaves
        heroCarousel.addEventListener('slide.bs.carousel', function (e) {
            const activeItem = e.target.querySelector('.carousel-item.active');
            const nextItem = e.relatedTarget;
            
            // Agregar clase de animación
            if (nextItem) {
                nextItem.style.opacity = '0';
                setTimeout(() => {
                    nextItem.style.opacity = '1';
                }, 50);
            }
        });

        // Pausar carousel cuando la ventana no está visible
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                carousel.pause();
            } else {
                carousel.cycle();
            }
        });

        // Controles de teclado
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                carousel.prev();
            } else if (e.key === 'ArrowRight') {
                carousel.next();
            }
        });
    }
});

// Función para precargar imágenes del carousel
function preloadCarouselImages() {
    const images = [
        '/static/images/carousel/biblioteca-1.jpg',
        '/static/images/carousel/biblioteca-2.jpg',
        '/static/images/carousel/biblioteca-3.jpg',
        '/static/images/carousel/estudiantes-1.jpg'
    ];

    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Precargar imágenes cuando se carga la página
preloadCarouselImages();