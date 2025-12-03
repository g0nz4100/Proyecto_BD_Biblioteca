/**
 * ==========================================
 * JAVASCRIPT DASHBOARD SUPERUSUARIO
 * Archivo: dashboard.js
 * Descripción: Funcionalidades principales del dashboard del superusuario
 * ==========================================
 */

// ==========================================
// VARIABLES GLOBALES
// ==========================================
let dashboardData = {
    users: [],
    employees: [],
    admins: [],
    systemConfig: {},
    passwordPolicy: {}
};

// ==========================================
// INICIALIZACIÓN DEL DASHBOARD
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadDashboardData();
    setupEventListeners();
    startRealTimeUpdates();
    
    // Cargar estadísticas inmediatamente
    loadUserStatistics();
    
    // Actualizar cada 30 segundos
    setInterval(loadUserStatistics, 30000);
});

/**
 * Inicializa el dashboard del superusuario
 */
function initializeDashboard() {
    console.log('🚀 Inicializando Dashboard del Superusuario...');
    
    // Animar elementos al cargar
    animateElements();
    
    // Configurar tooltips
    setupTooltips();
    
    // Inicializar contadores animados
    initializeCounters();
    
    // Cargar opciones de formularios
    loadFormOptions();
    
    console.log('✅ Dashboard inicializado correctamente');
}

/**
 * Carga las opciones de los formularios desde la base de datos
 */
async function loadFormOptions() {
    try {
        // Cargar opciones de cargo y turno para el modal de administrador
        // Por ahora usar opciones estáticas, pero se puede conectar con endpoint
        const cargoSelect = document.getElementById('admin_cargo');
        const turnoSelect = document.getElementById('admin_turno');
        
        if (cargoSelect) {
            cargoSelect.innerHTML = `
                <option value="">Seleccionar cargo...</option>
                <option value="C-01">Administrador</option>
                <option value="C-02">Bibliotecario Jefe</option>
                <option value="C-03">Coordinador</option>
            `;
        }
        
        if (turnoSelect) {
            turnoSelect.innerHTML = `
                <option value="">Seleccionar turno...</option>
                <option value="T-01">Mañana</option>
                <option value="T-02">Tarde</option>
                <option value="T-03">Noche</option>
            `;
        }
        
        // Establecer fecha de contratación por defecto (hoy)
        const fechaContratacion = document.getElementById('admin_fecha_contratacion');
        if (fechaContratacion) {
            fechaContratacion.value = new Date().toISOString().split('T')[0];
        }
        
        // Cargar opciones para empleados
        const empCargoSelect = document.getElementById('emp_cargo');
        const empTurnoSelect = document.getElementById('emp_turno');
        
        if (empCargoSelect) {
            empCargoSelect.innerHTML = `
                <option value="">Seleccionar cargo...</option>
                <option value="C-02">Bibliotecario</option>
                <option value="C-03">Asistente de Biblioteca</option>
                <option value="C-04">Coordinador de Servicios</option>
                <option value="C-05">Técnico en Sistemas</option>
            `;
        }
        
        if (empTurnoSelect) {
            empTurnoSelect.innerHTML = `
                <option value="">Seleccionar turno...</option>
                <option value="T-01">Mañana</option>
                <option value="T-02">Tarde</option>
                <option value="T-03">Noche</option>
            `;
        }
        
        // Establecer fecha de contratación por defecto para empleados
        const empFechaContratacion = document.getElementById('emp_fecha_contratacion');
        if (empFechaContratacion) {
            empFechaContratacion.value = new Date().toISOString().split('T')[0];
        }
        
    } catch (error) {
        console.error('❌ Error cargando opciones:', error);
    }
}

/**
 * Carga los datos del dashboard
 */
async function loadDashboardData() {
    try {
        showLoadingOverlay();
        
        // Cargar estadísticas reales del servidor
        await Promise.all([
            loadUserStatistics(),
            loadSystemMetrics(),
            loadRecentActivity()
        ]);
        
        hideLoadingOverlay();
        
    } catch (error) {
        console.error('❌ Error cargando datos del dashboard:', error);
        showNotification('Error cargando datos del dashboard', 'error');
        hideLoadingOverlay();
    }
}

/**
 * Carga las estadísticas de usuarios desde el servidor
 */
async function loadUserStatistics() {
    try {
        const response = await fetch('/superuser/api/estadisticas/', {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCsrfToken()
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                updateDashboardCounters(result.data);
                console.log('✅ Estadísticas actualizadas:', result.data);
            } else {
                console.error('❌ Error en respuesta:', result.error);
            }
        } else {
            console.error('❌ Error HTTP:', response.status);
        }
    } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
    }
}

/**
 * Obtiene el token CSRF
 */
function getCsrfToken() {
    const token = document.querySelector('[name=csrfmiddlewaretoken]');
    return token ? token.value : '';
}

/**
 * Actualiza los contadores del dashboard con datos reales
 */
function updateDashboardCounters(data) {
    console.log('🔄 Actualizando contadores con:', data);
    
    // Actualizar contadores principales
    const counters = {
        'total_usuarios': data.total_usuarios || 0,
        'total_empleados': data.total_empleados || 0,
        'total_libros': data.total_libros || 0,
        'prestamos_activos': data.prestamos_activos || 0,
        'vencidos': data.vencidos || 0
    };
    
    // Actualizar cada contador
    Object.entries(counters).forEach(([key, value]) => {
        const element = document.querySelector(`[data-counter="${key}"]`);
        if (element) {
            console.log(`🔢 Actualizando ${key}: ${value}`);
            animateCounter(element, value);
        } else {
            console.warn(`⚠️ No se encontró elemento para: ${key}`);
        }
    });
    
    // Actualizar pre-registros pendientes si existe
    if (data.preregistros_pendientes !== undefined) {
        const preregistrosElement = document.querySelector('[data-info="preregistros_pendientes"]');
        if (preregistrosElement) {
            preregistrosElement.textContent = data.preregistros_pendientes;
        }
    }
    
    // Actualizar hora de última actualización
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        const now = new Date();
        lastUpdateElement.innerHTML = `<i class="fas fa-clock me-1"></i>Última actualización: ${now.toLocaleTimeString()}`;
    }
}

/**
 * Anima un contador numérico
 */
function animateCounter(element, targetValue) {
    const startValue = parseInt(element.textContent) || 0;
    const duration = 2000;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
    // Botones de período en gráficos
    document.querySelectorAll('[data-period]').forEach(btn => {
        btn.addEventListener('click', function() {
            const period = this.dataset.period;
            updateChartPeriod(period);
            
            // Actualizar botones activos
            document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Formularios de modales
    setupModalForms();
    
    // Botones de acción rápida
    setupQuickActions();
}

/**
 * Configura los formularios de los modales
 */
function setupModalForms() {
    // Validación en tiempo real para formularios
    const forms = document.querySelectorAll('form[id*="Form"]');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            // Validar al perder el foco
            input.addEventListener('blur', function() {
                validateFieldRealTime(this);
            });
            
            // Limpiar errores al escribir
            input.addEventListener('input', function() {
                clearFieldError(this);
                
                // Validación en tiempo real para algunos campos
                if (['ci', 'email', 'username'].includes(this.name)) {
                    // Validar después de un pequeño delay
                    clearTimeout(this.validationTimeout);
                    this.validationTimeout = setTimeout(() => {
                        validateFieldRealTime(this);
                    }, 500);
                }
            });
            
            // Mostrar ayuda al hacer foco
            input.addEventListener('focus', function() {
                const helpText = this.parentNode.querySelector('.form-text');
                if (helpText) {
                    helpText.style.color = '#0d6efd';
                    helpText.style.fontWeight = '500';
                }
            });
            
            // Restaurar ayuda al perder foco
            input.addEventListener('blur', function() {
                const helpText = this.parentNode.querySelector('.form-text');
                if (helpText) {
                    helpText.style.color = '';
                    helpText.style.fontWeight = '';
                }
            });
        });
    });
}

/**
 * Configura las acciones rápidas
 */
function setupQuickActions() {
    // Botón de backup rápido
    const quickBackupBtn = document.querySelector('[onclick="performBackup()"]');
    if (quickBackupBtn) {
        quickBackupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            performBackup();
        });
    }
}

// ==========================================
// FUNCIONES DE GESTIÓN DE USUARIOS
// ==========================================

/**
 * Muestra la lista de usuarios
 */
function showUsersList() {
    Swal.fire({
        title: '<i class="fas fa-users me-2"></i>Lista de Usuarios',
        html: generateUsersListHTML(),
        width: '90%',
        showCloseButton: true,
        showConfirmButton: false,
        customClass: {
            container: 'users-list-modal'
        }
    });
    
    loadUsersData();
}

/**
 * Muestra la lista de empleados
 */
function showEmployeesList() {
    Swal.fire({
        title: '<i class="fas fa-briefcase me-2"></i>Lista de Empleados',
        html: generateEmployeesListHTML(),
        width: '90%',
        showCloseButton: true,
        showConfirmButton: false,
        customClass: {
            container: 'employees-list-modal'
        }
    });
    
    loadEmployeesData();
}

/**
 * Genera HTML para la lista de usuarios
 */
function generateUsersListHTML() {
    return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-primary">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Fecha Registro</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="usersTableBody">
                    <tr>
                        <td colspan="7" class="text-center">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-3">
            <div>
                <select class="form-select form-select-sm" style="width: auto;">
                    <option value="10">10 por página</option>
                    <option value="25">25 por página</option>
                    <option value="50">50 por página</option>
                </select>
            </div>
            <nav>
                <ul class="pagination pagination-sm mb-0">
                    <li class="page-item disabled">
                        <span class="page-link">Anterior</span>
                    </li>
                    <li class="page-item active">
                        <span class="page-link">1</span>
                    </li>
                    <li class="page-item">
                        <a class="page-link" href="#">2</a>
                    </li>
                    <li class="page-item">
                        <a class="page-link" href="#">Siguiente</a>
                    </li>
                </ul>
            </nav>
        </div>
    `;
}

/**
 * Genera HTML para la lista de empleados
 */
function generateEmployeesListHTML() {
    return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-success">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Cargo</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Fecha Ingreso</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="employeesTableBody">
                    <tr>
                        <td colspan="8" class="text-center">
                            <div class="spinner-border text-success" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// ==========================================
// FUNCIONES DE FORMULARIOS
// ==========================================

/**
 * Envía el formulario de agregar administrador
 */
async function submitAdminForm() {
    const form = document.getElementById('addAdminForm');
    const formData = new FormData(form);
    
    try {
        showButtonLoading('Creando administrador...');
        
        // Validar campos requeridos
        const requiredFields = form.querySelectorAll('[required]');
        let missingFields = [];
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                missingFields.push(field.previousElementSibling.textContent.replace('*', '').trim());
                showFieldError(field, '❌ Este campo es obligatorio');
            }
        });
        
        if (missingFields.length > 0) {
            hideButtonLoading();
            
            Swal.fire({
                icon: 'warning',
                title: '⚠️ Campos obligatorios faltantes',
                html: `
                    <p>Por favor, complete los siguientes campos obligatorios:</p>
                    <ul class="text-start">
                        ${missingFields.map(field => `<li><strong>${field}</strong></li>`).join('')}
                    </ul>
                `,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#ffc107'
            });
            return;
        }
        
        // Validar formato de campos
        let hasFormatErrors = false;
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.value.trim() && !validateFieldRealTime(input)) {
                hasFormatErrors = true;
            }
        });
        
        if (hasFormatErrors) {
            hideButtonLoading();
            
            Swal.fire({
                icon: 'error',
                title: '❌ Errores de formato',
                text: 'Por favor, corrija los campos marcados en rojo antes de continuar.',
                confirmButtonText: 'Revisar',
                confirmButtonColor: '#dc3545'
            });
            return;
        }
        
        // Enviar datos al servidor
        const response = await fetch('/superuser/crear-administrador/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addAdminModal'));
            modal.hide();
            
            // Mostrar alerta de éxito detallada
            Swal.fire({
                icon: 'success',
                title: '✅ ¡Administrador creado exitosamente!',
                html: `
                    <div class="text-start">
                        <p><strong>Se ha registrado correctamente en:</strong></p>
                        <ul class="list-unstyled">
                            <li>✓ Tabla <code>persona</code> - Datos personales</li>
                            <li>✓ Tabla <code>usuario</code> - Como administrador</li>
                            <li>✓ Tabla <code>empleado</code> - Datos laborales</li>
                            <li>✓ Usuario Django - Acceso al sistema</li>
                        </ul>
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Próximos pasos:</strong><br>
                            El administrador debe cambiar su contraseña en el primer inicio de sesión.
                        </div>
                    </div>
                `,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#198754',
                timer: 10000,
                timerProgressBar: true
            });
            
            // Limpiar formulario
            form.reset();
            clearAllFieldErrors(form);
            
            // Actualizar estadísticas
            updateDashboardStats();
        } else {
            // Mostrar errores
            if (result.errors) {
                // Limpiar errores previos
                clearAllFieldErrors(form);
                
                // Mostrar errores de validación específicos
                let errorCount = 0;
                for (const [field, error] of Object.entries(result.errors)) {
                    const fieldElement = form.querySelector(`[name="${field}"]`);
                    if (fieldElement) {
                        showFieldError(fieldElement, error);
                        errorCount++;
                    }
                }
                
                // Alerta general de errores
                Swal.fire({
                    icon: 'error',
                    title: '❌ Errores en el formulario',
                    html: `Se encontraron <strong>${errorCount} errores</strong> en el formulario.<br>Por favor, corrija los campos marcados en rojo.`,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#dc3545'
                });
            } else {
                // Error general del servidor
                Swal.fire({
                    icon: 'error',
                    title: '❌ Error del servidor',
                    text: result.error || 'Error desconocido al crear administrador',
                    confirmButtonText: 'Intentar nuevamente',
                    confirmButtonColor: '#dc3545'
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Error creando administrador:', error);
        showErrorAlert(error, formData);
    }
}

/**
 * Envía el formulario de agregar empleado
 */
async function submitEmployeeForm() {
    const form = document.getElementById('addEmployeeForm');
    const formData = new FormData(form);
    
    try {
        showButtonLoading('Creando empleado...');
        
        // Validar formulario
        if (!validateForm(form)) {
            hideButtonLoading();
            return;
        }
        
        // Simular envío (reemplazar con AJAX real)
        await simulateAPICall(2000);
        
        // Cerrar modal y mostrar éxito
        const modal = bootstrap.Modal.getInstance(document.getElementById('addEmployeeModal'));
        modal.hide();
        
        showNotification('Empleado creado exitosamente', 'success');
        form.reset();
        
        // Actualizar estadísticas
        updateDashboardStats();
        
    } catch (error) {
        console.error('❌ Error creando empleado:', error);
        showNotification('Error al crear empleado', 'error');
    } finally {
        hideButtonLoading();
    }
}

// ==========================================
// FUNCIONES DE CONFIGURACIÓN
// ==========================================

/**
 * Guarda la configuración de políticas de contraseña
 */
async function savePasswordPolicy() {
    const form = document.getElementById('passwordPolicyForm');
    const formData = new FormData(form);
    
    try {
        showButtonLoading('Guardando configuración...');
        
        // Recopilar datos del formulario
        const policyData = {
            min_length: parseInt(formData.get('min_length')),
            max_length: parseInt(formData.get('max_length')),
            require_uppercase: formData.get('require_uppercase') === 'on',
            require_lowercase: formData.get('require_lowercase') === 'on',
            require_numbers: formData.get('require_numbers') === 'on',
            require_special: formData.get('require_special') === 'on',
            password_expiry: parseInt(formData.get('password_expiry')),
            max_attempts: parseInt(formData.get('max_attempts')),
            lockout_duration: parseInt(formData.get('lockout_duration')),
            history_count: parseInt(formData.get('history_count')),
            force_change_first_login: formData.get('force_change_first_login') === 'on'
        };
        
        // Enviar al servidor
        const response = await fetch('/superuser/api/politicas-password/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify(policyData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Cerrar modal y mostrar éxito
            const modal = bootstrap.Modal.getInstance(document.getElementById('passwordPolicyModal'));
            modal.hide();
            
            showNotification('Políticas de contraseña actualizadas exitosamente', 'success');
            
            // Guardar en variable global
            dashboardData.passwordPolicy = policyData;
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('❌ Error guardando políticas:', error);
        showNotification('Error al guardar configuración: ' + error.message, 'error');
    } finally {
        hideButtonLoading();
    }
}

/**
 * Guarda la configuración general del sistema
 */
async function saveSystemConfig() {
    const form = document.getElementById('systemConfigForm');
    const formData = new FormData(form);
    
    try {
        showButtonLoading('Guardando configuración...');
        
        // Recopilar datos del formulario
        const configData = {
            nombre_sistema: formData.get('nombre_sistema'),
            email_admin: formData.get('email_admin'),
            timezone: formData.get('timezone'),
            idioma: formData.get('idioma'),
            mantenimiento: formData.get('mantenimiento') === 'on',
            registro_publico: formData.get('registro_publico') === 'on',
            notificaciones_email: formData.get('notificaciones_email') === 'on',
            backup_automatico: formData.get('backup_automatico') === 'on',
            logs_detallados: formData.get('logs_detallados') === 'on'
        };
        
        // Enviar al servidor
        const response = await fetch('/superuser/api/configuracion-sistema/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify(configData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Cerrar modal y mostrar éxito
            const modal = bootstrap.Modal.getInstance(document.getElementById('systemConfigModal'));
            modal.hide();
            
            showNotification('Configuración del sistema actualizada exitosamente', 'success');
            
            // Guardar en variable global
            dashboardData.systemConfig = configData;
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('❌ Error guardando configuración:', error);
        showNotification('Error al guardar configuración: ' + error.message, 'error');
    } finally {
        hideButtonLoading();
    }
}

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

/**
 * Alterna la visibilidad de contraseñas
 */
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.classList.remove('fa-eye');
        button.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        button.classList.remove('fa-eye-slash');
        button.classList.add('fa-eye');
    }
}

/**
 * Valida un campo individual
 */
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Limpiar errores previos
    clearFieldError(field);
    
    // Validaciones específicas
    switch (fieldName) {
        case 'email':
            if (value && !isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Email no válido';
            }
            break;
        case 'ci':
            if (value && !isValidCI(value)) {
                isValid = false;
                errorMessage = 'Cédula de identidad no válida';
            }
            break;
        case 'telefono':
            if (value && !isValidPhone(value)) {
                isValid = false;
                errorMessage = 'Teléfono no válido';
            }
            break;
        case 'password':
            if (value && !isValidPassword(value)) {
                isValid = false;
                errorMessage = 'Contraseña no cumple los requisitos';
            }
            break;
    }
    
    // Mostrar error si existe
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

/**
 * Valida un formulario completo
 */
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'Este campo es obligatorio');
            isValid = false;
        } else {
            if (!validateField(field)) {
                isValid = false;
            }
        }
    });
    
    return isValid;
}

/**
 * Muestra error en un campo
 */
function showFieldError(field, message) {
    field.classList.add('is-invalid');
    
    let errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        field.parentNode.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
}

/**
 * Limpia el error de un campo
 */
function clearFieldError(field) {
    field.classList.remove('is-invalid');
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * Limpia todos los errores de un formulario
 */
function clearAllFieldErrors(form) {
    const invalidFields = form.querySelectorAll('.is-invalid');
    invalidFields.forEach(field => {
        clearFieldError(field);
    });
}

/**
 * Valida un campo en tiempo real
 */
function validateFieldRealTime(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Limpiar error previo
    clearFieldError(field);
    
    // Validaciones específicas
    switch (fieldName) {
        case 'ci':
            if (value && !/^[0-9]{6,15}$/.test(value)) {
                showFieldError(field, '❌ CI debe tener entre 6 y 15 dígitos');
                return false;
            }
            break;
        case 'nombres':
        case 'paterno':
            if (value && !/^[A-Za-zÁ-úa-ú\s]{2,50}$/.test(value)) {
                showFieldError(field, '❌ Solo letras y espacios, mínimo 2 caracteres');
                return false;
            }
            break;
        case 'email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                showFieldError(field, '❌ Formato de email inválido');
                return false;
            }
            break;
        case 'telefono':
            if (value && !/^[0-9]{7,15}$/.test(value)) {
                showFieldError(field, '❌ Teléfono debe tener entre 7 y 15 dígitos');
                return false;
            }
            break;
        case 'username':
            if (value && !/^[a-zA-Z0-9_]{4,30}$/.test(value)) {
                showFieldError(field, '❌ Solo letras, números y guiones bajos (4-30 caracteres)');
                return false;
            }
            break;
        case 'password':
            if (value && value.length < 8) {
                showFieldError(field, '❌ Mínimo 8 caracteres');
                return false;
            }
            if (value && !/[A-Za-z]/.test(value)) {
                showFieldError(field, '❌ Debe contener al menos una letra');
                return false;
            }
            if (value && !/[0-9]/.test(value)) {
                showFieldError(field, '❌ Debe contener al menos un número');
                return false;
            }
            break;
    }
    
    return true;
}

/**
 * Simula una llamada a la API
 */
function simulateAPICall(delay = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    });
}

/**
 * Muestra overlay de carga
 */
function showLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    overlay.id = 'loadingOverlay';
    document.body.appendChild(overlay);
}

/**
 * Oculta overlay de carga
 */
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

/**
 * Muestra estado de carga en botón
 */
function showButtonLoading(text = 'Cargando...') {
    const buttons = document.querySelectorAll('.modal-footer .btn-primary, .modal-footer .btn-success, .modal-footer .btn-warning, .modal-footer .btn-info');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${text}`;
    });
}

/**
 * Oculta estado de carga en botón
 */
function hideButtonLoading() {
    const buttons = document.querySelectorAll('.modal-footer .btn-primary, .modal-footer .btn-success, .modal-footer .btn-warning, .modal-footer .btn-info');
    buttons.forEach(btn => {
        btn.disabled = false;
        // Restaurar texto original (esto debería mejorarse para recordar el texto original)
        if (btn.innerHTML.includes('spinner')) {
            btn.innerHTML = btn.innerHTML.replace(/<i class="fas fa-spinner fa-spin me-2"><\/i>.*/, 'Guardar');
        }
    });
}

// ==========================================
// FUNCIONES DE VALIDACIÓN
// ==========================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidCI(ci) {
    // Validación básica para CI boliviana
    const ciRegex = /^\d{7,8}$/;
    return ciRegex.test(ci);
}

function isValidPhone(phone) {
    // Validación básica para teléfonos
    const phoneRegex = /^[\d\s\-\+\(\)]{7,15}$/;
    return phoneRegex.test(phone);
}

function isValidPassword(password) {
    // Validación básica de contraseña
    return password.length >= 8;
}

// ==========================================
// FUNCIONES DE ALERTAS AVANZADAS
// ==========================================

/**
 * Actualiza la barra de progreso
 */
function updateProgress(percent, message) {
    const progressBar = document.getElementById('creationProgress');
    const messageEl = document.querySelector('.swal2-html-container span');
    
    if (progressBar) {
        progressBar.style.width = percent + '%';
    }
    if (messageEl) {
        messageEl.textContent = message;
    }
}

/**
 * Validaciones del cliente antes del envío
 */
async function performClientValidation(form) {
    const errors = [];
    const warnings = [];
    
    // Validar campos requeridos
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            errors.push({
                field: field.name,
                message: `${field.previousElementSibling.textContent.replace('*', '').trim()} es obligatorio`,
                element: field
            });
        }
    });
    
    // Validar formatos
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.value.trim() && !validateFieldRealTime(input)) {
            errors.push({
                field: input.name,
                message: `Formato inválido en ${input.previousElementSibling.textContent.replace('*', '').trim()}`,
                element: input
            });
        }
    });
    
    // Validaciones de seguridad
    const password = form.querySelector('[name="password"]').value;
    if (password && isWeakPassword(password)) {
        warnings.push({
            field: 'password',
            message: 'La contraseña es débil. Considere usar mayúsculas, números y símbolos.'
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Muestra errores de validación
 */
function showValidationErrors(validationResult) {
    const { errors, warnings } = validationResult;
    
    // Marcar campos con errores
    errors.forEach(error => {
        showFieldError(error.element, error.message);
    });
    
    // Mostrar alerta principal
    Swal.fire({
        icon: 'error',
        title: '❌ Formulario incompleto',
        html: `
            <div class="text-start">
                <p><strong>${errors.length} error${errors.length > 1 ? 'es' : ''} encontrado${errors.length > 1 ? 's' : ''}:</strong></p>
                <ul class="list-group list-group-flush">
                    ${errors.map(error => `
                        <li class="list-group-item d-flex align-items-center">
                            <i class="fas fa-times-circle text-danger me-2"></i>
                            ${error.message}
                        </li>
                    `).join('')}
                </ul>
                ${warnings.length > 0 ? `
                    <div class="mt-3">
                        <p><strong>Advertencias:</strong></p>
                        <ul class="list-group list-group-flush">
                            ${warnings.map(warning => `
                                <li class="list-group-item d-flex align-items-center">
                                    <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                                    ${warning.message}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `,
        confirmButtonText: 'Corregir',
        confirmButtonColor: '#dc3545',
        footer: '<small>Los campos marcados en rojo requieren atención</small>'
    });
}

/**
 * Muestra éxito con efectos visuales
 */
function showSuccessWithConfetti(result) {
    // Efecto confetti (si está disponible)
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
    
    Swal.fire({
        icon: 'success',
        title: '🎉 ¡Administrador creado exitosamente!',
        html: `
            <div class="text-start">
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>Registro completado en la base de datos</strong>
                </div>
                
                <div class="row g-2 mb-3">
                    <div class="col-6">
                        <div class="card border-success">
                            <div class="card-body text-center p-2">
                                <i class="fas fa-user text-success"></i>
                                <small class="d-block">Persona</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="card border-success">
                            <div class="card-body text-center p-2">
                                <i class="fas fa-shield-alt text-success"></i>
                                <small class="d-block">Usuario</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="card border-success">
                            <div class="card-body text-center p-2">
                                <i class="fas fa-briefcase text-success"></i>
                                <small class="d-block">Empleado</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="card border-success">
                            <div class="card-body text-center p-2">
                                <i class="fas fa-key text-success"></i>
                                <small class="d-block">Acceso</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="alert alert-info">
                    <i class="fas fa-lightbulb me-2"></i>
                    <strong>Próximos pasos:</strong><br>
                    • El administrador debe cambiar su contraseña<br>
                    • Configurar permisos específicos si es necesario<br>
                    • Enviar credenciales de acceso por email seguro
                </div>
            </div>
        `,
        confirmButtonText: '🚀 Continuar',
        confirmButtonColor: '#198754',
        timer: 15000,
        timerProgressBar: true,
        showClass: {
            popup: 'animate__animated animate__bounceIn'
        }
    });
}

/**
 * Muestra alertas de error inteligentes
 */
function showErrorAlert(error, formData) {
    let errorType = 'connection';
    let errorDetails = '';
    
    // Determinar tipo de error
    if (error.message.includes('HTTP 403')) {
        errorType = 'permission';
    } else if (error.message.includes('HTTP 500')) {
        errorType = 'server';
    } else if (error.message.includes('HTTP 400')) {
        errorType = 'validation';
    } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        errorType = 'network';
    }
    
    const errorConfig = {
        connection: {
            icon: 'error',
            title: '🚫 Error de Conexión',
            html: `
                <div class="alert alert-danger">
                    <i class="fas fa-wifi me-2"></i>
                    No se pudo conectar con el servidor
                </div>
                <p><strong>Posibles soluciones:</strong></p>
                <ul class="text-start">
                    <li>Verificar conexión a internet</li>
                    <li>Recargar la página</li>
                    <li>Intentar en unos minutos</li>
                </ul>
            `,
            showDenyButton: true,
            confirmButtonText: 'Reintentar',
            denyButtonText: 'Guardar borrador',
            confirmButtonColor: '#dc3545'
        },
        permission: {
            icon: 'warning',
            title: '⚠️ Sin Permisos',
            html: `
                <div class="alert alert-warning">
                    <i class="fas fa-lock me-2"></i>
                    No tiene permisos para realizar esta acción
                </div>
                <p>Su sesión puede haber expirado o no tiene los permisos necesarios.</p>
            `,
            confirmButtonText: 'Iniciar sesión',
            confirmButtonColor: '#ffc107'
        },
        server: {
            icon: 'error',
            title: '🔧 Error del Servidor',
            html: `
                <div class="alert alert-danger">
                    <i class="fas fa-server me-2"></i>
                    Error interno del servidor
                </div>
                <p>El problema es temporal. El equipo técnico ha sido notificado.</p>
            `,
            confirmButtonText: 'Reportar problema',
            confirmButtonColor: '#dc3545'
        }
    };
    
    const config = errorConfig[errorType] || errorConfig.connection;
    
    Swal.fire(config).then((result) => {
        if (result.isConfirmed && errorType === 'connection') {
            // Reintentar
            submitAdminForm();
        } else if (result.isDenied) {
            // Guardar borrador
            saveDraft(formData);
        }
    });
}

/**
 * Opción de notificación por email
 */
function showEmailNotificationOption(email) {
    Swal.fire({
        icon: 'question',
        title: '📧 Notificar por Email',
        text: `¿Desea enviar las credenciales de acceso a ${email}?`,
        showCancelButton: true,
        confirmButtonText: 'Sí, enviar',
        cancelButtonText: 'No, ahora no',
        confirmButtonColor: '#0dcaf0'
    }).then((result) => {
        if (result.isConfirmed) {
            sendCredentialsEmail(email);
        }
    });
}

/**
 * Verifica si una contraseña es débil
 */
function isWeakPassword(password) {
    const weakPatterns = [
        /^123456/,
        /^password/i,
        /^admin/i,
        /^qwerty/i
    ];
    
    return weakPatterns.some(pattern => pattern.test(password)) || 
           password.length < 8 || 
           !/[A-Z]/.test(password) || 
           !/[0-9]/.test(password);
}

/**
 * Guarda borrador del formulario
 */
function saveDraft(formData) {
    localStorage.setItem('adminDraft', JSON.stringify(Object.fromEntries(formData)));
    showNotification('Borrador guardado localmente', 'info');
}

/**
 * Envía credenciales por email
 */
async function sendCredentialsEmail(email) {
    try {
        // Simular envío de email
        await simulateAPICall(1500);
        showNotification(`Credenciales enviadas a ${email}`, 'success');
    } catch (error) {
        showNotification('Error al enviar email', 'error');
    }
}

/**
 * Confirmación antes de crear administrador
 */
function confirmAdminCreation() {
    const form = document.getElementById('addAdminForm');
    const nombres = form.querySelector('[name="nombres"]').value;
    const paterno = form.querySelector('[name="paterno"]').value;
    const email = form.querySelector('[name="email"]').value;
    const cargo = form.querySelector('[name="id_cargo"] option:checked').text;
    
    Swal.fire({
        icon: 'question',
        title: '🔍 Confirmar Creación',
        html: `
            <div class="text-start">
                <p><strong>¿Está seguro de crear este administrador?</strong></p>
                
                <div class="card bg-light">
                    <div class="card-body">
                        <h6 class="card-title">👤 ${nombres} ${paterno}</h6>
                        <p class="card-text mb-1">
                            <i class="fas fa-envelope me-2"></i>${email}<br>
                            <i class="fas fa-briefcase me-2"></i>${cargo}
                        </p>
                    </div>
                </div>
                
                <div class="alert alert-warning mt-3">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Importante:</strong> Se creará con permisos de superusuario
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '🚀 Sí, crear',
        cancelButtonText: '❌ Cancelar',
        confirmButtonColor: '#198754',
        cancelButtonColor: '#6c757d',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            submitAdminForm();
        }
    });
}

/**
 * Alerta de sesión por expirar
 */
function showSessionWarning() {
    Swal.fire({
        icon: 'warning',
        title: '⏰ Sesión por Expirar',
        text: 'Su sesión expirará en 5 minutos. ¿Desea extenderla?',
        showCancelButton: true,
        confirmButtonText: 'Extender sesión',
        cancelButtonText: 'Cerrar sesión',
        confirmButtonColor: '#0dcaf0',
        cancelButtonColor: '#dc3545',
        timer: 30000,
        timerProgressBar: true
    }).then((result) => {
        if (result.isConfirmed) {
            extendSession();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            logout();
        }
    });
}

/**
 * Alerta de cambios no guardados
 */
function showUnsavedChangesWarning() {
    return Swal.fire({
        icon: 'warning',
        title: '⚠️ Cambios no Guardados',
        text: 'Tiene cambios sin guardar. ¿Desea salir sin guardar?',
        showCancelButton: true,
        confirmButtonText: 'Salir sin guardar',
        cancelButtonText: 'Continuar editando',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d'
    });
}

/**
 * Alerta de éxito con opciones adicionales
 */
function showSuccessWithOptions(adminData) {
    Swal.fire({
        icon: 'success',
        title: '✅ Administrador Creado',
        html: `
            <p>El administrador <strong>${adminData.nombres}</strong> ha sido creado exitosamente.</p>
            <p>¿Qué desea hacer ahora?</p>
        `,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: '📧 Enviar credenciales',
        denyButtonText: '👥 Crear otro',
        cancelButtonText: '🏠 Ir al dashboard',
        confirmButtonColor: '#0dcaf0',
        denyButtonColor: '#198754'
    }).then((result) => {
        if (result.isConfirmed) {
            sendCredentialsEmail(adminData.email);
        } else if (result.isDenied) {
            // Limpiar formulario para crear otro
            document.getElementById('addAdminForm').reset();
        }
    });
}

/**
 * Notificación toast personalizada
 */
function showToast(message, type = 'info', duration = 3000) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: duration,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });
    
    const icons = {
        success: 'success',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };
    
    Toast.fire({
        icon: icons[type] || 'info',
        title: message
    });
}

// Configurar alertas de sesión
setTimeout(showSessionWarning, 25 * 60 * 1000); // 25 minutos

// Detectar cambios no guardados
let hasUnsavedChanges = false;
window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
});

/**
 * Confirmación antes de crear empleado
 */
function confirmEmployeeCreation() {
    const form = document.getElementById('addEmployeeForm');
    const nombres = form.querySelector('[name="nombres"]').value;
    const paterno = form.querySelector('[name="paterno"]').value;
    const email = form.querySelector('[name="email"]').value;
    const cargo = form.querySelector('[name="id_cargo"] option:checked').text;
    
    Swal.fire({
        icon: 'question',
        title: '🔍 Confirmar Creación de Empleado',
        html: `
            <div class="text-start">
                <p><strong>¿Está seguro de crear este empleado?</strong></p>
                
                <div class="card bg-light">
                    <div class="card-body">
                        <h6 class="card-title">👥 ${nombres} ${paterno}</h6>
                        <p class="card-text mb-1">
                            <i class="fas fa-envelope me-2"></i>${email}<br>
                            <i class="fas fa-briefcase me-2"></i>${cargo}
                        </p>
                    </div>
                </div>
                
                <div class="alert alert-info mt-3">
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>Nota:</strong> Tendrá acceso como empleado (staff, no superusuario)
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '🚀 Sí, crear',
        cancelButtonText: '❌ Cancelar',
        confirmButtonColor: '#198754',
        cancelButtonColor: '#6c757d',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            submitEmployeeForm();
        }
    });
}

/**
 * Envía el formulario de agregar empleado
 */
async function submitEmployeeForm() {
    const form = document.getElementById('addEmployeeForm');
    const formData = new FormData(form);
    
    try {
        // Mostrar alerta de inicio con progreso
        const loadingAlert = Swal.fire({
            title: '🚀 Creando Empleado',
            html: `
                <div class="d-flex align-items-center justify-content-center mb-3">
                    <div class="spinner-border text-success me-3" role="status"></div>
                    <span>Validando datos...</span>
                </div>
                <div class="progress" style="height: 8px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                         style="width: 20%" id="employeeCreationProgress"></div>
                </div>
            `,
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                updateEmployeeProgress(40, 'Verificando unicidad...');
            }
        });
        
        // Pre-validaciones del cliente
        const validationResult = await performEmployeeClientValidation(form);
        if (!validationResult.isValid) {
            Swal.close();
            showValidationErrors(validationResult);
            return;
        }
        
        updateEmployeeProgress(60, 'Enviando al servidor...');
        updateEmployeeProgress(80, 'Procesando en servidor...');
        
        const response = await fetch('/superuser/crear-empleado/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        });
        
        updateEmployeeProgress(90, 'Finalizando...');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        updateEmployeeProgress(100, 'Completado');
        
        if (result.success) {
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addEmployeeModal'));
            modal.hide();
            
            // Animación de éxito
            showEmployeeSuccessWithEffects(result);
            
            // Limpiar formulario
            form.reset();
            clearAllFieldErrors(form);
            
            // Actualizar estadísticas
            updateDashboardStats();
            
            // Opcional: Enviar notificación por email
            setTimeout(() => {
                showEmailNotificationOption(formData.get('email'));
            }, 3000);
        } else {
            // Mostrar errores
            if (result.errors) {
                clearAllFieldErrors(form);
                
                let errorCount = 0;
                for (const [field, error] of Object.entries(result.errors)) {
                    const fieldElement = form.querySelector(`[name="${field}"]`);
                    if (fieldElement) {
                        showFieldError(fieldElement, error);
                        errorCount++;
                    }
                }
                
                Swal.fire({
                    icon: 'error',
                    title: '❌ Errores en el formulario',
                    html: `Se encontraron <strong>${errorCount} errores</strong> en el formulario.<br>Por favor, corrija los campos marcados en rojo.`,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#dc3545'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: '❌ Error del servidor',
                    text: result.error || 'Error desconocido al crear empleado',
                    confirmButtonText: 'Intentar nuevamente',
                    confirmButtonColor: '#dc3545'
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Error creando empleado:', error);
        showErrorAlert(error, formData);
    }
}

/**
 * Actualiza la barra de progreso del empleado
 */
function updateEmployeeProgress(percent, message) {
    const progressBar = document.getElementById('employeeCreationProgress');
    const messageEl = document.querySelector('.swal2-html-container span');
    
    if (progressBar) {
        progressBar.style.width = percent + '%';
    }
    if (messageEl) {
        messageEl.textContent = message;
    }
}

/**
 * Validaciones del cliente para empleados
 */
async function performEmployeeClientValidation(form) {
    const errors = [];
    const warnings = [];
    
    // Validar campos requeridos
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            errors.push({
                field: field.name,
                message: `${field.previousElementSibling.textContent.replace('*', '').trim()} es obligatorio`,
                element: field
            });
        }
    });
    
    // Validar formatos
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.value.trim() && !validateFieldRealTime(input)) {
            errors.push({
                field: input.name,
                message: `Formato inválido en ${input.previousElementSibling.textContent.replace('*', '').trim()}`,
                element: input
            });
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Muestra éxito con efectos para empleados
 */
function showEmployeeSuccessWithEffects(result) {
    // Efecto confetti verde
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#198754', '#20c997', '#6f42c1']
        });
    }
    
    Swal.fire({
        icon: 'success',
        title: '🎉 ¡Empleado creado exitosamente!',
        html: `
            <div class="text-start">
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>Registro completado en la base de datos</strong>
                </div>
                
                <div class="row g-2 mb-3">
                    <div class="col-6">
                        <div class="card border-success">
                            <div class="card-body text-center p-2">
                                <i class="fas fa-user text-success"></i>
                                <small class="d-block">Persona</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="card border-success">
                            <div class="card-body text-center p-2">
                                <i class="fas fa-briefcase text-success"></i>
                                <small class="d-block">Empleado</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="card border-success">
                            <div class="card-body text-center p-2">
                                <i class="fas fa-key text-success"></i>
                                <small class="d-block">Acceso como Staff</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="alert alert-info">
                    <i class="fas fa-lightbulb me-2"></i>
                    <strong>Próximos pasos:</strong><br>
                    • El empleado debe cambiar su contraseña<br>
                    • Configurar permisos específicos en el sistema<br>
                    • Enviar credenciales de acceso por email seguro
                </div>
            </div>
        `,
        confirmButtonText: '🚀 Continuar',
        confirmButtonColor: '#198754',
        timer: 15000,
        timerProgressBar: true,
        showClass: {
            popup: 'animate__animated animate__bounceIn'
        }
    });
}

console.log('📱 Dashboard Superusuario JS cargado correctamente');