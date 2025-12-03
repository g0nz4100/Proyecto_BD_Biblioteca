from django.db import connection

def get_sexo_choices():
    """Obtiene las opciones de sexo desde la base de datos"""
    cursor = connection.cursor()
    cursor.execute('SELECT id_sexo, sexo FROM sh_biblioteca.sexo')
    return [(row[0].strip(), row[1].strip()) for row in cursor.fetchall()]

def get_tipo_usuario_choices():
    """Obtiene las opciones de tipo de usuario desde la base de datos"""
    cursor = connection.cursor()
    cursor.execute('SELECT id_tipo_usuario, tipo_usuario FROM sh_biblioteca.tipo_usuario WHERE id_tipo_usuario IN (%s, %s, %s)', ['U-01', 'U-02', 'U-04'])
    return [(row[0].strip(), row[1].strip()) for row in cursor.fetchall()]

def get_grado_academico_choices():
    """Obtiene las opciones de grado académico desde la base de datos"""
    cursor = connection.cursor()
    cursor.execute('SELECT id_grado_academico, grado_academico FROM sh_biblioteca.grado_academico')
    return [(row[0].strip(), row[1].strip()) for row in cursor.fetchall()]

def get_modalidad_ingreso_choices():
    """Obtiene las opciones de modalidad de ingreso desde la base de datos"""
    cursor = connection.cursor()
    cursor.execute('SELECT id_modalidad_ingreso, modalidad_ingreso FROM sh_biblioteca.modalidad_ingreso')
    return [(row[0].strip(), row[1].strip()) for row in cursor.fetchall()]