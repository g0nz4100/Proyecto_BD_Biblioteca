from django import forms
from django.db import connection
from .models import PreRegistro
from .utils import get_sexo_choices, get_tipo_usuario_choices, get_grado_academico_choices, get_modalidad_ingreso_choices

class PreRegistroForm(forms.ModelForm):
    """Formulario para el pre-registro que replica las tablas persona y usuario"""
    
    class Meta:
        model = PreRegistro
        fields = [
            # Campos de la tabla persona
            'ci', 'nombres', 'paterno', 'materno', 'direccion', 'telefono', 
            'email', 'fecha_nacimiento', 'id_sexo',
            # Campos de la tabla usuario
            'id_tipo_usuario', 'id_modalidad_ingreso', 'id_grado_academico',
            # Campos de acceso
            'username', 'password'
        ]
        
        widgets = {
            'ci': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ej: 12345678'
            }),
            'nombres': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ingresa tus nombres'
            }),
            'paterno': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Apellido paterno'
            }),
            'materno': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Apellido materno'
            }),
            'direccion': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Dirección completa'
            }),
            'telefono': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ej: 70123456'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'correo@ejemplo.com'
            }),
            'fecha_nacimiento': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'id_sexo': forms.Select(attrs={
                'class': 'form-control'
            }),
            'id_tipo_usuario': forms.RadioSelect(attrs={
                'class': 'form-check-input'
            }),
            'id_modalidad_ingreso': forms.Select(attrs={
                'class': 'form-control'
            }),
            'id_grado_academico': forms.Select(attrs={
                'class': 'form-control'
            }),
            'username': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombre de usuario para ingresar al sistema'
            }),
            'password': forms.PasswordInput(attrs={
                'class': 'form-control',
                'placeholder': 'Contraseña segura',
                'id': 'id_password'
            }),
        }
        
        labels = {
            'ci': 'Cédula de Identidad',
            'nombres': 'Nombres',
            'paterno': 'Apellido Paterno',
            'materno': 'Apellido Materno',
            'direccion': 'Dirección',
            'telefono': 'Teléfono',
            'email': 'Correo Electrónico',
            'fecha_nacimiento': 'Fecha de Nacimiento',
            'id_sexo': 'Sexo',
            'id_tipo_usuario': 'Tipo de Usuario',
            'id_modalidad_ingreso': 'Modalidad de Ingreso',
            'id_grado_academico': 'Grado Académico',
            'username': 'Nombre de Usuario',
            'password': 'Contraseña',
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Usar opciones por defecto (temporalmente para debug)
        self.fields['id_sexo'].choices = [('', '--- Seleccionar ---'), ('M', 'Masculino'), ('F', 'Femenino'), ('O', 'Otro')]
        self.fields['id_tipo_usuario'].choices = [('U-01', 'Estudiante'), ('U-02', 'Docente'), ('U-04', 'Invitado')]
        self.fields['id_grado_academico'].choices = [
            ('', '--- Seleccionar ---'),
            ('GA-01', 'Primaria'),
            ('GA-02', 'Secundaria'), 
            ('GA-03', 'Bachillerato'),
            ('GA-04', 'Técnico'),
            ('GA-05', 'Licenciatura'), 
            ('GA-06', 'Maestría'), 
            ('GA-07', 'Doctorado')
        ]
        self.fields['id_modalidad_ingreso'].choices = [
            ('', '--- Seleccionar ---'),
            ('MIE-01', 'Prueba de Suficiencia Académica (PSA)'),
            ('MIE-02', 'Curso Preuniversitario (CPU)'),
            ('MIE-03', 'Examen de Dispensación'),
            ('MIE-04', 'Transferencia Externa'),
            ('MIE-05', 'Cambio de Carrera')
        ]
        
        # Campos requeridos
        self.fields['ci'].required = True
        self.fields['nombres'].required = True
        self.fields['id_sexo'].required = True
        self.fields['id_tipo_usuario'].required = True
        self.fields['username'].required = True
        self.fields['password'].required = True
        self.fields['email'].required = True  # Email requerido para enviar credenciales
        
        # Campos opcionales (según tu estructura de BD)
        self.fields['paterno'].required = False
        self.fields['materno'].required = False
        self.fields['direccion'].required = False
        self.fields['telefono'].required = False
        self.fields['fecha_nacimiento'].required = False
        
        # Campos académicos obligatorios
        self.fields['id_modalidad_ingreso'].required = True
        self.fields['id_grado_academico'].required = True
    
    def clean_ci(self):
        """Validar que el CI sea único en todo el sistema"""
        ci = self.cleaned_data.get('ci')
        if ci:
            # Verificar formato
            if not ci.isdigit():
                raise forms.ValidationError('La cédula de identidad debe contener solo números.')
            
            if len(ci) < 6 or len(ci) > 15:
                raise forms.ValidationError('La cédula debe tener entre 6 y 15 dígitos.')
            
            # Verificar en pre-registros
            if PreRegistro.objects.filter(ci=ci).exists():
                raise forms.ValidationError('Ya existe un pre-registro pendiente con esta cédula de identidad.')
            
            # Verificar en base de datos principal
            with connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.persona WHERE ci = %s", [ci])
                if cursor.fetchone()[0] > 0:
                    raise forms.ValidationError('Esta cédula de identidad ya está registrada en el sistema.')
        
        return ci
    
    def clean_email(self):
        """Validar que el email sea único en todo el sistema"""
        email = self.cleaned_data.get('email')
        if email:
            # Verificar en pre-registros
            if PreRegistro.objects.filter(email=email).exists():
                raise forms.ValidationError('Ya existe un pre-registro pendiente con este correo electrónico.')
            
            # Verificar en base de datos principal
            with connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.persona WHERE email = %s", [email])
                if cursor.fetchone()[0] > 0:
                    raise forms.ValidationError('Este correo electrónico ya está registrado en el sistema.')
        
        return email
    
    def clean_telefono(self):
        """Validar formato y unicidad del teléfono"""
        telefono = self.cleaned_data.get('telefono')
        if telefono:
            # Verificar formato (solo números y longitud)
            if not telefono.isdigit():
                raise forms.ValidationError('El teléfono debe contener solo números.')
            
            if len(telefono) < 7 or len(telefono) > 15:
                raise forms.ValidationError('El teléfono debe tener entre 7 y 15 dígitos.')
            
            # Verificar en pre-registros
            if PreRegistro.objects.filter(telefono=telefono).exists():
                raise forms.ValidationError('Ya existe un pre-registro con este número de teléfono.')
            
            # Verificar en base de datos principal
            with connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.persona WHERE telefono = %s", [telefono])
                if cursor.fetchone()[0] > 0:
                    raise forms.ValidationError('Este número de teléfono ya está registrado en el sistema.')
        
        return telefono
    
    def clean_username(self):
        """Validar que el username sea único"""
        username = self.cleaned_data.get('username')
        if username:
            if PreRegistro.objects.filter(username=username).exists():
                raise forms.ValidationError('Este nombre de usuario ya está en uso.')
            
            # Validar formato del username
            if len(username) < 4:
                raise forms.ValidationError('El nombre de usuario debe tener al menos 4 caracteres.')
        
        return username
    
    def clean_password(self):
        """Validar que la contraseña sea segura"""
        password = self.cleaned_data.get('password')
        if password:
            if len(password) < 6:
                raise forms.ValidationError('La contraseña debe tener al menos 6 caracteres.')
        
        return password
    
    def clean(self):
        """Validaciones adicionales - campos opcionales"""
        cleaned_data = super().clean()
        # Los campos académicos son opcionales, se llenan según corresponda
        return cleaned_data