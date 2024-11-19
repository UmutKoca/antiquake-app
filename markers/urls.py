from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'markers', views.MarkerViewSet)

urlpatterns = [
    path('', views.UserInfoView.as_view(), name='user_info'),  # Ana sayfa
    path('map/', views.MapView.as_view(), name='map'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('api/', include(router.urls)),
]
