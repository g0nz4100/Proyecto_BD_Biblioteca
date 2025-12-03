/**
 * ==========================================
 * JAVASCRIPT GESTIÓN DE USUARIOS
 * Archivo: users_management.js
 * Descripción: Funcionalidades para la gestión de usuarios del superusuario
 * ==========================================
 */

// ==========================================
// VARIABLES GLOBALES
// ==========================================
let selectedUsers = new Set();
let currentFilters = {};
let usersData = [];

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeUsersManagement();
    loadUsersData();
    setupEventListeners();
});

/**
 * Inicializa la gestión de usuarios
 */
function initializeUsersManagement() {
    console.log('👥 Inicializando gestión de usuarios...');
    
    // Configurar DataTable si está disponible
    if (typeof DataTable !== 'undefined') {
        initializeDataTable();
    }
    
    // Configurar filtros
    setupFilters();
    
    console.log('✅ Gestión de usuarios inicializada');
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
    // Checkbox "Seleccionar todo"
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            toggleSelectAll(this.checked);
        });
    }
    
    // Checkboxes individuales
    document.addEventListener('change', function(e) {
        if (e.target.matches('input[type="checkbox"][value]')) {
            toggleUserSelection(e.target.value, e.target.checked);
        }
    });
    
    // Filtros en tiempo real
    const searchInput = document.getElementById('searchUsers');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                applyFilters();
            }, 500);
        });
    }
    
    // Filtros de selección
    const filterSelects = document.querySelectorAll('#filterUserType, #filterStatus, #filterDate');
    filterSelects.forEach(select => {
        select.addEventListener('change', applyFilters);
    });
}

/**
 * Configura los filtros
 */
function setupFilters() {
    currentFilters = {
        search: '',
        type: '',
        status: '',
        date: ''
    };
}

// ==========================================
// FUNCIONES DE DATOS
// ==========================================

/**
 * Carga los datos de usuarios
 */
async function loadUsersData() {
    try {
        showTableLoading();
        
        // Simular carga de datos (reemplazar con AJAX real)
        await simulateAPICall(1000);
        
        // Datos de ejemplo
        usersData = generateSampleUsersData();
        
        renderUsersTable(usersData);
        hideTableLoading();
        
    } catch (error) {
        console.error('❌ Error cargando usuarios:', error);
        showNotification('Error cargando datos de usuarios', 'error');
        hideTableLoading();
    }
}

/**
 * Genera datos de ejemplo para usuarios
 */
function generateSampleUsersData() {
    const userTypes = [
        { type: 'estudiante', icon: 'graduation-cap', color: 'primary' },
        { type: 'docente', icon: 'chalkboard-teacher', color: 'success' },
        { type: 'visitante', icon: 'user-friends', color: 'warning' },
        { type: 'empleado', icon: 'user-tie', color: 'info' },
        { type: 'administrador', icon: 'user-shield', color: 'danger' }
    ];
    
    const statuses = [
        { status: 'activo', color: 'success', icon: 'check-circle' },
        { status: 'inactivo', color: 'secondary', icon: 'pause-circle' },
        { status: 'suspendido', color: 'danger', icon: 'ban' },
        { status: 'pendiente', color: 'warning', icon: 'clock' }
    ];
    
    const sampleUsers = [];
    
    for (let i = 1; i <= 50; i++) {
        const userType = userTypes[Math.floor(Math.random() * userTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        sampleUsers.push({
            id: i,
            username: `usuario${i.toString().padStart(3, '0')}`,
            email: `usuario${i}@biblioteca.edu.bo`,
            firstName: `Nombre${i}`,
            lastName: `Apellido${i}`,
            ci: `${12345678 + i}`,
            phone: `+591 7${Math.floor(Math.random() * 9000000) + 1000000}`,
            type: userType.type,
            typeIcon: userType.icon,
            typeColor: userType.color,
            status: status.status,
            statusColor: status.color,
            statusIcon: status.icon,
            registrationDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            lastAccess: Math.random() > 0.3 ? new Date() : null
        });
    }
    
    return sampleUsers;
}

/**
 * Renderiza la tabla de usuarios
 */
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = createUserRow(user);
        tbody.appendChild(row);
    });
    
    updatePaginationInfo(users.length);
}

/**
 * Crea una fila de usuario
 */
function createUserRow(user) {
    const row = document.createElement('tr');
    
    const initials = (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
    const lastAccessText = user.lastAccess 
        ? formatRelativeTime(user.lastAccess)
        : '<span class="text-muted">Nunca</span>';
    
    row.innerHTML = `
        <td>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${user.id}">
            </div>
        </td>
        <td><strong>#${user.id.toString().padStart(3, '0')}</strong></td>
        <td>
            <div class="d-flex align-items-center">
                <div class="avatar-sm bg-${user.typeColor} text-white rounded-circle me-3 d-flex align-items-center justify-content-center">
                    ${initials}
                </div>
                <div>
                    <div class="fw-bold">${user.username}</div>
                    <small class="text-muted">${user.email}</small>
                </div>
            </div>
        </td>
        <td>
            <div>
                <div class="fw-bold">${user.firstName} ${user.lastName}</div>
                <small class="text-muted">CI: ${user.ci} | Tel: ${user.phone}</small>
            </div>
        </td>
        <td>
            <span class="badge bg-${user.typeColor}">
                <i class="fas fa-${user.typeIcon} me-1"></i>${capitalizeFirst(user.type)}
            </span>
        </td>
        <td>
            <span class="badge bg-${user.statusColor}">
                <i class="fas fa-${user.statusIcon} me-1"></i>${capitalizeFirst(user.status)}
            </span>
        </td>
        <td>
            <small>${formatDate(user.registrationDate)}</small>
        </td>
        <td>
            <small class="${user.lastAccess ? 'text-success' : 'text-muted'}">${lastAccessText}</small>
        </td>
        <td>
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" onclick="viewUser(${user.id})" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-outline-warning" onclick="editUser(${user.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline-info" onclick="resetPassword(${user.id})" title="Resetear contraseña">
                    <i class="fas fa-key"></i>
                </button>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onclick="suspendUser(${user.id})">
                            <i class="fas fa-ban me-2"></i>Suspender
                        </a></li>
                        <li><a class="dropdown-item" href="#" onclick="activateUser(${user.id})">
                            <i class="fas fa-check me-2"></i>Activar
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash me-2"></i>Eliminar
                        </a></li>
                    </ul>
                </div>
            </div>
        </td>
    `;
    
    return row;
}

// ==========================================
// FUNCIONES DE FILTRADO
// ==========================================

/**
 * Aplica los filtros a la tabla
 */
function applyFilters() {
    const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
    const typeFilter = document.getElementById('filterUserType').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const dateFilter = document.getElementById('filterDate').value;
    
    currentFilters = {
        search: searchTerm,
        type: typeFilter,
        status: statusFilter,
        date: dateFilter
    };
    
    const filteredUsers = usersData.filter(user => {
        // Filtro de búsqueda
        if (searchTerm && !matchesSearch(user, searchTerm)) {
            return false;
        }
        
        // Filtro de tipo
        if (typeFilter && user.type !== typeFilter) {
            return false;
        }
        
        // Filtro de estado
        if (statusFilter && user.status !== statusFilter) {
            return false;
        }
        
        // Filtro de fecha
        if (dateFilter && !matchesDateFilter(user, dateFilter)) {
            return false;
        }
        
        return true;
    });
    
    renderUsersTable(filteredUsers);
    clearSelection();
}

/**
 * Verifica si un usuario coincide con la búsqueda
 */
function matchesSearch(user, searchTerm) {
    const searchFields = [
        user.username,
        user.email,
        user.firstName,
        user.lastName,
        user.ci,
        user.phone
    ];
    
    return searchFields.some(field => 
        field && field.toLowerCase().includes(searchTerm)
    );
}

/**
 * Verifica si un usuario coincide con el filtro de fecha
 */
function matchesDateFilter(user, dateFilter) {
    const now = new Date();
    const userDate = user.registrationDate;
    
    switch (dateFilter) {
        case 'today':
            return isSameDay(userDate, now);
        case 'week':
            return isWithinDays(userDate, now, 7);
        case 'month':
            return isWithinDays(userDate, now, 30);
        case 'year':
            return isWithinDays(userDate, now, 365);
        default:
            return true;
    }
}

/**
 * Limpia todos los filtros
 */
function clearFilters() {
    document.getElementById('searchUsers').value = '';
    document.getElementById('filterUserType').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterDate').value = '';
    
    currentFilters = {
        search: '',
        type: '',
        status: '',
        date: ''
    };
    
    renderUsersTable(usersData);
    clearSelection();
}

// ==========================================
// FUNCIONES DE SELECCIÓN
// ==========================================

/**
 * Alterna la selección de todos los usuarios
 */
function toggleSelectAll(checked) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][value]');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = checked;
        toggleUserSelection(checkbox.value, checked);
    });
}

/**
 * Alterna la selección de un usuario
 */
function toggleUserSelection(userId, selected) {
    if (selected) {
        selectedUsers.add(parseInt(userId));
    } else {
        selectedUsers.delete(parseInt(userId));
    }
    
    updateBulkActionsCard();
    updateSelectAllCheckbox();
}

/**
 * Actualiza la tarjeta de acciones masivas
 */
function updateBulkActionsCard() {
    const bulkCard = document.getElementById('bulkActionsCard');
    const countSpan = document.getElementById('selectedCount');
    
    if (selectedUsers.size > 0) {
        bulkCard.style.display = 'block';
        countSpan.textContent = selectedUsers.size;
    } else {
        bulkCard.style.display = 'none';
    }
}

/**
 * Actualiza el checkbox "Seleccionar todo"
 */
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const visibleCheckboxes = document.querySelectorAll('input[type="checkbox"][value]');
    
    if (visibleCheckboxes.length === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
        return;
    }
    
    const checkedCount = Array.from(visibleCheckboxes).filter(cb => cb.checked).length;
    
    if (checkedCount === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
    } else if (checkedCount === visibleCheckboxes.length) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.indeterminate = true;
        selectAllCheckbox.checked = false;
    }
}

/**
 * Limpia la selección
 */
function clearSelection() {
    selectedUsers.clear();
    
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    updateBulkActionsCard();
}

// ==========================================
// FUNCIONES DE ACCIONES INDIVIDUALES
// ==========================================

/**
 * Ver detalles de un usuario
 */
function viewUser(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;
    
    Swal.fire({
        title: `<i class="fas fa-user me-2"></i>Detalles del Usuario`,
        html: generateUserDetailsHTML(user),
        width: '600px',
        showCloseButton: true,
        showConfirmButton: false
    });
}

/**
 * Editar un usuario
 */
function editUser(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;
    
    console.log('✏️ Editando usuario:', userId);
    showNotification('Función de edición en desarrollo', 'info');
}

/**
 * Resetear contraseña de un usuario
 */
async function resetPassword(userId) {
    const result = await Swal.fire({
        title: '🔑 Resetear Contraseña',
        text: '¿Estás seguro de que deseas resetear la contraseña de este usuario?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, resetear',
        cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
        try {
            await simulateAPICall(1000);
            showNotification('Contraseña reseteada exitosamente', 'success');
        } catch (error) {
            showNotification('Error al resetear contraseña', 'error');
        }
    }
}

/**
 * Suspender un usuario
 */
async function suspendUser(userId) {
    const result = await Swal.fire({
        title: '⛔ Suspender Usuario',
        text: '¿Estás seguro de que deseas suspender este usuario?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, suspender',
        cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
        try {
            await simulateAPICall(1000);
            
            // Actualizar estado en los datos
            const user = usersData.find(u => u.id === userId);
            if (user) {
                user.status = 'suspendido';
                user.statusColor = 'danger';
                user.statusIcon = 'ban';
            }
            
            applyFilters();
            showNotification('Usuario suspendido exitosamente', 'success');
        } catch (error) {
            showNotification('Error al suspender usuario', 'error');
        }
    }
}

/**
 * Activar un usuario
 */
async function activateUser(userId) {
    try {
        await simulateAPICall(1000);
        
        // Actualizar estado en los datos
        const user = usersData.find(u => u.id === userId);
        if (user) {
            user.status = 'activo';
            user.statusColor = 'success';
            user.statusIcon = 'check-circle';
        }
        
        applyFilters();
        showNotification('Usuario activado exitosamente', 'success');
    } catch (error) {
        showNotification('Error al activar usuario', 'error');
    }
}

/**
 * Eliminar un usuario
 */
async function deleteUser(userId) {
    const result = await Swal.fire({
        title: '🗑️ Eliminar Usuario',
        text: '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545'
    });
    
    if (result.isConfirmed) {
        try {
            await simulateAPICall(1000);
            
            // Remover de los datos
            const index = usersData.findIndex(u => u.id === userId);
            if (index > -1) {
                usersData.splice(index, 1);
            }
            
            applyFilters();
            showNotification('Usuario eliminado exitosamente', 'success');
        } catch (error) {
            showNotification('Error al eliminar usuario', 'error');
        }
    }
}

// ==========================================
// FUNCIONES DE ACCIONES MASIVAS
// ==========================================

/**
 * Activar usuarios seleccionados
 */
async function bulkActivate() {
    if (selectedUsers.size === 0) return;
    
    const result = await Swal.fire({
        title: '✅ Activar Usuarios',
        text: `¿Deseas activar ${selectedUsers.size} usuarios seleccionados?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, activar',
        cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
        try {
            await simulateAPICall(2000);
            
            selectedUsers.forEach(userId => {
                const user = usersData.find(u => u.id === userId);
                if (user) {
                    user.status = 'activo';
                    user.statusColor = 'success';
                    user.statusIcon = 'check-circle';
                }
            });
            
            clearSelection();
            applyFilters();
            showNotification(`${selectedUsers.size} usuarios activados exitosamente`, 'success');
        } catch (error) {
            showNotification('Error en activación masiva', 'error');
        }
    }
}

/**
 * Suspender usuarios seleccionados
 */
async function bulkSuspend() {
    if (selectedUsers.size === 0) return;
    
    const result = await Swal.fire({
        title: '⛔ Suspender Usuarios',
        text: `¿Deseas suspender ${selectedUsers.size} usuarios seleccionados?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, suspender',
        cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
        try {
            await simulateAPICall(2000);
            
            selectedUsers.forEach(userId => {
                const user = usersData.find(u => u.id === userId);
                if (user) {
                    user.status = 'suspendido';
                    user.statusColor = 'danger';
                    user.statusIcon = 'ban';
                }
            });
            
            clearSelection();
            applyFilters();
            showNotification(`${selectedUsers.size} usuarios suspendidos exitosamente`, 'success');
        } catch (error) {
            showNotification('Error en suspensión masiva', 'error');
        }
    }
}

/**
 * Exportar usuarios seleccionados
 */
function bulkExport() {
    if (selectedUsers.size === 0) return;
    
    console.log('📊 Exportando usuarios seleccionados:', Array.from(selectedUsers));
    showNotification(`Exportando ${selectedUsers.size} usuarios...`, 'info');
}

/**
 * Eliminar usuarios seleccionados
 */
async function bulkDelete() {
    if (selectedUsers.size === 0) return;
    
    const result = await Swal.fire({
        title: '🗑️ Eliminar Usuarios',
        text: `¿Deseas eliminar ${selectedUsers.size} usuarios seleccionados? Esta acción no se puede deshacer.`,
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545'
    });
    
    if (result.isConfirmed) {
        try {
            await simulateAPICall(2000);
            
            // Remover usuarios de los datos
            usersData = usersData.filter(user => !selectedUsers.has(user.id));
            
            clearSelection();
            applyFilters();
            showNotification(`${selectedUsers.size} usuarios eliminados exitosamente`, 'success');
        } catch (error) {
            showNotification('Error en eliminación masiva', 'error');
        }
    }
}

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

/**
 * Genera HTML para los detalles del usuario
 */
function generateUserDetailsHTML(user) {
    return `
        <div class="row g-3 text-start">
            <div class="col-12 text-center mb-3">
                <div class="avatar-lg bg-${user.typeColor} text-white rounded-circle mx-auto d-flex align-items-center justify-content-center" style="width: 80px; height: 80px; font-size: 2rem;">
                    ${(user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase()}
                </div>
                <h5 class="mt-2 mb-0">${user.firstName} ${user.lastName}</h5>
                <span class="badge bg-${user.typeColor}">
                    <i class="fas fa-${user.typeIcon} me-1"></i>${capitalizeFirst(user.type)}
                </span>
            </div>
            <div class="col-md-6">
                <strong>Usuario:</strong><br>
                <span class="text-muted">${user.username}</span>
            </div>
            <div class="col-md-6">
                <strong>Email:</strong><br>
                <span class="text-muted">${user.email}</span>
            </div>
            <div class="col-md-6">
                <strong>CI:</strong><br>
                <span class="text-muted">${user.ci}</span>
            </div>
            <div class="col-md-6">
                <strong>Teléfono:</strong><br>
                <span class="text-muted">${user.phone}</span>
            </div>
            <div class="col-md-6">
                <strong>Estado:</strong><br>
                <span class="badge bg-${user.statusColor}">
                    <i class="fas fa-${user.statusIcon} me-1"></i>${capitalizeFirst(user.status)}
                </span>
            </div>
            <div class="col-md-6">
                <strong>Registro:</strong><br>
                <span class="text-muted">${formatDate(user.registrationDate)}</span>
            </div>
            <div class="col-12">
                <strong>Último Acceso:</strong><br>
                <span class="text-muted">${user.lastAccess ? formatRelativeTime(user.lastAccess) : 'Nunca'}</span>
            </div>
        </div>
    `;
}

/**
 * Muestra loading en la tabla
 */
function showTableLoading() {
    const tbody = document.getElementById('usersTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <div class="mt-2">Cargando usuarios...</div>
                </td>
            </tr>
        `;
    }
}

/**
 * Oculta loading de la tabla
 */
function hideTableLoading() {
    // El loading se oculta automáticamente al renderizar los datos
}

/**
 * Actualiza la información de paginación
 */
function updatePaginationInfo(totalUsers) {
    // Actualizar contador de usuarios mostrados
    const paginationInfo = document.querySelector('.col-md-6 span');
    if (paginationInfo) {
        paginationInfo.textContent = `de ${totalUsers} usuarios`;
    }
}

/**
 * Exporta datos de usuarios
 */
function exportUsersData() {
    console.log('📊 Exportando todos los usuarios...');
    showNotification('Exportando datos de usuarios...', 'info');
}

/**
 * Importa datos de usuarios
 */
function importUsersData() {
    console.log('📥 Importando usuarios...');
    showNotification('Función de importación en desarrollo', 'info');
}

// Funciones de utilidad de fechas y formato
function formatDate(date) {
    return date.toLocaleDateString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Hace menos de 1 hora';
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    
    const days = Math.floor(hours / 24);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
}

function isWithinDays(date, referenceDate, days) {
    const diffTime = Math.abs(referenceDate - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
}

function simulateAPICall(delay = 1000) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

console.log('👥 Users Management JS cargado correctamente');