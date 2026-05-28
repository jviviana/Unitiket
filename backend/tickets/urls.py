from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, MeView, TicketListCreateView, TicketDetailView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='auth_login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('auth/me/', MeView.as_view(), name='auth_me'),
    
    path('tickets/', TicketListCreateView.as_view(), name='ticket_list_create'),
    path('tickets/<int:pk>/', TicketDetailView.as_view(), name='ticket_detail'),
]
