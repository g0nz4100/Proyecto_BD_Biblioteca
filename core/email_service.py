"""
Servicio para envío de emails del sistema de biblioteca
"""
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

def enviar_email_aprobacion(preregistro, id_usuario):
    """
    Enviar email con datos de acceso cuando se aprueba un pre-registro
    """
    try:
        # Renderizar el template del email
        mensaje_html = render_to_string('emails/aprobacion_preregistro.html', {
            'nombre': f"{preregistro.nombres} {preregistro.paterno or ''}".strip(),
            'username': preregistro.username,
            'password': preregistro.password,  # En producción, generar nueva contraseña
            'tipo_usuario': preregistro.get_id_tipo_usuario_display(),
            'id_usuario': id_usuario,
        })
        
        # Mensaje de texto plano como respaldo
        mensaje_texto = f"""
¡Hola {preregistro.nombres}!

Tu pre-registro ha sido APROBADO por nuestro equipo.

Datos de acceso al Sistema de Biblioteca:
- Usuario: {preregistro.username}
- Contraseña: {preregistro.password}
- Tipo de usuario: {preregistro.get_id_tipo_usuario_display()}
- ID de usuario: {id_usuario}

Ya puedes ingresar al sistema con estos datos.

¡Bienvenido/a a la Biblioteca Universitaria!

Saludos,
Equipo de la Biblioteca
        """
        
        # Enviar email
        send_mail(
            subject='✅ Pre-registro Aprobado - Biblioteca Universitaria',
            message=mensaje_texto,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[preregistro.email],
            html_message=mensaje_html,
            fail_silently=False,
        )
        
        return True
        
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False

def enviar_email_rechazo(preregistro, motivo):
    """
    Enviar email cuando se rechaza un pre-registro
    """
    try:
        mensaje_texto = f"""
Hola {preregistro.nombres},

Lamentamos informarte que tu pre-registro no ha sido aprobado.

Motivo: {motivo}

Si tienes dudas, puedes contactarnos o intentar registrarte nuevamente.

Saludos,
Equipo de la Biblioteca
        """
        
        send_mail(
            subject='❌ Pre-registro No Aprobado - Biblioteca Universitaria',
            message=mensaje_texto,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[preregistro.email],
            fail_silently=False,
        )
        
        return True
        
    except Exception as e:
        print(f"Error enviando email de rechazo: {e}")
        return False