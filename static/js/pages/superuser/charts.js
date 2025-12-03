/**
 * ==========================================
 * JAVASCRIPT GRÁFICOS SUPERUSUARIO
 * Archivo: charts.js
 * Descripción: Manejo de gráficos y visualizaciones para el dashboard del superusuario
 * ==========================================
 */

// ==========================================
// VARIABLES GLOBALES PARA GRÁFICOS
// ==========================================
let usersChart = null;
let systemMetricsChart = null;
let activityChart = null;

// Configuración de colores
const chartColors = {
    primary: '#6f42c1',
    secondary: '#6c757d',
    success: '#198754',
    info: '#0dcaf0',
    warning: '#ffc107',
    danger: '#dc3545',
    light: '#f8f9fa',
    dark: '#212529'
};

// Gradientes para gráficos
const chartGradients = {
    purple: ['#6f42c1', '#8b5cf6'],
    blue: ['#0d6efd', '#6ea8fe'],
    green: ['#198754', '#75b798'],
    orange: ['#fd7e14', '#ffb366'],
    red: ['#dc3545', '#ea868f']
};

// ==========================================
// INICIALIZACIÓN DE GRÁFICOS
// ==========================================

/**
 * Inicializa todos los gráficos del dashboard
 */
function initializeCharts() {
    console.log('📊 Inicializando gráficos...');
    
    // Esperar a que Chart.js esté disponible
    if (typeof Chart === 'undefined') {
        console.warn('⚠️ Chart.js no está disponible');
        return;
    }
    
    // Configuración global de Chart.js
    Chart.defaults.font.family = 'Inter, sans-serif';
    Chart.defaults.color = '#6c757d';
    Chart.defaults.borderColor = '#dee2e6';
    
    // Inicializar gráficos individuales
    initializeUsersChart();
    initializeSystemMetricsChart();
    initializeActivityChart();
    
    console.log('✅ Gráficos inicializados correctamente');
}

/**
 * Inicializa el gráfico de crecimiento de usuarios
 */
function initializeUsersChart() {
    const ctx = document.getElementById('usersChart');
    if (!ctx) return;
    
    // Crear gradiente
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(111, 66, 193, 0.3)');
    gradient.addColorStop(1, 'rgba(111, 66, 193, 0.05)');
    
    // Datos de ejemplo (reemplazar con datos reales)
    const data = {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [
            {
                label: 'Estudiantes',
                data: [120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285],
                borderColor: chartColors.primary,
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: chartColors.primary,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            },
            {
                label: 'Docentes',
                data: [45, 48, 52, 55, 58, 62, 65, 68, 72, 75, 78, 82],
                borderColor: chartColors.success,
                backgroundColor: 'rgba(25, 135, 84, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: chartColors.success,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            },
            {
                label: 'Visitantes',
                data: [15, 18, 22, 25, 28, 32, 35, 38, 42, 45, 48, 52],
                borderColor: chartColors.warning,
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: chartColors.warning,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: chartColors.primary,
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return `Mes: ${context[0].label}`;
                        },
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} usuarios`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value + ' usuarios';
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    };
    
    usersChart = new Chart(ctx, config);
}

/**
 * Inicializa el gráfico de métricas del sistema
 */
function initializeSystemMetricsChart() {
    // Este gráfico se puede agregar en una sección adicional
    console.log('📈 Gráfico de métricas del sistema listo para implementar');
}

/**
 * Inicializa el gráfico de actividad
 */
function initializeActivityChart() {
    // Este gráfico se puede agregar para mostrar actividad por horas/días
    console.log('📊 Gráfico de actividad listo para implementar');
}

// ==========================================
// FUNCIONES DE ACTUALIZACIÓN DE GRÁFICOS
// ==========================================

/**
 * Actualiza el período del gráfico de usuarios
 */
async function updateChartPeriod(period) {
    if (!usersChart) return;
    
    console.log(`📅 Actualizando gráfico para período: ${period}`);
    
    try {
        // Cargar datos desde el servidor
        const response = await fetch(`/superuser/api/grafico-usuarios/?periodo=${period}`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            // Actualizar datos del gráfico
            usersChart.data.labels = result.data.labels;
            usersChart.data.datasets.forEach((dataset, index) => {
                if (result.data.datasets[index]) {
                    dataset.data = result.data.datasets[index].data;
                    dataset.borderColor = result.data.datasets[index].borderColor;
                    dataset.backgroundColor = result.data.datasets[index].backgroundColor;
                }
            });
            
            // Animar la actualización
            usersChart.update('active');
            
            showNotification(`Gráfico actualizado para ${period === 'month' ? 'este mes' : 'por año'}`, 'info');
        } else {
            throw new Error(result.error || 'Error cargando datos del gráfico');
        }
        
    } catch (error) {
        console.error('❌ Error actualizando gráfico:', error);
        showNotification('Error al actualizar gráfico: ' + error.message, 'error');
    }
}

/**
 * Actualiza los datos del gráfico de usuarios
 */
async function updateUsersChartData() {
    if (!usersChart) return;
    
    try {
        // Cargar nuevos datos desde el servidor
        const newData = await fetchUsersChartData();
        
        if (newData) {
            // Actualizar el gráfico
            usersChart.data.datasets.forEach((dataset, index) => {
                if (newData.datasets && newData.datasets[index]) {
                    dataset.data = newData.datasets[index].data;
                }
            });
            
            usersChart.update('active');
        }
        
    } catch (error) {
        console.error('❌ Error actualizando datos del gráfico:', error);
    }
}

/**
 * Obtiene datos del gráfico de usuarios desde el servidor
 */
async function fetchUsersChartData(periodo = 'month') {
    try {
        const response = await fetch(`/superuser/api/grafico-usuarios/?periodo=${periodo}`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error || 'Error obteniendo datos del gráfico');
        }
        
    } catch (error) {
        console.error('❌ Error obteniendo datos del gráfico:', error);
        
        // Retornar datos por defecto en caso de error
        return {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Estudiantes',
                    data: [120, 135, 150, 165, 180, 195],
                    borderColor: '#6f42c1',
                    backgroundColor: 'rgba(111, 66, 193, 0.1)'
                },
                {
                    label: 'Docentes',
                    data: [45, 48, 52, 55, 58, 62],
                    borderColor: '#198754',
                    backgroundColor: 'rgba(25, 135, 84, 0.1)'
                },
                {
                    label: 'Visitantes',
                    data: [15, 18, 22, 25, 28, 32],
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)'
                }
            ]
        };
    }
}

// ==========================================
// FUNCIONES DE EXPORTACIÓN DE GRÁFICOS
// ==========================================

/**
 * Exporta un gráfico como imagen
 */
function exportChartAsImage(chartInstance, filename = 'grafico') {
    if (!chartInstance) {
        showNotification('No hay gráfico disponible para exportar', 'warning');
        return;
    }
    
    try {
        // Crear enlace de descarga
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = chartInstance.toBase64Image();
        
        // Simular clic para descargar
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Gráfico exportado exitosamente', 'success');
        
    } catch (error) {
        console.error('❌ Error exportando gráfico:', error);
        showNotification('Error al exportar gráfico', 'error');
    }
}

/**
 * Exporta el gráfico de usuarios
 */
function exportUsersChart() {
    exportChartAsImage(usersChart, 'crecimiento_usuarios');
}

// ==========================================
// FUNCIONES DE UTILIDAD PARA GRÁFICOS
// ==========================================

/**
 * Crea un gradiente para gráficos
 */
function createGradient(ctx, color1, color2, direction = 'vertical') {
    const gradient = direction === 'vertical' 
        ? ctx.createLinearGradient(0, 0, 0, 300)
        : ctx.createLinearGradient(0, 0, 300, 0);
    
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    return gradient;
}

/**
 * Genera colores aleatorios para datasets
 */
function generateRandomColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = (i * 137.508) % 360; // Golden angle approximation
        colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
}

/**
 * Formatea números para mostrar en gráficos
 */
function formatChartNumber(value) {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
}

// ==========================================
// INICIALIZACIÓN AUTOMÁTICA
// ==========================================

// Inicializar gráficos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para asegurar que Chart.js esté cargado
    setTimeout(initializeCharts, 500);
});

// Redimensionar gráficos cuando cambie el tamaño de la ventana
window.addEventListener('resize', function() {
    if (usersChart) {
        usersChart.resize();
    }
    if (systemMetricsChart) {
        systemMetricsChart.resize();
    }
    if (activityChart) {
        activityChart.resize();
    }
});

console.log('📊 Charts JS para Superusuario cargado correctamente');