/**
 * Sistema de Notificaciones para la Biblioteca
 * Muestra alertas elegantes con auto-ocultado
 */

class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Crear contenedor de notificaciones si no existe
        if (!document.getElementById('notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('notification-container');
        }
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = this.getIcon(type);
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="${icon} notification-icon"></i>
                <div class="notification-message">${message}</div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-progress">
                <div class="notification-progress-bar" style="animation-duration: ${duration}ms;"></div>
            </div>
        `;

        this.container.appendChild(notification);

        // Auto-remover después del tiempo especificado
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add('notification-fade-out');
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);

        return notification;
    }

    getIcon(type) {
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        return icons[type] || icons['info'];
    }

    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 7000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }

    // Mostrar errores de formulario de Django
    showFormErrors(errors) {
        if (typeof errors === 'object') {
            for (const [field, messages] of Object.entries(errors)) {
                if (Array.isArray(messages)) {
                    messages.forEach(message => {
                        this.error(`${field}: ${message}`);
                    });
                } else {
                    this.error(`${field}: ${messages}`);
                }
            }
        } else {
            this.error(errors);
        }
    }
}

// Crear instancia global
window.notifications = new NotificationSystem();

// Funciones de conveniencia globales
window.showSuccess = (message, duration) => notifications.success(message, duration);
window.showError = (message, duration) => notifications.error(message, duration);
window.showWarning = (message, duration) => notifications.warning(message, duration);
window.showInfo = (message, duration) => notifications.info(message, duration);