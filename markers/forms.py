from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User

# Ortak form stilleri için mixin
class FormStyleMixin:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({
                'class': 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200'
            })

class LoginForm(FormStyleMixin, AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs['placeholder'] = 'Kullanıcı adı'
        self.fields['username'].widget.attrs['autocomplete'] = 'username'
        self.fields['password'].widget.attrs['placeholder'] = 'Şifre'
        self.fields['password'].widget.attrs['autocomplete'] = 'current-password'

    error_messages = {
        'invalid_login': 'Lütfen geçerli bir kullanıcı adı ve şifre giriniz.',
        'inactive': 'Bu hesap aktif değil.',
    }

class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Form field labels
        self.fields['username'].label = 'Kullanıcı Adı'
        self.fields['email'].label = 'E-posta'
        self.fields['password1'].label = 'Şifre'
        self.fields['password2'].label = 'Şifre (Tekrar)'
        
        # Common style for all fields
        common_classes = (
            "w-full py-2 bg-transparent border-0 focus:ring-0 focus:outline-none "
            "text-gray-900 placeholder-gray-500 text-sm"
        )
        
        # Field specific attributes
        field_attrs = {
            'username': {
                'class': common_classes,
                'placeholder': 'Kullanıcı adı',
                'autocomplete': 'username',
            },
            'email': {
                'class': common_classes,
                'placeholder': 'ornek@email.com',
                'autocomplete': 'email',
            },
            'password1': {
                'class': common_classes,
                'placeholder': '********',
                'autocomplete': 'new-password',
            },
            'password2': {
                'class': common_classes,
                'placeholder': '********',
                'autocomplete': 'new-password',
            },
        }
        
        # Apply attributes to fields
        for field_name, attrs in field_attrs.items():
            self.fields[field_name].widget.attrs.update(attrs)
            
        # Kısaltılmış yardım metinleri
        self.fields['password1'].help_text = 'En az 8 karakter olmalıdır.'
        self.fields['username'].help_text = None  # Username help text'i kaldır
        
class UserInfoForm(forms.Form):
    GENDER_CHOICES = [
        ('Erkek', 'Erkek'),
        ('Kadın', 'Kadın'),
        ('Diğer', 'Diğer'),
    ]

    RELATIONSHIP_CHOICES = [
        ('Burada oturuyorum', 'Burada oturuyorum'),
        ('Burada çalışıyorum', 'Burada çalışıyorum'),
        ('Ziyaretçiyim', 'Ziyaretçiyim'),
        ('Burada Okuyorum', 'Burada Okuyorum'),
    ]

    username = forms.CharField(
        max_length=150,
        label='Kullanıcı Adı',
        widget=forms.TextInput(attrs={
            'class': 'w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            'placeholder': 'Kullanıcı Adınız'
        })
    )
    age = forms.IntegerField(
        label='Yaş',
        widget=forms.NumberInput(attrs={
            'class': 'w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            'placeholder': 'Yaşınız',
            'min': '1',
            'max': '120'
        })
    )
    gender = forms.ChoiceField(
        choices=GENDER_CHOICES,
        label='Cinsiyet',
        widget=forms.Select(attrs={
            'class': 'w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
        })
    )
    relationship = forms.ChoiceField(
        choices=RELATIONSHIP_CHOICES,
        label='Kuzguncuk ile İlişkiniz',
        widget=forms.Select(attrs={
            'class': 'w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
        })
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)