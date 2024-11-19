from django.contrib.gis.db import models

class Marker(models.Model):
    description = models.TextField(max_length=500, null=True, blank=True)  # Making this field nullable
    location = models.PointField()
    photo = models.ImageField(upload_to='photos/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    username = models.CharField(max_length=150)
    age = models.IntegerField()
    gender = models.CharField(max_length=10)
    relationship = models.CharField(max_length=50)

    def __str__(self):
        return f"Marker at {self.location} - {self.description[:50]}"