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

# ========================================
# SERVICIO PARA CREAR ADMINISTRADOR
# ========================================

def crear_empleado(datos_formulario):
    """
    Crear empleado completo: persona + empleado + usuario Django
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
                datos_formulario['ci'],
                datos_formulario['nombres'],
                datos_formulario['paterno'],
                datos_formulario['materno'],
                datos_formulario['direccion'],
                datos_formulario['telefono'],
                datos_formulario['email'],
                datos_formulario['fecha_nacimiento'],
                datos_formulario['id_sexo']
            ])
            
            id_persona = cursor.fetchone()[0]
            
            # 2. Insertar en tabla empleado
            cursor.execute("""
                INSERT INTO sh_biblioteca.empleado 
                (id_persona, id_turno, id_cargo, fecha_contratacion)
                VALUES (%s, %s, %s, %s)
                RETURNING id_empleado
            """, [
                id_persona,
                datos_formulario['id_turno'],
                datos_formulario['id_cargo'],
                datos_formulario['fecha_contratacion']
            ])
            
            id_empleado = cursor.fetchone()[0]
            
            # 3. Crear usuario Django para acceso al sistema (staff, no superuser)
            from django.contrib.auth.models import User
            django_user = User.objects.create_user(
                username=datos_formulario['username'],
                email=datos_formulario['email'],
                password=datos_formulario['password'],
                first_name=datos_formulario['nombres'],
                last_name=f"{datos_formulario['paterno']} {datos_formulario['materno'] or ''}".strip(),
                is_staff=True,  # Puede acceder al admin
                is_superuser=False  # No es superusuario
            )
            
            return {
                'success': True,
                'id_persona': id_persona,
                'id_empleado': id_empleado,
                'django_user_id': django_user.id,
                'message': 'Empleado creado exitosamente'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def crear_administrador(datos_formulario):
    """
    Crear administrador completo: persona + usuario + empleado + usuario Django
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
                datos_formulario['ci'],
                datos_formulario['nombres'],
                datos_formulario['paterno'],
                datos_formulario['materno'],
                datos_formulario['direccion'],
                datos_formulario['telefono'],
                datos_formulario['email'],
                datos_formulario['fecha_nacimiento'],
                datos_formulario['id_sexo']
            ])
            
            id_persona = cursor.fetchone()[0]
            
            # 2. Insertar en tabla usuario (tipo administrador)
            cursor.execute("""
                INSERT INTO sh_biblioteca.usuario 
                (id_persona, id_tipo_usuario, id_modalidad_ingreso, id_grado_academico, id_estado_usuario, fecha_registro)
                VALUES (%s, %s, %s, %s, %s, CURRENT_DATE)
                RETURNING id_usuario
            """, [
                id_persona,
                'U-03',  # Tipo administrador
                'MID-08',  # Modalidad por defecto para administradores
                'GA-05',   # Grado académico por defecto
                'EU-01'    # Estado activo
            ])
            
            id_usuario = cursor.fetchone()[0]
            
            # 3. Insertar en tabla empleado
            cursor.execute("""
                INSERT INTO sh_biblioteca.empleado 
                (id_persona, id_turno, id_cargo, fecha_contratacion)
                VALUES (%s, %s, %s, %s)
                RETURNING id_empleado
            """, [
                id_persona,
                datos_formulario['id_turno'],
                datos_formulario['id_cargo'],
                datos_formulario['fecha_contratacion']
            ])
            
            id_empleado = cursor.fetchone()[0]
            
            # 4. Crear usuario Django para acceso al sistema
            from django.contrib.auth.models import User
            django_user = User.objects.create_user(
                username=datos_formulario['username'],
                email=datos_formulario['email'],
                password=datos_formulario['password'],
                first_name=datos_formulario['nombres'],
                last_name=f"{datos_formulario['paterno']} {datos_formulario['materno'] or ''}".strip(),
                is_staff=True,  # Puede acceder al admin
                is_superuser=True  # Es superusuario
            )
            
            return {
                'success': True,
                'id_persona': id_persona,
                'id_usuario': id_usuario,
                'id_empleado': id_empleado,
                'django_user_id': django_user.id,
                'message': 'Administrador creado exitosamente'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }