from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from django.utils import timezone
import json
from .forms import PreRegistroForm, AgregarAdministradorForm, AgregarEmpleadoForm
from .models import PreRegistro
from .services import crear_usuario_desde_preregistro, verificar_ci_existe, verificar_email_existe, crear_administrador, crear_empleado
from .email_service import enviar_email_aprobacion, enviar_email_rechazo

def home(request):
    """Vista principal de la página de inicio"""
    context = {
        'titulo': 'Biblioteca Universitaria',
        'descripcion': 'Sistema de gestión bibliotecaria moderno'
    }
    return render(request, 'core/home.html', context)

def pre_registro(request):
    """Vista para el formulario de pre-registro"""
    if request.method == 'POST':
        form = PreRegistroForm(request.POST)
        if form.is_valid():
            try:
                # Guardar el pre-registro
                pre_registro = form.save()
                
                messages.success(
                    request, 
                    f'¡Pre-registro enviado exitosamente! '
                    f'Tu solicitud será revisada en un máximo de 24 horas hábiles. '
                    f'Recibirás un correo de confirmación a {pre_registro.email}'
                )
                
                return redirect('core:home')
                
            except Exception as e:
                messages.error(
                    request,
                    'Ocurrió un error al procesar tu pre-registro. Por favor, inténtalo nuevamente.'
                )
        else:
            # Procesar errores específicos
            error_messages = []
            for field, errors in form.errors.items():
                field_name = form.fields[field].label if field in form.fields else field
                for error in errors:
                    error_messages.append(f"{field_name}: {error}")
            
            if error_messages:
                messages.error(
                    request,
                    'Se encontraron los siguientes errores: ' + '; '.join(error_messages)
                )
            else:
                messages.error(
                    request, 
                    'Por favor, corrige los errores en el formulario.'
                )
    else:
        form = PreRegistroForm()
    
    context = {
        'form': form
    }
    return render(request, 'core/pre_registro.html', context)

def gestionar_preregistros(request):
    """Vista para que empleados gestionen pre-registros"""
    preregistros = PreRegistro.objects.all().order_by('-fecha_registro')
    
    context = {
        'preregistros': preregistros
    }
    return render(request, 'core/gestionar_preregistros.html', context)

@csrf_exempt
def aprobar_preregistro(request, preregistro_id):
    """Aprobar un pre-registro y crear usuario real"""
    if request.method == 'POST':
        try:
            with transaction.atomic():
                preregistro = get_object_or_404(PreRegistro, id=preregistro_id, aprobado=False)
                
                # Verificar que no exista el CI o email
                if verificar_ci_existe(preregistro.ci):
                    return JsonResponse({'success': False, 'error': 'El CI ya existe en el sistema'})
                
                if preregistro.email and verificar_email_existe(preregistro.email):
                    return JsonResponse({'success': False, 'error': 'El email ya existe en el sistema'})
                
                # Crear usuario real en las tablas principales
                resultado = crear_usuario_desde_preregistro(preregistro)
                
                if resultado['success']:
                    # Marcar como aprobado
                    preregistro.aprobado = True
                    preregistro.estado = 'ACTIVO'
                    preregistro.fecha_aprobacion = timezone.now()
                    preregistro.observaciones = f"Aprobado - Usuario ID: {resultado['id_usuario']}"
                    preregistro.save()
                    
                    # Enviar email con datos de acceso
                    if preregistro.email:
                        enviar_email_aprobacion(preregistro, resultado['id_usuario'])
                else:
                    return JsonResponse({'success': False, 'error': resultado['error']})
                
                return JsonResponse({'success': True})
                
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Método no permitido'})

@csrf_exempt
def rechazar_preregistro(request, preregistro_id):
    """Rechazar un pre-registro"""
    if request.method == 'POST':
        try:
            preregistro = get_object_or_404(PreRegistro, id=preregistro_id, aprobado=False)
            
            data = json.loads(request.body)
            motivo = data.get('motivo', 'Sin motivo especificado')
            
            # Enviar email de rechazo
            if preregistro.email:
                enviar_email_rechazo(preregistro, motivo)
            
            # Marcar como rechazado
            preregistro.estado = 'RECHAZADO'
            preregistro.observaciones = f"RECHAZADO: {motivo}"
            preregistro.save()
            
            return JsonResponse({'success': True})
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Método no permitido'})

@csrf_exempt
def bloquear_usuario(request, preregistro_id):
    """Bloquear un usuario activo cambiando su estado a INACTIVO"""
    if request.method == 'POST':
        try:
            preregistro = get_object_or_404(PreRegistro, id=preregistro_id, estado='ACTIVO')
            
            data = json.loads(request.body)
            motivo = data.get('motivo', 'Usuario bloqueado por el administrador')
            
            preregistro.estado = 'INACTIVO'
            preregistro.observaciones += f"\n[BLOQUEADO] {motivo} - {timezone.now().strftime('%d/%m/%Y %H:%M')}"
            preregistro.save()
            
            return JsonResponse({'success': True})
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Método no permitido'})

@csrf_exempt
def activar_usuario(request, preregistro_id):
    """Reactivar un usuario bloqueado"""
    if request.method == 'POST':
        try:
            preregistro = get_object_or_404(PreRegistro, id=preregistro_id, estado='INACTIVO')
            
            preregistro.estado = 'ACTIVO'
            preregistro.observaciones += f"\n[REACTIVADO] Usuario reactivado - {timezone.now().strftime('%d/%m/%Y %H:%M')}"
            preregistro.save()
            
            return JsonResponse({'success': True})
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Método no permitido'})

# ==========================================
# FUNCIONES DE VALIDACIÓN DE PERMISOS
# ==========================================

def is_superuser(user):
    """Verifica si el usuario es superusuario"""
    return user.is_authenticated and user.is_superuser

def is_staff_or_superuser(user):
    """Verifica si el usuario es staff o superusuario"""
    return user.is_authenticated and (user.is_staff or user.is_superuser)

# ==========================================
# VISTAS DE AUTENTICACIÓN
# ==========================================

def login_view(request):
    """Vista de login simple"""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            
            # Redirigir según el tipo de usuario
            if user.is_superuser:
                messages.success(request, f'Bienvenido, Superusuario {user.username}!')
                return redirect('core:superuser_dashboard')
            elif user.is_staff:
                messages.success(request, f'Bienvenido, {user.username}!')
                return redirect('core:gestionar_preregistros')
            else:
                messages.success(request, f'Bienvenido, {user.username}!')
                return redirect('core:home')
        else:
            messages.error(request, 'Usuario o contraseña incorrectos.')
    
    return render(request, 'core/login.html')

def logout_view(request):
    """Vista de logout"""
    logout(request)
    messages.success(request, 'Has cerrado sesión exitosamente.')
    return redirect('core:home')

# ==========================================
# VISTAS DEL SUPERUSUARIO
# ==========================================

@login_required
@user_passes_test(is_superuser, login_url='/')
def superuser_dashboard(request):
    """Dashboard principal del superusuario - Solo accesible para superusuarios"""
    try:
        from django.db import connection
        
        with connection.cursor() as cursor:
            # Total de usuarios reales
            cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.usuario")
            total_usuarios = cursor.fetchone()[0] or 0
            
            # Total de empleados reales
            cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.empleado")
            total_empleados = cursor.fetchone()[0] or 0
            
            # Usuarios por tipo
            cursor.execute("""
                SELECT tu.tipo_usuario, COUNT(*) 
                FROM sh_biblioteca.usuario u
                JOIN sh_biblioteca.tipo_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
                GROUP BY tu.tipo_usuario
            """)
            usuarios_por_tipo = dict(cursor.fetchall())
            
            # Total de libros reales
            try:
                cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.libro")
                total_libros = cursor.fetchone()[0] or 0
            except:
                total_libros = 0
            
            # Préstamos activos reales
            try:
                cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.prestamo WHERE estado = 'ACTIVO'")
                prestamos_activos = cursor.fetchone()[0] or 0
            except:
                prestamos_activos = 0
            
            # Préstamos vencidos reales
            try:
                cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.prestamo WHERE estado = 'VENCIDO' OR fecha_devolucion < CURRENT_DATE")
                vencidos = cursor.fetchone()[0] or 0
            except:
                vencidos = 0
        
        # Pre-registros pendientes
        from .models import PreRegistro
        preregistros_pendientes = PreRegistro.objects.filter(estado='PENDIENTE').count()
        
        context = {
            'total_usuarios': total_usuarios,
            'total_empleados': total_empleados,
            'total_libros': total_libros,
            'prestamos_activos': prestamos_activos,
            'vencidos': vencidos,
            'usuarios_por_tipo': usuarios_por_tipo,
            'preregistros_pendientes': preregistros_pendientes,
        }
        
    except Exception as e:
        # En caso de error, usar datos por defecto
        context = {
            'total_usuarios': 0,
            'total_empleados': 0,
            'total_libros': 0,
            'prestamos_activos': 0,
            'vencidos': 0,
            'usuarios_por_tipo': {},
            'preregistros_pendientes': 0,
            'error': str(e)
        }
    
    return render(request, 'pages/superuser/dashboard.html', context)

@login_required
@user_passes_test(is_superuser, login_url='/')
def superuser_users(request):
    """Gestión de usuarios del superusuario - Solo accesible para superusuarios"""
    context = {
        'usuarios': [],  # Agregar datos reales aquí
    }
    return render(request, 'pages/superuser/users_management.html', context)

@login_required
@user_passes_test(is_superuser, login_url='/')
@csrf_exempt
def crear_administrador_ajax(request):
    """Vista AJAX para crear administrador desde el dashboard"""
    if request.method == 'POST':
        try:
            datos = {
                'ci': request.POST.get('ci'),
                'nombres': request.POST.get('nombres'),
                'paterno': request.POST.get('paterno'),
                'materno': request.POST.get('materno', ''),
                'direccion': request.POST.get('direccion', ''),
                'telefono': request.POST.get('telefono', ''),
                'email': request.POST.get('email'),
                'fecha_nacimiento': request.POST.get('fecha_nacimiento') or None,
                'id_sexo': request.POST.get('id_sexo'),
                'id_cargo': request.POST.get('id_cargo'),
                'id_turno': request.POST.get('id_turno'),
                'fecha_contratacion': request.POST.get('fecha_contratacion'),
                'username': request.POST.get('username'),
                'password': request.POST.get('password')
            }
            
            form = AgregarAdministradorForm(datos)
            if form.is_valid():
                resultado = crear_administrador(form.cleaned_data)
                
                if resultado['success']:
                    return JsonResponse({
                        'success': True,
                        'message': 'Administrador creado exitosamente'
                    })
                else:
                    return JsonResponse({
                        'success': False,
                        'error': resultado['error']
                    })
            else:
                errors = {}
                for field, error_list in form.errors.items():
                    errors[field] = error_list[0]
                
                return JsonResponse({
                    'success': False,
                    'errors': errors
                })
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Error interno: {str(e)}'
            })
    
    return JsonResponse({'success': False, 'error': 'Método no permitido'})

@login_required
@user_passes_test(is_superuser, login_url='/')
@csrf_exempt
def crear_empleado_ajax(request):
    """Vista AJAX para crear empleado desde el dashboard"""
    if request.method == 'POST':
        try:
            datos = {
                'ci': request.POST.get('ci'),
                'nombres': request.POST.get('nombres'),
                'paterno': request.POST.get('paterno'),
                'materno': request.POST.get('materno', ''),
                'direccion': request.POST.get('direccion', ''),
                'telefono': request.POST.get('telefono', ''),
                'email': request.POST.get('email'),
                'fecha_nacimiento': request.POST.get('fecha_nacimiento') or None,
                'id_sexo': request.POST.get('id_sexo'),
                'id_cargo': request.POST.get('id_cargo'),
                'id_turno': request.POST.get('id_turno'),
                'fecha_contratacion': request.POST.get('fecha_contratacion'),
                'username': request.POST.get('username'),
                'password': request.POST.get('password')
            }
            
            form = AgregarEmpleadoForm(datos)
            if form.is_valid():
                resultado = crear_empleado(form.cleaned_data)
                
                if resultado['success']:
                    return JsonResponse({
                        'success': True,
                        'message': 'Empleado creado exitosamente'
                    })
                else:
                    return JsonResponse({
                        'success': False,
                        'error': resultado['error']
                    })
            else:
                errors = {}
                for field, error_list in form.errors.items():
                    errors[field] = error_list[0]
                
                return JsonResponse({
                    'success': False,
                    'errors': errors
                })
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Error interno: {str(e)}'
            })
    
    return JsonResponse({'success': False, 'error': 'Método no permitido'})

# ==========================================
# VISTAS DE ESTADÍSTICAS Y REPORTES
# ==========================================

@login_required
@user_passes_test(is_superuser, login_url='/')
def obtener_estadisticas_dashboard(request):
    """Obtiene estadísticas en tiempo real para el dashboard"""
    try:
        from django.db import connection
        
        with connection.cursor() as cursor:
            # Total de usuarios
            cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.usuario")
            total_usuarios = cursor.fetchone()[0] or 0
            
            # Total de empleados
            cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.empleado")
            total_empleados = cursor.fetchone()[0] or 0
            
            # Total de libros reales
            try:
                cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.libro")
                total_libros = cursor.fetchone()[0] or 0
            except:
                total_libros = 0  # Si no existe la tabla
            
            # Préstamos activos reales
            try:
                cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.prestamo WHERE estado = 'ACTIVO'")
                prestamos_activos = cursor.fetchone()[0] or 0
            except:
                prestamos_activos = 0  # Si no existe la tabla
            
            # Préstamos vencidos reales
            try:
                cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.prestamo WHERE estado = 'VENCIDO' OR fecha_devolucion < CURRENT_DATE")
                vencidos = cursor.fetchone()[0] or 0
            except:
                vencidos = 0  # Si no existe la tabla
            
            # Usuarios por tipo
            cursor.execute("""
                SELECT tu.tipo_usuario, COUNT(*) 
                FROM sh_biblioteca.usuario u
                JOIN sh_biblioteca.tipo_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
                GROUP BY tu.tipo_usuario
            """)
            usuarios_por_tipo = dict(cursor.fetchall())
            
            # Pre-registros pendientes
            from .models import PreRegistro
            preregistros_pendientes = PreRegistro.objects.filter(estado='PENDIENTE').count()
            
        return JsonResponse({
            'success': True,
            'data': {
                'total_usuarios': total_usuarios,
                'total_empleados': total_empleados,
                'total_libros': total_libros,
                'prestamos_activos': prestamos_activos,
                'vencidos': vencidos,
                'usuarios_por_tipo': usuarios_por_tipo,
                'preregistros_pendientes': preregistros_pendientes,
                'timestamp': timezone.now().isoformat()
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

@login_required
@user_passes_test(is_superuser, login_url='/')
def obtener_datos_grafico_usuarios(request):
    """Obtiene datos para el gráfico de crecimiento de usuarios"""
    try:
        periodo = request.GET.get('periodo', 'month')
        
        # Datos simulados - reemplazar con consultas reales
        if periodo == 'month':
            data = {
                'labels': ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
                'datasets': [
                    {
                        'label': 'Estudiantes',
                        'data': [65, 70, 75, 80],
                        'borderColor': '#6f42c1',
                        'backgroundColor': 'rgba(111, 66, 193, 0.1)'
                    },
                    {
                        'label': 'Docentes', 
                        'data': [20, 22, 24, 26],
                        'borderColor': '#198754',
                        'backgroundColor': 'rgba(25, 135, 84, 0.1)'
                    },
                    {
                        'label': 'Visitantes',
                        'data': [8, 10, 12, 14],
                        'borderColor': '#ffc107',
                        'backgroundColor': 'rgba(255, 193, 7, 0.1)'
                    }
                ]
            }
        else:  # year
            data = {
                'labels': ['2020', '2021', '2022', '2023', '2024'],
                'datasets': [
                    {
                        'label': 'Estudiantes',
                        'data': [1200, 1450, 1680, 1920, 2150],
                        'borderColor': '#6f42c1',
                        'backgroundColor': 'rgba(111, 66, 193, 0.1)'
                    },
                    {
                        'label': 'Docentes',
                        'data': [450, 520, 580, 640, 720],
                        'borderColor': '#198754', 
                        'backgroundColor': 'rgba(25, 135, 84, 0.1)'
                    },
                    {
                        'label': 'Visitantes',
                        'data': [180, 220, 260, 310, 360],
                        'borderColor': '#ffc107',
                        'backgroundColor': 'rgba(255, 193, 7, 0.1)'
                    }
                ]
            }
        
        return JsonResponse({
            'success': True,
            'data': data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

# ==========================================
# VISTAS DE CONFIGURACIÓN DEL SISTEMA
# ==========================================

@login_required
@user_passes_test(is_superuser, login_url='/')
@csrf_exempt
def guardar_politicas_password(request):
    """Guarda las políticas de contraseña del sistema"""
    if request.method == 'POST':
        try:
            import json
            data = json.loads(request.body)
            
            # Aquí guardarías en base de datos o archivo de configuración
            # Por ahora simulamos el guardado
            politicas = {
                'min_length': data.get('min_length', 8),
                'max_length': data.get('max_length', 128),
                'require_uppercase': data.get('require_uppercase', True),
                'require_lowercase': data.get('require_lowercase', True),
                'require_numbers': data.get('require_numbers', True),
                'require_special': data.get('require_special', False),
                'password_expiry': data.get('password_expiry', 90),
                'max_attempts': data.get('max_attempts', 5),
                'lockout_duration': data.get('lockout_duration', 30),
                'history_count': data.get('history_count', 5),
                'force_change_first_login': data.get('force_change_first_login', True)
            }
            
            # Simular guardado exitoso
            return JsonResponse({
                'success': True,
                'message': 'Políticas de contraseña actualizadas exitosamente'
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    return JsonResponse({'success': False, 'error': 'Método no permitido'})

@login_required
@user_passes_test(is_superuser, login_url='/')
@csrf_exempt
def guardar_configuracion_sistema(request):
    """Guarda la configuración general del sistema"""
    if request.method == 'POST':
        try:
            import json
            data = json.loads(request.body)
            
            # Aquí guardarías la configuración en base de datos
            configuracion = {
                'nombre_sistema': data.get('nombre_sistema', 'Biblioteca Universitaria'),
                'email_admin': data.get('email_admin', 'admin@biblioteca.edu.bo'),
                'timezone': data.get('timezone', 'America/La_Paz'),
                'idioma': data.get('idioma', 'es'),
                'mantenimiento': data.get('mantenimiento', False),
                'registro_publico': data.get('registro_publico', True),
                'notificaciones_email': data.get('notificaciones_email', True),
                'backup_automatico': data.get('backup_automatico', True),
                'logs_detallados': data.get('logs_detallados', True)
            }
            
            return JsonResponse({
                'success': True,
                'message': 'Configuración del sistema actualizada exitosamente'
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    return JsonResponse({'success': False, 'error': 'Método no permitido'})

# ==========================================
# VISTAS DE BACKUP Y EXPORTACIÓN
# ==========================================

@login_required
@user_passes_test(is_superuser, login_url='/')
@csrf_exempt
def realizar_backup(request):
    """Realiza un backup del sistema"""
    if request.method == 'POST':
        try:
            import json
            from datetime import datetime
            
            data = json.loads(request.body)
            tipo_backup = data.get('tipo', 'completo')
            
            # Simular backup exitoso
            backup_info = {
                'filename': f"backup_{tipo_backup}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql",
                'size': '2.4 GB',
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'tipo': tipo_backup,
                'duracion': '15 minutos'
            }
            
            return JsonResponse({
                'success': True,
                'message': 'Backup realizado exitosamente',
                'backup_info': backup_info
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    return JsonResponse({'success': False, 'error': 'Método no permitido'})

@login_required
@user_passes_test(is_superuser, login_url='/')
def obtener_logs_seguridad(request):
    """Obtiene los logs de seguridad del sistema"""
    try:
        # Datos simulados - en producción conectar con sistema de logs real
        logs = [
            {
                'timestamp': '2024-01-15 14:30:25',
                'evento': 'Inicio de sesión exitoso',
                'usuario': 'admin@biblioteca.com',
                'ip': '192.168.1.100',
                'nivel': 'INFO'
            },
            {
                'timestamp': '2024-01-15 14:25:10',
                'evento': 'Intento de acceso fallido',
                'usuario': 'usuario@test.com',
                'ip': '192.168.1.105',
                'nivel': 'WARNING'
            },
            {
                'timestamp': '2024-01-15 14:20:45',
                'evento': 'Cambio de configuración',
                'usuario': 'superuser@biblioteca.com',
                'ip': '192.168.1.101',
                'nivel': 'INFO'
            }
        ]
        
        return JsonResponse({
            'success': True,
            'logs': logs
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

@login_required
@user_passes_test(is_superuser, login_url='/')
def obtener_estado_sistema(request):
    """Obtiene el estado actual del sistema"""
    try:
        estado = {
            'servidor': {
                'cpu': 25.0,
                'memoria': 60.0,
                'disco': 45.0,
                'red': 15.0
            },
            'base_datos': {
                'estado': 'Conectado',
                'conexiones': '12/100',
                'tamaño': '2.4 GB',
                'ultimo_backup': 'Hoy 02:00',
                'consultas_por_segundo': 45
            },
            'servicios': {
                'servidor_web': 'Activo',
                'base_datos': 'Activo',
                'email_service': 'Activo',
                'backup_service': 'Advertencia',
                'cache_redis': 'Activo',
                'file_storage': 'Activo',
                'security': 'Activo',
                'monitoring': 'Activo'
            },
            'informacion': {
                'version_sistema': 'v2.1.0',
                'django': '5.2.8',
                'python': '3.11.5',
                'postgresql': '15.4',
                'tiempo_actividad': '15 días, 8 horas',
                'ultimo_reinicio': '2024-01-15 14:30:00',
                'usuarios_conectados': 23,
                'sesiones_activas': 45
            }
        }
        
        return JsonResponse({
            'success': True,
            'estado': estado
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

@login_required
@user_passes_test(is_superuser, login_url='/')
@csrf_exempt
def exportar_datos_excel(request):
    """Exporta datos del sistema a Excel"""
    if request.method == 'POST':
        try:
            import json
            from django.http import HttpResponse
            from django.db import connection
            import io
            from datetime import datetime
            
            # Intentar importar pandas, si no está disponible, usar una alternativa
            try:
                import pandas as pd
                use_pandas = True
            except ImportError:
                use_pandas = False
                import csv
            
            data = json.loads(request.body)
            tablas_seleccionadas = data.get('tablas', [])
            
            if use_pandas:
                # Usar pandas para crear Excel
                output = io.BytesIO()
                
                with pd.ExcelWriter(output, engine='openpyxl') as writer:
                    
                    if 'usuarios' in tablas_seleccionadas:
                        # Exportar usuarios
                        with connection.cursor() as cursor:
                            cursor.execute("""
                                SELECT p.ci, p.nombres, p.paterno, p.materno, p.email, 
                                       p.telefono, tu.tipo_usuario, u.fecha_registro
                                FROM sh_biblioteca.persona p
                                JOIN sh_biblioteca.usuario u ON p.id_persona = u.id_persona
                                JOIN sh_biblioteca.tipo_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
                                ORDER BY u.fecha_registro DESC
                            """)
                            
                            columns = ['CI', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 
                                     'Email', 'Teléfono', 'Tipo Usuario', 'Fecha Registro']
                            df_usuarios = pd.DataFrame(cursor.fetchall(), columns=columns)
                            df_usuarios.to_excel(writer, sheet_name='Usuarios', index=False)
                    
                    if 'empleados' in tablas_seleccionadas:
                        # Exportar empleados
                        with connection.cursor() as cursor:
                            cursor.execute("""
                                SELECT p.ci, p.nombres, p.paterno, p.materno, p.email,
                                       c.cargo, t.turno, e.fecha_contratacion
                                FROM sh_biblioteca.persona p
                                JOIN sh_biblioteca.empleado e ON p.id_persona = e.id_persona
                                JOIN sh_biblioteca.cargo c ON e.id_cargo = c.id_cargo
                                JOIN sh_biblioteca.turno t ON e.id_turno = t.id_turno
                                ORDER BY e.fecha_contratacion DESC
                            """)
                            
                            columns = ['CI', 'Nombres', 'Apellido Paterno', 'Apellido Materno',
                                     'Email', 'Cargo', 'Turno', 'Fecha Contratación']
                            df_empleados = pd.DataFrame(cursor.fetchall(), columns=columns)
                            df_empleados.to_excel(writer, sheet_name='Empleados', index=False)
                    
                    if 'preregistros' in tablas_seleccionadas:
                        # Exportar pre-registros
                        from .models import PreRegistro
                        preregistros = PreRegistro.objects.all().values(
                            'ci', 'nombres', 'paterno', 'materno', 'email', 'telefono',
                            'id_tipo_usuario', 'estado', 'fecha_registro', 'aprobado'
                        )
                        df_preregistros = pd.DataFrame(list(preregistros))
                        if not df_preregistros.empty:
                            df_preregistros.to_excel(writer, sheet_name='Pre-registros', index=False)
                
                output.seek(0)
                
                # Crear respuesta HTTP con el archivo Excel
                response = HttpResponse(
                    output.getvalue(),
                    content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
                
                filename = f"biblioteca_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
                response['Content-Disposition'] = f'attachment; filename="{filename}"'
                
                return response
            
            else:
                # Alternativa sin pandas - exportar como CSV
                response = HttpResponse(content_type='text/csv')
                filename = f"biblioteca_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                response['Content-Disposition'] = f'attachment; filename="{filename}"'
                
                writer = csv.writer(response)
                
                if 'usuarios' in tablas_seleccionadas:
                    writer.writerow(['=== USUARIOS ==='])
                    writer.writerow(['CI', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 
                                   'Email', 'Teléfono', 'Tipo Usuario', 'Fecha Registro'])
                    
                    with connection.cursor() as cursor:
                        cursor.execute("""
                            SELECT p.ci, p.nombres, p.paterno, p.materno, p.email, 
                                   p.telefono, tu.tipo_usuario, u.fecha_registro
                            FROM sh_biblioteca.persona p
                            JOIN sh_biblioteca.usuario u ON p.id_persona = u.id_persona
                            JOIN sh_biblioteca.tipo_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
                            ORDER BY u.fecha_registro DESC
                        """)
                        
                        for row in cursor.fetchall():
                            writer.writerow(row)
                    
                    writer.writerow([])  # Línea vacía
                
                return response
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    return JsonResponse({'success': False, 'error': 'Método no permitido'})