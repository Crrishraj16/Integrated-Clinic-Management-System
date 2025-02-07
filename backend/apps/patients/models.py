from django.db import models
from apps.users.models import User

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth = models.DateField()
    blood_group = models.CharField(max_length=5)
    medical_history = models.TextField(blank=True)
    
    def __str__(self):
        return self.user.get_full_name()