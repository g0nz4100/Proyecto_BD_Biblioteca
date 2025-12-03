from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.utils import timezone
import json
from .forms import PreRegistroForm
from .models import PreRegistro
from .services import crear_usuario_desde_preregistro, verificar_ci_existe, verificar_email_existe
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