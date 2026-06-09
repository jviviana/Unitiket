from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Estudiante/Docente'),
        ('technician', 'Técnico'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')

class Ticket(models.Model):
    STATUS_CHOICES = (
        ('OPEN', 'Abierto'),
        ('IN_PROGRESS', 'En Progreso'),
        ('RESOLVED', 'Resuelto'),
    )

    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    location = models.CharField(max_length=100)
    equipment_id = models.CharField(max_length=50)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    resolution_comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.equipment_id} - {self.status}"
