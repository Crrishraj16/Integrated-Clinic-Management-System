#!/bin/bash

# Navigate to the project directory
cd /Users/crrishrajsinhchavda/DMP/backend

# Activate the virtual environment
source venv/bin/activate

# Create serializers if they don't exist
echo "Creating serializers..."
cat <<EOL > apps/users/serializers.py
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
EOL

cat <<EOL > apps/doctors/serializers.py
from rest_framework import serializers
from .models import Doctor

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'
EOL

cat <<EOL > apps/patients/serializers.py
from rest_framework import serializers
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'
EOL

cat <<EOL > apps/appointments/serializers.py
from rest_framework import serializers
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
EOL

# Update urls.py for users
echo "Updating urls.py..."
cat <<EOL >> icms/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.users.views import UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns += [
    path('api/', include(router.urls)),
]
EOL

# Run migrations
echo "Running migrations..."
python3 manage.py makemigrations
python3 manage.py migrate

# Start the development server
echo "Starting the development server..."
python3 manage.py runserver