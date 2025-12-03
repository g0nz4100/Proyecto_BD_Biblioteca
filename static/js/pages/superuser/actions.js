/**
 * ==========================================
 * JAVASCRIPT ACCIONES SUPERUSUARIO
 * Archivo: actions.js
 * Descripción: Funciones de acciones específicas del superusuario (backups, exportaciones, etc.)
 * ==========================================
 */

// ==========================================
// VARIABLES GLOBALES PARA ACCIONES
// ==========================================
let backupInProgress = false;
let exportInProgress = false;
let systemMaintenanceMode = false;

// ==========================================
// FUNCIONES DE BACKUP
// ==========================================

/**
 * Realiza un backup rápido del sistema
 */
async function performBackup() {
    if (backupInProgress) {
        showNotification('Ya hay un backup en progreso', 'warning');
        return;
    }
    
    try {
        backupInProgress = true;
        
        // Mostrar confirmación
        const result = await Swal.fire({
            title: '🔄 Backup del Sistema',
            text: '¿Estás seguro de que deseas realizar un backup completo?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#6f42c1',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, realizar backup',
            cancelButtonText: 'Cancelar',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    // Realizar backup real
                    const response = await fetch('/superuser/api/backup/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                        },
                        body: JSON.stringify({ tipo: 'completo' })
                    });
                    
                    const result = await response.json();
                    if (!result.success) {
                        throw new Error(result.error || 'Error en el backup');
                    }
                    
                    return result;
                } catch (error) {
                    Swal.showValidationMessage(`Error: ${error.message}`);
                    return false;
                }
            }
        });
        
        if (result.isConfirmed && result.value) {
            showNotification('Backup completado exitosamente', 'success');
            updateBackupHistory();
            
            // Mostrar información del backup
            if (result.value.backup_info) {
                const info = result.value.backup_info;
                showToast(`Backup creado: ${info.filename} (${info.size})`, 'success', 5000);
            }
        }
        
    } catch (error) {
        console.error('❌ Error en backup:', error);
        showNotification('Error al realizar backup: ' + error.message, 'error');
    } finally {
        backupInProgress = false;
    }
}

/**
 * Realiza un backup completo del sistema
 */
async function performFullBackup() {
    if (backupInProgress) {
        showNotification('Ya hay un backup en progreso', 'warning');
        return;
    }
    
    try {
        backupInProgress = true;
        
        // Mostrar modal de progreso
        Swal.fire({
            title: '🔄 Backup Completo',
            html: `
                <div class="backup-progress">
                    <div class="mb-3">
                        <div class="progress" style="height: 20px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                                 role="progressbar" style="width: 0%" id="backupProgressBar">
                                0%
                            </div>
                        </div>
                    </div>
                    <div id="backupStatus" class="text-muted">Iniciando backup...</div>
                    <div class="mt-3">
                        <small class="text-muted">
                            <i class="fas fa-info-circle me-1"></i>
                            Este proceso puede tomar varios minutos
                        </small>
                    </div>
                </div>
            `,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                performBackupSteps();
            }
        });
        
    } catch (error) {
        console.error('❌ Error en backup completo:', error);
        showNotification('Error al realizar backup completo', 'error');
        backupInProgress = false;
    }
}

/**
 * Simula el proceso de backup con pasos
 */
async function performBackupSteps() {
    const steps = [
        { message: 'Preparando backup...', progress: 10 },
        { message: 'Respaldando base de datos...', progress: 30 },
        { message: 'Respaldando archivos del sistema...', progress: 50 },
        { message: 'Respaldando configuraciones...', progress: 70 },
        { message: 'Comprimiendo archivos...', progress: 85 },
        { message: 'Verificando integridad...', progress: 95 },
        { message: 'Backup completado', progress: 100 }
    ];
    
    const progressBar = document.getElementById('backupProgressBar');
    const statusDiv = document.getElementById('backupStatus');
    
    for (const step of steps) {
        statusDiv.textContent = step.message;
        progressBar.style.width = step.progress + '%';
        progressBar.textContent = step.progress + '%';
        
        // Simular tiempo de procesamiento
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    }
    
    // Cerrar modal y mostrar éxito
    setTimeout(() => {
        Swal.close();
        showNotification('Backup completo realizado exitosamente', 'success');
        backupInProgress = false;
        updateBackupHistory();
    }, 1000);
}

/**
 * Programa un backup automático
 */
async function scheduleBackup() {
    const { value: formValues } = await Swal.fire({
        title: '⏰ Programar Backup',
        html: `
            <div class="row g-3">
                <div class="col-12">
                    <label for="backupType" class="form-label fw-bold">Tipo de Backup</label>
                    <select id="backupType" class="form-select">
                        <option value="full">Completo</option>
                        <option value="incremental">Incremental</option>
                        <option value="differential">Diferencial</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label for="backupFrequency" class="form-label fw-bold">Frecuencia</label>
                    <select id="backupFrequency" class="form-select">
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label for="backupTime" class="form-label fw-bold">Hora</label>
                    <input type="time" id="backupTime" class="form-control" value="02:00">
                </div>
                <div class="col-12">
                    <label for="backupRetention" class="form-label fw-bold">Retención (días)</label>
                    <input type="number" id="backupRetention" class="form-control" value="30" min="7" max="365">
                </div>
                <div class="col-12">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="emailNotification" checked>
                        <label class="form-check-label" for="emailNotification">
                            Enviar notificación por email
                        </label>
                    </div>
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Programar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                type: document.getElementById('backupType').value,
                frequency: document.getElementById('backupFrequency').value,
                time: document.getElementById('backupTime').value,
                retention: document.getElementById('backupRetention').value,
                emailNotification: document.getElementById('emailNotification').checked
            };
        }
    });
    
    if (formValues) {
        try {
            // Simular programación del backup
            await simulateAPICall(1500);
            
            showNotification('Backup programado exitosamente', 'success');
            console.log('📅 Backup programado:', formValues);
            
        } catch (error) {
            console.error('❌ Error programando backup:', error);
            showNotification('Error al programar backup', 'error');
        }
    }
}

/**
 * Muestra el historial de backups
 */
function showBackupHistory() {
    const backupHistory = generateBackupHistoryHTML();
    
    Swal.fire({
        title: '<i class="fas fa-history me-2"></i>Historial de Backups',
        html: backupHistory,
        width: '80%',
        showCloseButton: true,
        showConfirmButton: false,
        customClass: {
            container: 'backup-history-modal'
        }
    });
}

/**
 * Genera HTML para el historial de backups
 */
function generateBackupHistoryHTML() {
    return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Tamaño</th>
                        <th>Estado</th>
                        <th>Duración</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>2024-01-15 02:00:00</td>
                        <td><span class="badge bg-primary">Completo</span></td>
                        <td>2.4 GB</td>
                        <td><span class="badge bg-success">Exitoso</span></td>
                        <td>15 min</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="downloadBackup('backup_20240115')">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteBackup('backup_20240115')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td>2024-01-14 02:00:00</td>
                        <td><span class="badge bg-info">Incremental</span></td>
                        <td>450 MB</td>
                        <td><span class="badge bg-success">Exitoso</span></td>
                        <td>3 min</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="downloadBackup('backup_20240114')">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteBackup('backup_20240114')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td>2024-01-13 02:00:00</td>
                        <td><span class="badge bg-warning">Diferencial</span></td>
                        <td>1.2 GB</td>
                        <td><span class="badge bg-danger">Error</span></td>
                        <td>-</td>
                        <td>
                            <button class="btn btn-sm btn-outline-info" onclick="viewBackupLog('backup_20240113')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="retryBackup('backup_20240113')">
                                <i class="fas fa-redo"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// ==========================================
// FUNCIONES DE EXPORTACIÓN
// ==========================================

/**
 * Exporta datos a Excel
 */
async function exportToExcel() {
    if (exportInProgress) {
        showNotification('Ya hay una exportación en progreso', 'warning');
        return;
    }
    
    try {
        exportInProgress = true;
        
        // Mostrar opciones de exportación
        const { value: exportOptions } = await Swal.fire({
            title: '📊 Exportar a Excel',
            html: `
                <div class="row g-3">
                    <div class="col-12">
                        <label class="form-label fw-bold">Selecciona las tablas a exportar:</label>
                    </div>
                    <div class="col-md-6">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="exportUsers" checked>
                            <label class="form-check-label" for="exportUsers">
                                <i class="fas fa-users me-2"></i>Usuarios
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="exportBooks" checked>
                            <label class="form-check-label" for="exportBooks">
                                <i class="fas fa-book me-2"></i>Libros
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="exportLoans" checked>
                            <label class="form-check-label" for="exportLoans">
                                <i class="fas fa-handshake me-2"></i>Préstamos
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="exportEmployees">
                            <label class="form-check-label" for="exportEmployees">
                                <i class="fas fa-user-tie me-2"></i>Empleados
                            </label>
                        </div>
                    </div>
                    <div class="col-12">
                        <label for="dateRange" class="form-label fw-bold">Rango de fechas:</label>
                        <select id="dateRange" class="form-select">
                            <option value="all">Todos los registros</option>
                            <option value="last_month">Último mes</option>
                            <option value="last_3_months">Últimos 3 meses</option>
                            <option value="last_year">Último año</option>
                            <option value="custom">Personalizado</option>
                        </select>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Exportar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                return {
                    users: document.getElementById('exportUsers').checked,
                    books: document.getElementById('exportBooks').checked,
                    loans: document.getElementById('exportLoans').checked,
                    employees: document.getElementById('exportEmployees').checked,
                    dateRange: document.getElementById('dateRange').value
                };
            }
        });
        
        if (exportOptions) {
            await performExcelExport(exportOptions);
        }
        
    } catch (error) {
        console.error('❌ Error en exportación:', error);
        showNotification('Error al exportar datos', 'error');
    } finally {
        exportInProgress = false;
    }
}

/**
 * Realiza la exportación a Excel
 */
async function performExcelExport(options) {
    try {
        // Mostrar progreso
        Swal.fire({
            title: '📊 Exportando a Excel',
            html: `
                <div class="export-progress">
                    <div class="mb-3">
                        <div class="progress" style="height: 15px;">
                            <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" 
                                 role="progressbar" style="width: 0%" id="exportProgressBar">
                                0%
                            </div>
                        </div>
                    </div>
                    <div id="exportStatus" class="text-muted">Preparando exportación...</div>
                </div>
            `,
            allowOutsideClick: false,
            showConfirmButton: false
        });
        
        // Simular proceso de exportación
        const steps = [
            'Preparando datos...',
            'Exportando usuarios...',
            'Exportando libros...',
            'Exportando préstamos...',
            'Generando archivo Excel...',
            'Finalizando exportación...'
        ];
        
        const progressBar = document.getElementById('exportProgressBar');
        const statusDiv = document.getElementById('exportStatus');
        
        for (let i = 0; i < steps.length; i++) {
            statusDiv.textContent = steps[i];
            const progress = ((i + 1) / steps.length) * 100;
            progressBar.style.width = progress + '%';
            progressBar.textContent = Math.round(progress) + '%';
            
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        // Descargar archivo real
        setTimeout(async () => {
            Swal.close();
            await downloadExcelFile(options);
        }, 500);
        
    } catch (error) {
        throw error;
    }
}

/**
 * Descarga el archivo Excel real
 */
async function downloadExcelFile(options) {
    try {
        const response = await fetch('/superuser/api/exportar-excel/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify({
                tablas: Object.keys(options).filter(key => options[key])
            })
        });
        
        if (response.ok) {
            // Crear blob y descargar archivo
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `biblioteca_export_${new Date().toISOString().split('T')[0]}.xlsx`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            window.URL.revokeObjectURL(url);
            
            showNotification('Archivo Excel descargado exitosamente', 'success');
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
        
    } catch (error) {
        console.error('❌ Error descargando Excel:', error);
        showNotification('Error al descargar archivo Excel', 'error');
    }
}

// ==========================================
// FUNCIONES DE SISTEMA
// ==========================================

/**
 * Muestra los logs de seguridad
 */
async function showSecurityLogs() {
    try {
        // Cargar logs desde el servidor
        const response = await fetch('/superuser/api/logs-seguridad/', {
            method: 'GET',
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const logsHTML = generateSecurityLogsHTML(result.logs);
            
            Swal.fire({
                title: '<i class="fas fa-shield-alt me-2"></i>Logs de Seguridad',
                html: logsHTML,
                width: '90%',
                showCloseButton: true,
                showConfirmButton: false,
                customClass: {
                    container: 'security-logs-modal'
                }
            });
        } else {
            throw new Error(result.error || 'Error cargando logs');
        }
        
    } catch (error) {
        console.error('❌ Error cargando logs:', error);
        showNotification('Error al cargar logs de seguridad', 'error');
    }
}

/**
 * Genera HTML para los logs de seguridad
 */
function generateSecurityLogsHTML(logs = []) {
    const getBadgeClass = (nivel) => {
        switch (nivel.toUpperCase()) {
            case 'ERROR': return 'bg-danger';
            case 'WARNING': return 'bg-warning';
            case 'INFO': return 'bg-success';
            case 'DEBUG': return 'bg-secondary';
            default: return 'bg-info';
        }
    };
    
    const logsRows = logs.map(log => `
        <tr>
            <td>${log.timestamp}</td>
            <td>${log.evento}</td>
            <td>${log.usuario}</td>
            <td>${log.ip}</td>
            <td><span class="badge ${getBadgeClass(log.nivel)}">${log.nivel}</span></td>
        </tr>
    `).join('');
    
    return `
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <small class="text-muted">Mostrando últimos ${logs.length} eventos</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary" onclick="refreshSecurityLogs()">
                        <i class="fas fa-sync me-1"></i>Actualizar
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="exportSecurityLogs()">
                        <i class="fas fa-download me-1"></i>Exportar
                    </button>
                </div>
            </div>
        </div>
        <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
            <table class="table table-sm table-hover">
                <thead class="table-dark sticky-top">
                    <tr>
                        <th>Timestamp</th>
                        <th>Evento</th>
                        <th>Usuario</th>
                        <th>IP</th>
                        <th>Nivel</th>
                    </tr>
                </thead>
                <tbody>
                    ${logsRows || '<tr><td colspan="5" class="text-center text-muted">No hay logs disponibles</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Muestra la salud del sistema
 */
async function showSystemHealth() {
    try {
        // Cargar estado del sistema desde el servidor
        await refreshSystemStatus();
        
        const modal = new bootstrap.Modal(document.getElementById('systemStatusModal'));
        modal.show();
        
    } catch (error) {
        console.error('❌ Error mostrando estado del sistema:', error);
        showNotification('Error al cargar estado del sistema', 'error');
    }
}

/**
 * Actualiza el estado del sistema
 */
async function refreshSystemStatus() {
    try {
        const response = await fetch('/superuser/api/estado-sistema/', {
            method: 'GET',
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            updateSystemStatusModal(result.estado);
            showNotification('Estado del sistema actualizado', 'info');
        } else {
            throw new Error(result.error || 'Error obteniendo estado');
        }
        
    } catch (error) {
        console.error('❌ Error actualizando estado:', error);
        showNotification('Error al actualizar estado: ' + error.message, 'error');
    }
}

/**
 * Actualiza el modal de estado del sistema con datos reales
 */
function updateSystemStatusModal(estado) {
    // Actualizar métricas del servidor
    if (estado.servidor) {
        updateProgressBar('cpu', estado.servidor.cpu);
        updateProgressBar('memoria', estado.servidor.memoria);
        updateProgressBar('disco', estado.servidor.disco);
        updateProgressBar('red', estado.servidor.red);
    }
    
    // Actualizar información de base de datos
    if (estado.base_datos) {
        updateSystemInfo('db-estado', estado.base_datos.estado);
        updateSystemInfo('db-conexiones', estado.base_datos.conexiones);
        updateSystemInfo('db-tamaño', estado.base_datos.tamaño);
        updateSystemInfo('db-backup', estado.base_datos.ultimo_backup);
    }
    
    // Actualizar servicios
    if (estado.servicios) {
        Object.entries(estado.servicios).forEach(([servicio, estado_servicio]) => {
            updateServiceStatus(servicio, estado_servicio);
        });
    }
    
    // Actualizar información del sistema
    if (estado.informacion) {
        Object.entries(estado.informacion).forEach(([key, value]) => {
            updateSystemInfo(key, value);
        });
    }
}

/**
 * Actualiza una barra de progreso
 */
function updateProgressBar(type, percentage) {
    const progressBar = document.querySelector(`[data-progress="${type}"]`);
    if (progressBar) {
        progressBar.style.width = percentage + '%';
        
        // Cambiar color según el porcentaje
        progressBar.className = progressBar.className.replace(/bg-\w+/, '');
        if (percentage < 50) {
            progressBar.classList.add('bg-success');
        } else if (percentage < 80) {
            progressBar.classList.add('bg-warning');
        } else {
            progressBar.classList.add('bg-danger');
        }
    }
}

/**
 * Actualiza información del sistema
 */
function updateSystemInfo(key, value) {
    const element = document.querySelector(`[data-info="${key}"]`);
    if (element) {
        element.textContent = value;
    }
}

/**
 * Actualiza el estado de un servicio
 */
function updateServiceStatus(servicio, estado) {
    const element = document.querySelector(`[data-service="${servicio}"]`);
    if (element) {
        const icon = element.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-circle me-2';
            
            switch (estado.toLowerCase()) {
                case 'activo':
                    icon.classList.add('text-success');
                    break;
                case 'advertencia':
                    icon.classList.add('text-warning');
                    break;
                case 'error':
                case 'inactivo':
                    icon.classList.add('text-danger');
                    break;
                default:
                    icon.classList.add('text-secondary');
            }
        }
    }
}

/**
 * Descarga el reporte del sistema
 */
function downloadSystemReport() {
    try {
        // Simular generación y descarga del reporte
        const reportData = generateSystemReport();
        
        const blob = new Blob([reportData], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `system_report_${new Date().toISOString().split('T')[0]}.txt`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
        
        showNotification('Reporte del sistema descargado', 'success');
        
    } catch (error) {
        console.error('❌ Error descargando reporte:', error);
        showNotification('Error al descargar reporte', 'error');
    }
}

/**
 * Genera el reporte del sistema
 */
function generateSystemReport() {
    const timestamp = new Date().toISOString();
    
    return `
REPORTE DEL SISTEMA - BIBLIOTECA UNIVERSITARIA
Generado: ${timestamp}

=== INFORMACIÓN GENERAL ===
Versión del Sistema: v2.1.0
Django: 5.2.8
Python: 3.11.5
PostgreSQL: 15.4

=== ESTADÍSTICAS ===
Total Usuarios: 1,234
Total Empleados: 45
Total Libros: 15,678
Préstamos Activos: 234

=== ESTADO DEL SERVIDOR ===
CPU: 25%
RAM: 60%
Disco: 45%
Red: 15%

=== BASE DE DATOS ===
Estado: Conectado
Conexiones: 12/100
Tamaño: 2.4 GB
Último Backup: Hoy 02:00

=== SERVICIOS ===
✓ Servidor Web: Activo
✓ Base de Datos: Activo
✓ Email Service: Activo
⚠ Backup Service: Advertencia
✓ Cache Redis: Activo
✓ File Storage: Activo
✓ Security: Activo
✓ Monitoring: Activo

Fin del reporte.
    `;
}

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

/**
 * Simula un proceso de backup
 */
async function simulateBackupProcess() {
    // Simular diferentes etapas del backup
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular posible error (5% de probabilidad)
    if (Math.random() < 0.05) {
        throw new Error('Error de conexión con la base de datos');
    }
    
    return true;
}

/**
 * Actualiza el historial de backups
 */
function updateBackupHistory() {
    console.log('📝 Actualizando historial de backups...');
    // Aquí se actualizaría la interfaz con el nuevo backup
}

/**
 * Actualiza las estadísticas del dashboard
 */
function updateDashboardStats() {
    console.log('📊 Actualizando estadísticas del dashboard...');
    // Aquí se actualizarían las métricas mostradas
}

/**
 * Inicia las actualizaciones en tiempo real
 */
function startRealTimeUpdates() {
    // Actualizar cada 30 segundos
    setInterval(() => {
        if (!document.hidden) {
            updateDashboardStats();
        }
    }, 30000);
}

/**
 * Anima los elementos al cargar
 */
function animateElements() {
    // Animar tarjetas de estadísticas
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in-up');
        }, index * 100);
    });
    
    // Animar tarjetas de acciones
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('slide-in-right');
        }, (index * 100) + 300);
    });
}

/**
 * Inicializa contadores animados
 */
function initializeCounters() {
    const counters = document.querySelectorAll('.animated-counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current);
        }, 16);
    });
}

/**
 * Configura tooltips
 */
function setupTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

console.log('⚡ Actions JS para Superusuario cargado correctamente');