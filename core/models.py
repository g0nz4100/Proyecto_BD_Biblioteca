from django.db import models

# ========================================
# MODELOS DE TABLAS CATÁLOGO
# ========================================

class Sexo(models.Model):
    id_sexo = models.CharField(max_length=2, primary_key=True)
    sexo = models.CharField(max_length=20, unique=True)
    
    class Meta:
        db_table = 'sh_biblioteca.sexo'
        managed = False  # Django no gestiona esta tabla
        
    def __str__(self):
        return self.sexo.strip()

class TipoUsuario(models.Model):
    id_tipo_usuario = models.CharField(max_length=4, primary_key=True)
    tipo_usuario = models.CharField(max_length=20)
    
    class Meta:
        db_table = 'sh_biblioteca.tipo_usuario'
        managed = False
        
    def __str__(self):
        return self.tipo_usuario.strip()

class GradoAcademico(models.Model):
    id_grado_academico = models.CharField(max_length=5, primary_key=True)
    grado_academico = models.CharField(max_length=20)
    
    class Meta:
        db_table = 'sh_biblioteca.grado_academico'
        managed = False
        
    def __str__(self):
        return self.grado_academico.strip()

class ModalidadIngreso(models.Model):
    id_modalidad_ingreso = models.CharField(max_length=6, primary_key=True)
    modalidad_ingreso = models.CharField(max_length=60)
    
    class Meta:
        db_table = 'sh_biblioteca.modalidad_ingreso'
        managed = False
        
    def __str__(self):
        return self.modalidad_ingreso.strip()

class EstadoUsuario(models.Model):
    id_estado_usuario = models.CharField(max_length=5, primary_key=True)
    estado_usuario = models.CharField(max_length=20)
    
    class Meta:
        db_table = 'sh_biblioteca.estado_usuario'
        managed = False
        
    def __str__(self):
        return self.estado_usuario.strip()

class Turno(models.Model):
    id_turno = models.CharField(max_length=4, primary_key=True)
    turno = models.CharField(max_length=20)
    
    class Meta:
        db_table = 'sh_biblioteca.turno'
        managed = False
        
    def __str__(self):
        return self.turno.strip()

class Cargo(models.Model):
    id_cargo = models.CharField(max_length=4, primary_key=True)
    cargo = models.CharField(max_length=50)
    
    class Meta:
        db_table = 'sh_biblioteca.cargo'
        managed = False
        
    def __str__(self):
        return self.cargo.strip()

# ========================================
# MODELOS DE TABLAS PRINCIPALES
# ========================================

class Persona(models.Model):
    id_persona = models.AutoField(primary_key=True)
    ci = models.CharField(max_length=15, unique=True)
    nombres = models.CharField(max_length=50)
    paterno = models.CharField(max_length=50, blank=True, null=True)
    materno = models.CharField(max_length=50, blank=True, null=True)
    direccion = models.CharField(max_length=100, blank=True, null=True)
    telefono = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(max_length=30, unique=True, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    id_sexo = models.CharField(max_length=2)  # Referencia a sexo sin FK por ahora
    
    class Meta:
        db_table = 'sh_biblioteca.persona'
        managed = False
        
    def __str__(self):
        return f"{self.nombres} {self.paterno or ''} {self.materno or ''}".strip()

class Usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    id_persona = models.IntegerField(unique=True)  # Referencia a persona sin FK por ahora
    id_tipo_usuario = models.CharField(max_length=4)
    id_modalidad_ingreso = models.CharField(max_length=6, blank=True, null=True)
    id_grado_academico = models.CharField(max_length=5, blank=True, null=True)
    id_estado_usuario = models.CharField(max_length=5, blank=True, null=True)
    fecha_registro = models.DateField(auto_now_add=True)
    
    class Meta:
        db_table = 'sh_biblioteca.usuario'
        managed = False
        
    def __str__(self):
        return f"Usuario {self.id_usuario}"

class Empleado(models.Model):
    id_empleado = models.AutoField(primary_key=True)
    id_persona = models.IntegerField()
    id_turno = models.CharField(max_length=4)
    id_cargo = models.CharField(max_length=4)
    fecha_contratacion = models.DateField()
    
    class Meta:
        db_table = 'sh_biblioteca.empleado'
        managed = False
        
    def __str__(self):
        return f"Empleado {self.id_empleado}"

# ========================================
# MODELO TEMPORAL PARA PRE-REGISTRO
# ========================================

class PreRegistro(models.Model):
    """Modelo temporal que replica exactamente las tablas persona y usuario para pre-registro"""
    
    TIPO_USUARIO_CHOICES = [
        ('U-01', 'Estudiante'),
        ('U-02', 'Docente'),
        ('U-04', 'Invitado'),
    ]
    
    SEXO_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
    ]
    
    GRADO_ACADEMICO_CHOICES = [
        ('GA-01', 'Primaria'),
        ('GA-02', 'Secundaria'),
        ('GA-03', 'Bachillerato'),
        ('GA-04', 'Técnico'),
        ('GA-05', 'Licenciatura'),
        ('GA-06', 'Maestría'),
        ('GA-07', 'Doctorado'),
    ]
    
    MODALIDAD_INGRESO_CHOICES = [
        ('MIE-01', 'Prueba de Suficiencia Académica (PSA)'),
        ('MIE-02', 'Curso Preuniversitario (CPU)'),
        ('MIE-03', 'Examen de Dispensación (Excelencia Académica)'),
        ('MIE-04', 'Transferencia Externa'),
        ('MIE-05', 'Cambio de Carrera'),
        ('MIE-06', 'Convenios Especiales'),
        ('MIE-07', 'Titulados'),
        ('MID-08', 'Concurso de Méritos y Examen de Competencia'),
        ('MID-09', 'Interinato (Designación Temporal)'),
        ('MID-10', 'Contrato Docente'),
        ('MID-11', 'Titularización por Antigüedad'),
        ('MID-12', 'Designación Directa (Autoridades)'),
    ]
    
    # ========================================
    # CAMPOS DE LA TABLA PERSONA
    # ========================================
    ci = models.CharField(max_length=15, unique=True, verbose_name="Cédula de Identidad")
    nombres = models.CharField(max_length=50, verbose_name="Nombres")
    paterno = models.CharField(max_length=50, blank=True, null=True, verbose_name="Apellido Paterno")
    materno = models.CharField(max_length=50, blank=True, null=True, verbose_name="Apellido Materno")
    direccion = models.CharField(max_length=100, blank=True, null=True, verbose_name="Dirección")
    telefono = models.CharField(max_length=15, blank=True, null=True, verbose_name="Teléfono")
    email = models.EmailField(max_length=30, unique=True, blank=True, null=True, verbose_name="Correo Electrónico")
    fecha_nacimiento = models.DateField(blank=True, null=True, verbose_name="Fecha de Nacimiento")
    id_sexo = models.CharField(max_length=2, choices=SEXO_CHOICES, verbose_name="Sexo")
    
    # ========================================
    # CAMPOS DE LA TABLA USUARIO
    # ========================================
    id_tipo_usuario = models.CharField(max_length=4, choices=TIPO_USUARIO_CHOICES, verbose_name="Tipo de Usuario")
    id_modalidad_ingreso = models.CharField(max_length=6, choices=MODALIDAD_INGRESO_CHOICES, blank=True, null=True, verbose_name="Modalidad de Ingreso")
    id_grado_academico = models.CharField(max_length=5, choices=GRADO_ACADEMICO_CHOICES, blank=True, null=True, verbose_name="Grado Académico")
    
    # ========================================
    # CAMPOS DE ACCESO AL SISTEMA
    # ========================================
    username = models.CharField(max_length=30, unique=True, verbose_name="Nombre de Usuario", default='temp_user')
    password = models.CharField(max_length=128, verbose_name="Contraseña", default='temp123')
    
    # ========================================
    # CAMPOS DE CONTROL DEL PRE-REGISTRO
    # ========================================
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente de Revisión'),
        ('ACTIVO', 'Activo'),
        ('INACTIVO', 'Inactivo'),
        ('RECHAZADO', 'Rechazado'),
    ]
    
    fecha_registro = models.DateTimeField(auto_now_add=True)
    aprobado = models.BooleanField(default=False)
    fecha_aprobacion = models.DateTimeField(blank=True, null=True)
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='PENDIENTE', verbose_name="Estado")
    observaciones = models.TextField(blank=True)
    
    class Meta:
        db_table = 'pre_registro'  # Esta tabla la creará Django
        ordering = ['-fecha_registro']
        
    def __str__(self):
        return f"{self.nombres} {self.paterno or ''} - {self.get_id_tipo_usuario_display()}"