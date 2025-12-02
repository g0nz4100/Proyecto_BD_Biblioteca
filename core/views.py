from django.shortcuts import render

def home(request):
    """Vista principal de la página de inicio"""
    context = {
        'titulo': 'Biblioteca Universitaria',
        'descripcion': 'Sistema de gestión bibliotecaria moderno'
    }
    return render(request, 'core/home.html', context)