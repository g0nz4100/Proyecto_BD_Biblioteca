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

# ========================================
# FORMULARIO PARA AGREGAR ADMINISTRADOR
# ========================================

class AgregarEmpleadoForm(forms.Form):
    """Formulario para agregar empleado - registra en persona y empleado"""
    
    # Datos personales (tabla persona)
    ci = forms.CharField(
        max_length=15,
        label='Cédula de Identidad',
        help_text='Ingrese su cédula de identidad sin puntos ni guiones',
        widget=forms.TextInput(attrs={
            'class': 'form-control', 
            'placeholder': 'Ej: 12345678',
            'pattern': '[0-9]{6,15}',
            'title': 'Solo números, entre 6 y 15 dígitos'
        })
    )
    nombres = forms.CharField(
        max_length=50,
        label='Nombres',
        help_text='Ingrese sus nombres completos',
        widget=forms.TextInput(attrs={
            'class': 'form-control', 
            'placeholder': 'Ej: María Elena',
            'pattern': '[A-Za-zÁ-úa-ú\s]{2,50}',
            'title': 'Solo letras y espacios, mínimo 2 caracteres'
        })
    )
    paterno = forms.CharField(
        max_length=50,
        label='Apellido Paterno',
        help_text='Apellido paterno obligatorio',
        widget=forms.TextInput(attrs={
            'class': 'form-control', 
            'placeholder': 'Ej: González',
            'pattern': '[A-Za-zÁ-úa-ú\s]{2,50}',
            'title': 'Solo letras y espacios, mínimo 2 caracteres'
        })
    )
    materno = forms.CharField(
        max_length=50,
        required=False,
        label='Apellido Materno',
        help_text='Apellido materno (opcional)',
        widget=forms.TextInput(attrs={
            'class': 'form-control', 
            'placeholder': 'Ej: López (opcional)',
            'pattern': '[A-Za-zÁ-úa-ú\s]{0,50}',
            'title': 'Solo letras y espacios'
        })
    )
    direccion = forms.CharField(
        max_length=100,
        required=False,
        label='Dirección',
        help_text='Dirección de domicilio (opcional)',
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Dirección completa'})
    )
    telefono = forms.CharField(
        max_length=15,
        required=False,
        label='Teléfono',
        help_text='Número de teléfono celular o fijo (opcional)',
        widget=forms.TextInput(attrs={
            'class': 'form-control', 
            'placeholder': 'Ej: 70123456 o 22123456',
            'pattern': '[0-9]{7,15}',
            'title': 'Solo números, entre 7 y 15 dígitos'
        })
    )
    email = forms.EmailField(
        max_length=30,
        label='Email',
        help_text='Correo electrónico válido para notificaciones',
        widget=forms.EmailInput(attrs={
            'class': 'form-control', 
            'placeholder': 'empleado@biblioteca.edu.bo',
            'title': 'Ingrese un email válido'
        })
    )
    fecha_nacimiento = forms.DateField(
        required=False,
        label='Fecha de Nacimiento',
        help_text='Fecha de nacimiento (opcional)',
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    )
    id_sexo = forms.ChoiceField(
        choices=[('M', 'Masculino'), ('F', 'Femenino')],
        label='Sexo',
        help_text='Seleccione el sexo',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    # Datos de empleado
    id_cargo = forms.ChoiceField(
        label='Cargo',
        help_text='Cargo que desempeñará en la biblioteca',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    id_turno = forms.ChoiceField(
        label='Turno',
        help_text='Turno de trabajo asignado',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    fecha_contratacion = forms.DateField(
        label='Fecha de Contratación',
        help_text='Fecha de inicio de labores',
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    )
    
    # Datos de acceso al sistema
    username = forms.CharField(
        max_length=30,
        label='Nombre de Usuario',
        help_text='Usuario único para acceder al sistema (4-30 caracteres)',
        widget=forms.TextInput(attrs={
            'class': 'form-control', 
            'placeholder': 'empleado_biblioteca',
            'pattern': '[a-zA-Z0-9_]{4,30}',
            'title': 'Solo letras, números y guiones bajos, 4-30 caracteres'
        })
    )
    password = forms.CharField(
        max_length=128,
        label='Contraseña Temporal',
        help_text='Contraseña temporal (mínimo 8 caracteres, debe cambiarla en el primer acceso)',
        widget=forms.PasswordInput(attrs={
            'class': 'form-control', 
            'placeholder': 'Mínimo 8 caracteres',
            'minlength': '8',
            'title': 'Mínimo 8 caracteres'
        })
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Cargar opciones de cargo desde la BD
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT id_cargo, cargo FROM sh_biblioteca.cargo WHERE id_cargo != 'C-01' ORDER BY cargo")
                cargo_choices = [('', '--- Seleccionar Cargo ---')] + [(row[0], row[1].strip()) for row in cursor.fetchall()]
                self.fields['id_cargo'].choices = cargo_choices
        except:
            self.fields['id_cargo'].choices = [('C-02', 'Bibliotecario'), ('C-03', 'Asistente')]
        
        # Cargar opciones de turno desde la BD
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT id_turno, turno FROM sh_biblioteca.turno ORDER BY turno")
                turno_choices = [('', '--- Seleccionar Turno ---')] + [(row[0], row[1].strip()) for row in cursor.fetchall()]
                self.fields['id_turno'].choices = turno_choices
        except:
            self.fields['id_turno'].choices = [('T-01', 'Mañana'), ('T-02', 'Tarde'), ('T-03', 'Noche')]
    
    def clean_ci(self):
        ci = self.cleaned_data.get('ci')
        if ci:
            if not ci.isdigit():
                raise forms.ValidationError('❌ La cédula debe contener solo números.')
            
            if len(ci) < 6:
                raise forms.ValidationError('❌ La cédula debe tener al menos 6 dígitos.')
            
            if len(ci) > 15:
                raise forms.ValidationError('❌ La cédula no puede tener más de 15 dígitos.')
            
            try:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.persona WHERE ci = %s", [ci])
                    if cursor.fetchone()[0] > 0:
                        raise forms.ValidationError('⚠️ Esta cédula ya está registrada en el sistema.')
            except Exception as e:
                raise forms.ValidationError('❌ Error al verificar la cédula en la base de datos.')
        return ci
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email:
            import re
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, email):
                raise forms.ValidationError('❌ Formato de email inválido.')
            
            try:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.persona WHERE email = %s", [email])
                    if cursor.fetchone()[0] > 0:
                        raise forms.ValidationError('⚠️ Este email ya está registrado en el sistema.')
            except Exception as e:
                raise forms.ValidationError('❌ Error al verificar el email en la base de datos.')
        return email
    
    def clean_username(self):
        username = self.cleaned_data.get('username')
        if username:
            if len(username) < 4:
                raise forms.ValidationError('❌ El nombre de usuario debe tener al menos 4 caracteres.')
            
            if len(username) > 30:
                raise forms.ValidationError('❌ El nombre de usuario no puede tener más de 30 caracteres.')
            
            import re
            if not re.match(r'^[a-zA-Z0-9_]+$', username):
                raise forms.ValidationError('❌ Solo se permiten letras, números y guiones bajos.')
            
            from django.contrib.auth.models import User
            if User.objects.filter(username=username).exists():
                raise forms.ValidationError('⚠️ Este nombre de usuario ya está en uso.')
        return username
    
    def clean_password(self):
        password = self.cleaned_data.get('password')
        if password:
            if len(password) < 8:
                raise forms.ValidationError('❌ La contraseña debe tener al menos 8 caracteres.')
            
            import re
            if not re.search(r'[A-Za-z]', password):
                raise forms.ValidationError('❌ La contraseña debe contener al menos una letra.')
            
            if not re.search(r'[0-9]', password):
                raise forms.ValidationError('❌ La contraseña debe contener al menos un número.')
        return password
    
    def clean_telefono(self):
        telefono = self.cleaned_data.get('telefono')
        if telefono:
            if not telefono.isdigit():
                raise forms.ValidationError('❌ El teléfono debe contener solo números.')
            
            if len(telefono) < 7:
                raise forms.ValidationError('❌ El teléfono debe tener al menos 7 dígitos.')
            
            if len(telefono) > 15:
                raise forms.ValidationError('❌ El teléfono no puede tener más de 15 dígitos.')
        return telefono

class AgregarAdministradorForm(forms.Form):
    """Formulario para agregar administrador - registra en persona, usuario y empleado"""
    
    # Datos personales (tabla persona)
    ci = forms.CharField(
        max_length=15,
        label='Cédula de Identidad',
        help_text='Ingrese su cédula de identidad sin puntos ni guiones',
        widget=forms.TextInput(attrs={
            'class': 'form-control', 
            'placeholder': 'Ej: 12345678',
            'pattern': '[0-9]{6,15}',
            'title': 'Solo números, entre 6 y 15 dígitos'
        })
    )
    nombres = forms.CharField(
        max_length=50,
        label='Nombres',
        help_text='Ingrese sus nombres completos',
        widget=forms.TextInput(attrs={
            'class': 'form-control', 
            'placeholder': 'Ej: Juan Carlos',
            'pattern': '[A-Za-zÁ-úa-ú\s]{2,50}',
            'title': 'Solo letras y espacios, mínimo 2 caracteres'
        })
    )
    paterno = forms.CharField(
        max_length=50,
        label='Apellido Paterno',
        help_text='Apellido paterno obligatorio',
        widget=forms.TextInput(attrs={
            'class': 'form-control', 
            'placeholder': 'Ej: Pérez',
            'pattern': '[A-Za-zÁ-úa-ú\s]{2,50}',
            'title': 'Solo letras y espacios, mínimo 2 caracteres'
        })
    )
    materno = forms.CharField(
        max_length=50,
        required=False,
        label='Apellido Materno',
        help_text='Apellido materno (opcional)',
        widget=forms.TextInput(attrs={
            'class': 'form-control', 
            'placeholder': 'Ej: García (opcional)',
            'pattern': '[A-Za-zÁ-úa-ú\s]{0,50}',
            'title': 'Solo letras y espacios'
        })
    )
    direccion = forms.CharField(
        max_length=100,
        required=False,
        label='Dirección',
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Dirección completa'})
    )
    telefono = forms.CharField(
        max_length=15,
        required=False,
        label='Teléfono',
        help_text='Número de teléfono celular o fijo (opcional)',
        widget=forms.TextInput(attrs={
            'class': 'form-control', 
            'placeholder': 'Ej: 70123456 o 22123456',
            'pattern': '[0-9]{7,15}',
            'title': 'Solo números, entre 7 y 15 dígitos'
        })
    )
    email = forms.EmailField(
        max_length=30,
        label='Email',
        help_text='Correo electrónico válido para notificaciones',
        widget=forms.EmailInput(attrs={
            'class': 'form-control', 
            'placeholder': 'admin@biblioteca.edu.bo',
            'title': 'Ingrese un email válido'
        })
    )
    fecha_nacimiento = forms.DateField(
        required=False,
        label='Fecha de Nacimiento',
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    )
    id_sexo = forms.ChoiceField(
        choices=[('M', 'Masculino'), ('F', 'Femenino')],
        label='Sexo',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    # Datos de empleado
    id_cargo = forms.ChoiceField(
        label='Cargo',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    id_turno = forms.ChoiceField(
        label='Turno',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    fecha_contratacion = forms.DateField(
        label='Fecha de Contratación',
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    )
    
    # Datos de acceso al sistema
    username = forms.CharField(
        max_length=30,
        label='Nombre de Usuario',
        help_text='Usuario único para acceder al sistema (4-30 caracteres)',
        widget=forms.TextInput(attrs={
            'class': 'form-control', 
            'placeholder': 'usuario_admin',
            'pattern': '[a-zA-Z0-9_]{4,30}',
            'title': 'Solo letras, números y guiones bajos, 4-30 caracteres'
        })
    )
    password = forms.CharField(
        max_length=128,
        label='Contraseña Temporal',
        help_text='Contraseña temporal (mínimo 8 caracteres, debe cambiarla en el primer acceso)',
        widget=forms.PasswordInput(attrs={
            'class': 'form-control', 
            'placeholder': 'Mínimo 8 caracteres',
            'minlength': '8',
            'title': 'Mínimo 8 caracteres'
        })
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Cargar opciones de cargo desde la BD
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT id_cargo, cargo FROM sh_biblioteca.cargo ORDER BY cargo")
                cargo_choices = [('', '--- Seleccionar Cargo ---')] + [(row[0], row[1].strip()) for row in cursor.fetchall()]
                self.fields['id_cargo'].choices = cargo_choices
        except:
            self.fields['id_cargo'].choices = [('C-01', 'Administrador'), ('C-02', 'Bibliotecario')]
        
        # Cargar opciones de turno desde la BD
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT id_turno, turno FROM sh_biblioteca.turno ORDER BY turno")
                turno_choices = [('', '--- Seleccionar Turno ---')] + [(row[0], row[1].strip()) for row in cursor.fetchall()]
                self.fields['id_turno'].choices = turno_choices
        except:
            self.fields['id_turno'].choices = [('T-01', 'Mañana'), ('T-02', 'Tarde'), ('T-03', 'Noche')]
    
    def clean_ci(self):
        ci = self.cleaned_data.get('ci')
        if ci:
            # Validar formato
            if not ci.isdigit():
                raise forms.ValidationError('❌ La cédula debe contener solo números.')
            
            if len(ci) < 6:
                raise forms.ValidationError('❌ La cédula debe tener al menos 6 dígitos.')
            
            if len(ci) > 15:
                raise forms.ValidationError('❌ La cédula no puede tener más de 15 dígitos.')
            
            # Verificar que no exista en la BD
            try:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.persona WHERE ci = %s", [ci])
                    if cursor.fetchone()[0] > 0:
                        raise forms.ValidationError('⚠️ Esta cédula ya está registrada en el sistema.')
            except Exception as e:
                raise forms.ValidationError('❌ Error al verificar la cédula en la base de datos.')
        return ci
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email:
            # Validar formato básico
            import re
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, email):
                raise forms.ValidationError('❌ Formato de email inválido.')
            
            # Verificar que no exista en la BD
            try:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT COUNT(*) FROM sh_biblioteca.persona WHERE email = %s", [email])
                    if cursor.fetchone()[0] > 0:
                        raise forms.ValidationError('⚠️ Este email ya está registrado en el sistema.')
            except Exception as e:
                raise forms.ValidationError('❌ Error al verificar el email en la base de datos.')
        return email
    
    def clean_username(self):
        username = self.cleaned_data.get('username')
        if username:
            # Validar longitud
            if len(username) < 4:
                raise forms.ValidationError('❌ El nombre de usuario debe tener al menos 4 caracteres.')
            
            if len(username) > 30:
                raise forms.ValidationError('❌ El nombre de usuario no puede tener más de 30 caracteres.')
            
            # Validar caracteres permitidos
            import re
            if not re.match(r'^[a-zA-Z0-9_]+$', username):
                raise forms.ValidationError('❌ Solo se permiten letras, números y guiones bajos.')
            
            # Verificar que no exista en Django User
            from django.contrib.auth.models import User
            if User.objects.filter(username=username).exists():
                raise forms.ValidationError('⚠️ Este nombre de usuario ya está en uso.')
        return username
    
    def clean_password(self):
        password = self.cleaned_data.get('password')
        if password:
            if len(password) < 8:
                raise forms.ValidationError('❌ La contraseña debe tener al menos 8 caracteres.')
            
            # Validar que tenga al menos una letra y un número
            import re
            if not re.search(r'[A-Za-z]', password):
                raise forms.ValidationError('❌ La contraseña debe contener al menos una letra.')
            
            if not re.search(r'[0-9]', password):
                raise forms.ValidationError('❌ La contraseña debe contener al menos un número.')
        return password
    
    def clean_telefono(self):
        telefono = self.cleaned_data.get('telefono')
        if telefono:
            if not telefono.isdigit():
                raise forms.ValidationError('❌ El teléfono debe contener solo números.')
            
            if len(telefono) < 7:
                raise forms.ValidationError('❌ El teléfono debe tener al menos 7 dígitos.')
            
            if len(telefono) > 15:
                raise forms.ValidationError('❌ El teléfono no puede tener más de 15 dígitos.')
        return telefono