from rest_framework import routers

from markers.views import (
    MarkerViewSet,
)

router = routers.DefaultRouter()
router.register(r"markers", MarkerViewSet)

urlpatterns = router.urls
