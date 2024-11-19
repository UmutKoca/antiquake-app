# views.py
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import View
from django.views.generic import TemplateView
from django.shortcuts import render, redirect
from django.contrib import messages
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_gis import filters
from .forms import LoginForm, RegisterForm
from .models import Marker
from .serializers import MarkerSerializer
from django.conf import settings
from .forms import UserInfoForm
from django.http import JsonResponse

class MarkerViewSet(viewsets.ModelViewSet):
    bbox_filter_field = "location"
    filter_backends = [filters.InBBoxFilter]
    queryset = Marker.objects.all()
    serializer_class = MarkerSerializer
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        user_info = self.request.session.get('user_info', {})
        serializer.save(
            username=user_info.get('username'),
            age=user_info.get('age'),
            gender=user_info.get('gender'),
            relationship=user_info.get('relationship')
        )

class MapView(TemplateView):
    template_name = "map.html"

    def get(self, request, *args, **kwargs):
        # Kullanıcı bilgileri yoksa, user_info sayfasına yönlendir
        if not request.session.get('user_info'):
            return redirect('user_info')
        return super().get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['maptiler_api_key'] = settings.MAPTILER_API_KEY
        context['user_info'] = self.request.session.get('user_info', {})
        return context

class LoginView(View):
    template_name = 'auth/login.html'
    
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('map')
        form = LoginForm()
        return render(request, self.template_name, {'form': form})
    
    def post(self, request):
        form = LoginForm(data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                next_url = request.GET.get('next', 'map')
                return redirect(next_url)
        messages.error(request, 'Geçersiz kullanıcı adı veya şifre!')
        return render(request, self.template_name, {'form': form})

class RegisterView(View):
    template_name = 'auth/register.html'
    
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('map')
        form = RegisterForm()
        return render(request, self.template_name, {'form': form})
    
    def post(self, request):
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Hesabınız başarıyla oluşturuldu!')
            return redirect('map')
        return render(request, self.template_name, {'form': form})

class LogoutView(LoginRequiredMixin, View):
    def get(self, request):
        logout(request)
        messages.success(request, 'Başarıyla çıkış yaptınız.')
        return redirect('login')
    
class UserInfoView(View):
    template_name = 'user_info.html'

    def get(self, request):
        # Eğer kullanıcı bilgileri zaten varsa, map'e yönlendir
        if request.session.get('user_info'):
            return redirect('map')
        form = UserInfoForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = UserInfoForm(request.POST)
        if form.is_valid():
            # Kullanıcı bilgilerini session'a kaydet
            request.session['user_info'] = {
                'username': form.cleaned_data['username'],
                'age': form.cleaned_data['age'],
                'gender': form.cleaned_data['gender'],
                'relationship': form.cleaned_data['relationship']
            }
            return redirect('map')
        return render(request, self.template_name, {'form': form})

def logout_view(request):
    logout(request)
    return redirect('user_info')

