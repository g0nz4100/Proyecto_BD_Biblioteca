/**
 * Django Messages Handler
 * Maneja la visualización de mensajes de Django como notificaciones
 */

window.DjangoMessages = {
    /**
     * Mostrar mensajes de Django
     * @param {Array} messages - Array de mensajes con formato {tags: string, message: string}
     */
    show: function(messages) {
        if (!messages || messages.length === 0) return;
        
        messages.forEach(function(msg) {
            const duration = this.getDuration(msg.tags);
            
            switch(msg.tags) {
                case 'success':
                    showSuccess(msg.message, duration);
                    break;
                case 'error':
                    showError(msg.message, duration);
                    break;
                case 'warning':
                    showWarning(msg.message, duration);
                    break;
                default:
                    showInfo(msg.message, duration);
            }
        }.bind(this));
    },
    
    /**
     * Obtener duración según el tipo de mensaje
     * @param {string} tag - Tipo de mensaje
     * @returns {number} Duración en milisegundos
     */
    getDuration: function(tag) {
        const durations = {
            'success': 6000,
            'error': 8000,
            'warning': 7000,
            'info': 5000
        };
        return durations[tag] || 5000;
    }
};