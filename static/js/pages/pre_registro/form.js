/* ==========================================
   PRE-REGISTRO FORM JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // Funcionalidad para mostrar/ocultar contraseña
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('id_password');
    const togglePasswordIcon = document.getElementById('togglePasswordIcon');
    
    if (togglePassword && passwordInput && togglePasswordIcon) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Cambiar icono
            if (type === 'text') {
                togglePasswordIcon.classList.remove('fa-eye');
                togglePasswordIcon.classList.add('fa-eye-slash');
            } else {
                togglePasswordIcon.classList.remove('fa-eye-slash');
                togglePasswordIcon.classList.add('fa-eye');
            }
        });
    }
    
    // Validación básica del formulario
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            let emptyFields = [];
            
            requiredFields.forEach(field => {
                let fieldValid = true;
                
                // Validar según el tipo de campo
                if (field.type === 'radio') {
                    // Para radio buttons, verificar si alguno del grupo está seleccionado
                    const radioGroup = form.querySelectorAll(`input[name="${field.name}"]`);
                    const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                    if (!isChecked) {
                        fieldValid = false;
                        // Marcar todo el grupo como inválido
                        radioGroup.forEach(radio => radio.classList.add('is-invalid'));
                    } else {
                        radioGroup.forEach(radio => radio.classList.remove('is-invalid'));
                    }
                } else if (field.type === 'checkbox') {
                    // Para checkboxes
                    if (!field.checked) {
                        fieldValid = false;
                        field.classList.add('is-invalid');
                    } else {
                        field.classList.remove('is-invalid');
                    }
                } else {
                    // Para campos de texto, select, etc.
                    if (!field.value.trim()) {
                        fieldValid = false;
                        field.classList.add('is-invalid');
                    } else {
                        field.classList.remove('is-invalid');
                    }
                }
                
                if (!fieldValid) {
                    isValid = false;
                    // Obtener el label del campo para el mensaje
                    const label = form.querySelector(`label[for="${field.id}"]`);
                    const fieldName = label ? label.textContent.replace('*', '').trim() : field.name;
                    emptyFields.push(fieldName);
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                
                // Mostrar alerta de error con detalles
                let errorMessage = 'Por favor, completa los siguientes campos obligatorios:';
                if (emptyFields.length > 0) {
                    errorMessage += '\n\u2022 ' + emptyFields.slice(0, 5).join('\n\u2022 ');
                    if (emptyFields.length > 5) {
                        errorMessage += '\n... y ' + (emptyFields.length - 5) + ' campos más';
                    }
                }
                
                if (window.showError) {
                    showError(errorMessage, 8000);
                } else {
                    alert(errorMessage);
                }
                
                // Hacer scroll al primer campo con error
                const firstError = form.querySelector('.is-invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            }
        });
    }
    
    console.log('Pre-registro form JavaScript loaded');
});