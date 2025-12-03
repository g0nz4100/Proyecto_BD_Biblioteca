/**
 * Gestionar Pre-registros JavaScript
 * Funciones para aprobar, rechazar, bloquear y activar usuarios
 */

// Obtener token CSRF
function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

// Función para aprobar pre-registro
function aprobarPreregistro(id) {
    if (confirm('¿Está seguro de aprobar este pre-registro?')) {
        fetch(`/core/aprobar-preregistro/${id}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess('Pre-registro aprobado exitosamente', 3000);
                setTimeout(() => location.reload(), 1500);
            } else {
                showError('Error: ' + data.error, 5000);
            }
        })
        .catch(error => {
            showError('Error de conexión: ' + error.message, 5000);
        });
    }
}

// Función para rechazar pre-registro
function rechazarPreregistro(id) {
    const motivo = prompt('Motivo del rechazo (opcional):');
    if (motivo !== null) {
        fetch(`/core/rechazar-preregistro/${id}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({motivo: motivo})
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showWarning('Pre-registro rechazado', 3000);
                setTimeout(() => location.reload(), 1500);
            } else {
                showError('Error: ' + data.error, 5000);
            }
        })
        .catch(error => {
            showError('Error de conexión: ' + error.message, 5000);
        });
    }
}

// Función para bloquear usuario
function bloquearUsuario(id) {
    const motivo = prompt('Motivo del bloqueo:');
    if (motivo !== null && motivo.trim() !== '') {
        fetch(`/core/bloquear-usuario/${id}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({motivo: motivo})
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showWarning('Usuario bloqueado exitosamente', 3000);
                setTimeout(() => location.reload(), 1500);
            } else {
                showError('Error: ' + data.error, 5000);
            }
        })
        .catch(error => {
            showError('Error de conexión: ' + error.message, 5000);
        });
    }
}

// Función para activar usuario
function activarUsuario(id) {
    if (confirm('¿Está seguro de reactivar este usuario?')) {
        fetch(`/core/activar-usuario/${id}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess('Usuario reactivado exitosamente', 3000);
                setTimeout(() => location.reload(), 1500);
            } else {
                showError('Error: ' + data.error, 5000);
            }
        })
        .catch(error => {
            showError('Error de conexión: ' + error.message, 5000);
        });
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('Gestionar pre-registros JavaScript loaded successfully');
});