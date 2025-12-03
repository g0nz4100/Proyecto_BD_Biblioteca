"""
Servicios para gestionar la aprobación de pre-registros
"""
from django.db import connection
from .models import PreRegistro

def crear_usuario_desde_preregistro(preregistro):
    """
    Crear usuario real en las tablas persona y usuario desde un pre-registro aprobado
    """
    try:
        with connection.cursor() as cursor:
            # 1. Insertar en tabla persona
            cursor.execute("""
                INSERT INTO sh_biblioteca.persona 
                (ci, nombres, paterno, materno, direccion, telefono, email, fecha_nacimiento, id_sexo)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id_persona
            """, [
                preregistro.ci,
                preregistro.nombres,
                preregistro.paterno,
                preregistro.materno,
                preregistro.direccion,
                preregistro.telefono,
                preregistro.email,
                preregistro.fecha_nacimiento,
                preregistro.id_sexo
            ])
            
            id_persona = cursor.fetchone()[0]
            
            # 2. Insertar en tabla usuario
            cursor.execute("""
                INSERT INTO sh_biblioteca.usuario 
                (id_persona, id_tipo_usuario, id_modalidad_ingreso, id_grado_academico, id_estado_usuario, fecha_registro)
                VALUES (%s, %s, %s, %s, %s, CURRENT_DATE)
                RETURNING id_usuario
            """, [
                id_persona,
                preregistro.id_tipo_usuario,
                preregistro.id_modalidad_ingreso,
                preregistro.id_grado_academico,
                'EU-01'  # Estado activo por defecto
            ])
            
            id_usuario = cursor.fetchone()[0]
            
            return {
                'success': True,
                'id_persona': id_persona,
                'id_usuario': id_usuario
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def verificar_ci_existe(ci):
    """Verificar si un CI ya existe en la tabla persona"""
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.persona WHERE ci = %s", [ci])
        return cursor.fetchone()[0] > 0

def verificar_email_existe(email):
    """Verificar si un email ya existe en la tabla persona"""
    if not email:
        return False
        
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.persona WHERE email = %s", [email])
        return cursor.fetchone()[0] > 0

def verificar_username_existe(username):
    """Verificar si un username ya existe (aquí podrías verificar en tu tabla de usuarios de Django)"""
    # Por ahora solo verificamos en pre-registros, pero podrías agregar verificación en tabla de usuarios reales
    from .models import PreRegistro
    return PreRegistro.objects.filter(username=username).exists()