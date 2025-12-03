/**
 * Theme Toggle Component
 * Maneja el cambio entre tema claro y oscuro
 */

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;
    
    if (!themeToggle || !themeIcon) return;
    
    // Verificar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        body.setAttribute('data-bs-theme', 'dark');
        themeIcon.className = 'fas fa-sun me-1';
    }
    
    // Event listener para cambio de tema
    themeToggle.addEventListener('click', function() {
        const currentTheme = body.getAttribute('data-bs-theme');
        
        if (currentTheme === 'dark') {
            body.setAttribute('data-bs-theme', 'light');
            themeIcon.className = 'fas fa-moon me-1';
            localStorage.setItem('theme', 'light');
        } else {
            body.setAttribute('data-bs-theme', 'dark');
            themeIcon.className = 'fas fa-sun me-1';
            localStorage.setItem('theme', 'dark');
        }
    });
});