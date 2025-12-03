/**
 * Django Data Handler
 * Maneja datos pasados desde Django templates a JavaScript
 */

window.DjangoData = {
    /**
     * Inicializar datos de Django
     * @param {Object} data - Datos desde Django
     */
    init: function(data) {
        // Almacenar datos globalmente
        window.djangoData = data || {};
        
        // Procesar mensajes si existen
        if (data.messages && Array.isArray(data.messages)) {
            this.processMessages(data.messages);
        }
    },
    
    /**
     * Procesar mensajes de Django
     * @param {Array} messages - Array de mensajes
     */
    processMessages: function(messages) {
        if (window.DjangoMessages) {
            window.DjangoMessages.show(messages);
        }
    },
    
    /**
     * Obtener dato específico
     * @param {string} key - Clave del dato
     * @param {*} defaultValue - Valor por defecto
     * @returns {*} Valor del dato
     */
    get: function(key, defaultValue = null) {
        return window.djangoData[key] || defaultValue;
    }
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Procesar mensajes desde el atributo data-messages del body
    const body = document.body;
    const messagesData = body.getAttribute('data-messages');
    
    if (messagesData) {
        try {
            const messages = JSON.parse(messagesData);
            if (messages && messages.length > 0) {
                // Esperar un poco para que las notificaciones se inicialicen
                setTimeout(() => {
                    window.DjangoData.processMessages(messages);
                }, 100);
            }
        } catch (e) {
            console.error('Error parsing Django messages:', e);
        }
    }
});