from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.home, name='home'),
    path('pre-registro/', views.pre_registro, name='pre_registro'),
    path('gestionar-preregistros/', views.gestionar_preregistros, name='gestionar_preregistros'),
    path('aprobar-preregistro/<int:preregistro_id>/', views.aprobar_preregistro, name='aprobar_preregistro'),
    path('rechazar-preregistro/<int:preregistro_id>/', views.rechazar_preregistro, name='rechazar_preregistro'),
    path('bloquear-usuario/<int:preregistro_id>/', views.bloquear_usuario, name='bloquear_usuario'),
    path('activar-usuario/<int:preregistro_id>/', views.activar_usuario, name='activar_usuario'),
    
    # URLs de Autenticación
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # URLs del Superusuario
    path('superuser/dashboard/', views.superuser_dashboard, name='superuser_dashboard'),
    path('superuser/users/', views.superuser_users, name='superuser_users'),
    path('superuser/crear-administrador/', views.crear_administrador_ajax, name='crear_administrador_ajax'),
    path('superuser/crear-empleado/', views.crear_empleado_ajax, name='crear_empleado_ajax'),
    
    # URLs de Estadísticas y Reportes
    path('superuser/api/estadisticas/', views.obtener_estadisticas_dashboard, name='obtener_estadisticas_dashboard'),
    path('superuser/api/grafico-usuarios/', views.obtener_datos_grafico_usuarios, name='obtener_datos_grafico_usuarios'),
    
    # URLs de Configuración
    path('superuser/api/politicas-password/', views.guardar_politicas_password, name='guardar_politicas_password'),
    path('superuser/api/configuracion-sistema/', views.guardar_configuracion_sistema, name='guardar_configuracion_sistema'),
    
    # URLs de Backup y Exportación
    path('superuser/api/backup/', views.realizar_backup, name='realizar_backup'),
    path('superuser/api/exportar-excel/', views.exportar_datos_excel, name='exportar_datos_excel'),
    path('superuser/api/logs-seguridad/', views.obtener_logs_seguridad, name='obtener_logs_seguridad'),
    path('superuser/api/estado-sistema/', views.obtener_estado_sistema, name='obtener_estado_sistema'),
]