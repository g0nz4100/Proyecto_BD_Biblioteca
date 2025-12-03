from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Crea usuarios de prueba para el sistema'

    def handle(self, *args, **options):
        # Crear superusuario
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@biblioteca.edu.bo',
                password='admin123',
                first_name='Super',
                last_name='Usuario'
            )
            self.stdout.write(
                self.style.SUCCESS('Superusuario creado: admin / admin123')
            )
        else:
            self.stdout.write(
                self.style.WARNING('El superusuario "admin" ya existe')
            )

        # Crear empleado/staff
        if not User.objects.filter(username='empleado').exists():
            User.objects.create_user(
                username='empleado',
                email='empleado@biblioteca.edu.bo',
                password='emp123',
                first_name='Empleado',
                last_name='Biblioteca',
                is_staff=True
            )
            self.stdout.write(
                self.style.SUCCESS('Empleado creado: empleado / emp123')
            )
        else:
            self.stdout.write(
                self.style.WARNING('El empleado "empleado" ya existe')
            )

        # Crear usuario normal
        if not User.objects.filter(username='usuario').exists():
            User.objects.create_user(
                username='usuario',
                email='usuario@biblioteca.edu.bo',
                password='user123',
                first_name='Usuario',
                last_name='Normal'
            )
            self.stdout.write(
                self.style.SUCCESS('Usuario normal creado: usuario / user123')
            )
        else:
            self.stdout.write(
                self.style.WARNING('El usuario "usuario" ya existe')
            )

        self.stdout.write(
            self.style.SUCCESS('\n¡Usuarios de prueba listos!')
        )