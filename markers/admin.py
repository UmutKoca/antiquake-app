from django.contrib import admin
from django.contrib.gis import admin as gis_admin
from .models import Marker

admin.site.register(Marker, gis_admin.GISModelAdmin)