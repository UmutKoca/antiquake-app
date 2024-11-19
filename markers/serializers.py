from rest_framework import serializers
from rest_framework_gis import serializers as gis_serializers
from markers.models import Marker

class MarkerSerializer(gis_serializers.GeoFeatureModelSerializer):
    username = serializers.CharField(required=False)
    age = serializers.IntegerField(required=False)
    gender = serializers.CharField(required=False)
    relationship = serializers.CharField(required=False)

    class Meta:
        model = Marker
        fields = ("id", "description", "photo", "created_at", "username", "age", "gender", "relationship")
        read_only_fields = ("created_at",)
        geo_field = "location"