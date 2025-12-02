# 📚 Sistema de Gestión de Biblioteca Universitaria

Sistema web moderno desarrollado con Django para la gestión integral de una biblioteca universitaria.

## 🚀 Características

- **Interfaz moderna** con Bootstrap 5.3
- **Sistema de usuarios** multinivel (Superusuario, Administrador, Empleado, Usuario)
- **Gestión de libros** y catálogo digital
- **Sistema de préstamos** y reservas
- **Dashboard personalizado** por tipo de usuario
- **Base de datos PostgreSQL** robusta
- **Diseño responsive** para todos los dispositivos

## 👥 Tipos de Usuario

### 🔧 Superusuario
- Control absoluto del sistema
- Gestión de backups
- Habilitación/deshabilitación de funciones

### 👨‍💼 Administrador
- Gestión de empleados y usuarios
- Generación de reportes
- Estadísticas del sistema
- Dashboard administrativo

### 👩‍💻 Empleado/Bibliotecario
- Registro de libros y usuarios
- Gestión de préstamos y devoluciones
- Validación de pre-registros
- Operaciones diarias

### 🎓 Usuarios (Estudiante, Docente, Visitante)
- Pre-registro online
- Reservas de libros
- Catálogo digital
- Calificación y comentarios
- Dashboard personalizado

## 🛠️ Tecnologías

- **Backend:** Django 5.2.8
- **Frontend:** Bootstrap 5.3, HTML5, CSS3, JavaScript
- **Base de datos:** PostgreSQL
- **Iconos:** Font Awesome 6.5
- **Tipografía:** Inter Font

## 📋 Requisitos

- Python 3.8+
- PostgreSQL 12+
- Django 5.2.8
- psycopg2-binary

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/g0nz4100/Proyecto_BD_Biblioteca.git
cd Proyecto_BD_Biblioteca
```

2. **Crear entorno virtual**
```bash
python -m venv venv
```

3. **Activar entorno virtual**
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

4. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

5. **Configurar base de datos**
- Crear base de datos PostgreSQL llamada `bd_biblioteca`
- Ejecutar el script SQL proporcionado para crear las tablas
- Actualizar credenciales en `settings.py`

6. **Ejecutar migraciones**
```bash
python manage.py migrate
```

7. **Ejecutar servidor**
```bash
python manage.py runserver
```

## 📁 Estructura del Proyecto

```
Proyecto_BD_Biblioteca/
├── biblioteca/          # Configuración principal
├── core/               # Aplicación principal
├── static/             # Archivos estáticos
│   ├── css/           # Estilos CSS
│   ├── js/            # JavaScript
│   └── images/        # Imágenes
├── templates/          # Plantillas HTML
│   ├── base/          # Templates base
│   └── core/          # Templates de la app
├── venv/              # Entorno virtual
├── manage.py          # Script de Django
├── requirements.txt   # Dependencias
└── README.md         # Este archivo
```

## 🎨 Características de Diseño

- **Colores:** Paleta azul moderna (#1e40af)
- **Tipografía:** Inter font para mejor legibilidad
- **Responsive:** Adaptable a todos los dispositivos
- **Accesibilidad:** Cumple estándares WCAG
- **UX/UI:** Interfaz intuitiva y moderna

## 📊 Base de Datos

El sistema utiliza un esquema PostgreSQL robusto con:
- **Tablas principales:** persona, usuario, empleado, libro, prestamo
- **Tablas de catálogo:** Más de 20 tablas de referencia
- **Relaciones:** FK bien definidas para integridad
- **Esquema:** `sh_biblioteca`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Gonzalo** - [g0nz4100](https://github.com/g0nz4100)

## 📞 Contacto

- **Email:** biblioteca@universidad.edu.bo
- **Teléfono:** +591 2 123-4567
- **Ubicación:** Campus Universitario, La Paz

---

⭐ ¡Dale una estrella si te gusta el proyecto!