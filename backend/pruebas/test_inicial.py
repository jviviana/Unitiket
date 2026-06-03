import pytest
from django.urls import reverse

@pytest.mark.django_db
def test_ejemplo_basico():
    """Prueba básica para asegurar que el sistema de pruebas funciona."""
    assert 1 + 1 == 2

@pytest.mark.django_db
def test_acceso_home(client):
    """Verifica que el servidor responde correctamente (status 200 o 302)."""
    # Usamos la raíz del sitio o la de admin sin renderizado profundo
    url = reverse('admin:login')
    response = client.get(url)
    assert response.status_code in [200, 302]
