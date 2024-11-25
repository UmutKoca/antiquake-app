# Antiquake Risk Avcıları

Antiquake Risk Avcıları, Üsküdar Kuzguncuk Mahallesi'nde deprem risklerini haritalandırmak ve mahalle sakinlerinin katılımıyla risk verilerini toplamak için geliştirilmiş bir web uygulamasıdır.

## Özellikler

- İnteraktif risk haritası üzerinde:
  - Risk noktalarını işaretleme
  - Fotoğraf ve açıklama ekleme
  - Mevcut risk noktalarını görüntüleme
  - Adres arama ve konuma gitme
- Kullanıcı yönetimi:
  - Kayıt ve giriş sistemi
  - Demografik bilgi toplama
- Kuzguncuk mahalle sınırlarını görüntüleme
- Coğrafi konumlu veri toplama

## Teknolojiler

- Python 3.x
- Django 5.1
- Django REST Framework
- PostgreSQL + PostGIS
- MapLibre GL JS
- MapTiler
- Tailwind CSS + DaisyUI

## Kurulum

1. Repository'yi klonlayın:
```bash
git clone https://github.com/[kullaniciadi]/antiquake-app.git
cd antiquake-app
```

2. Virtual environment oluşturun ve aktif edin:
```bash
python -m venv venv
# Windows için:
venv\Scripts\activate
# Linux/Mac için:
source venv/bin/activate
```

3. Gerekli paketleri yükleyin:
```bash
pip install -r requirements.txt
```

4. .env dosyasını oluşturun:
```bash
cp .env.example .env
```
Ve gerekli ortam değişkenlerini ayarlayın (MapTiler API anahtarı vb.)

5. PostgreSQL veritabanını oluşturun ve PostGIS eklentisini ekleyin:
```sql
CREATE DATABASE antiquake;
\c antiquake
CREATE EXTENSION postgis;
```

6. Veritabanı migrasyonlarını yapın:
```bash
python manage.py migrate
```

7. Geliştirme sunucusunu başlatın:
```bash
python manage.py runserver
```

Uygulama http://localhost:8000 adresinde çalışmaya başlayacaktır.

## Katkıda Bulunma

1. Bu repository'yi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeniOzellik`)
5. Bir Pull Request oluşturun

## Lisans

Bu proje GNU General Public License v3.0 (GPL-3.0) lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.
