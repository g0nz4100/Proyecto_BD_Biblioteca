from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.home, name='home'),
    path('pre-registro/', views.pre_registro, name='pre_registro'),
    path('gestionar-preregistros/', views.gestionar_preregistros, name='gestionar_preregistros'),
    path('aprobar-preregistro/<int:preregistro_id>/', views.aprobar_preregistro, name='aprobar_preregistro'),
    path('rechazar-preregistro/<int:preregistro_id>/', views.rechazar_preregistro, name='rechazar_preregistro'),
    path('bloquear-usuario/<int:preregistro_id>/', views.bloquear_usuario, name='bloquear_usuario'),
    path('activar-usuario/<int:preregistro_id>/', views.activar_usuario, name='activar_usuario'),
]