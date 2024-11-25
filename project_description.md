# Antiquake Risk Avcıları Web Uygulaması

## Proje Hakkında

Antiquake Risk Avcıları web uygulaması, aşağıdan yukarıya doğru bir afet yönetimi modeli oluşturmayı hedefleyen topluluk projesinin teknolojik bileşenidir. Pilot bölge olarak seçilen Üsküdar Kuzguncuk Mahallesi'nde, mahalle sakinlerinin aktif katılımıyla depreme hazırlık çalışmalarını desteklemek ve koordine etmek amacıyla geliştirilmiştir.

## Mevcut Özellikler

- **İnteraktif Risk Haritası**: 
  - Kuzguncuk mahallesi sınırları içinde risk noktalarını işaretleme
  - Her risk noktası için detaylı açıklama ve fotoğraf ekleme
  - Harita üzerinde mevcut risk noktalarını görüntüleme
  - Adres arama ve konuma gitme

- **Kullanıcı Yönetimi**:
  - Kullanıcı kaydı ve girişi
  - Demografik bilgi toplama (yaş, cinsiyet, mahalle ile ilişki)
  - Oturum yönetimi

- **Veri Toplama**:
  - Coğrafi konumlu risk noktaları
  - Risk noktalarına ait fotoğraflar
  - Kullanıcı demografik verileri
  - Zaman damgalı veri kayıtları

## Teknoloji Altyapısı

### Web Uygulaması
- **Backend**: Django 5.1
  - Django REST Framework ve GIS desteği
  - PostgreSQL veritabanı (PostGIS uzantısı ile)
  - Python 3.x

- **Frontend**: 
  - Django Templates
  - Tailwind CSS ve DaisyUI
  - MapLibre GL JS harita kütüphanesi
  - MapTiler geocoding servisi
  - Modern ve responsive tasarım

### Güvenlik ve Kimlik Doğrulama
- Django Allauth entegrasyonu
- Güvenli oturum yönetimi
- CSRF koruması
- Dosya yükleme güvenliği (Pillow)

### Veri Yönetimi
- PostgreSQL + PostGIS
- Django ORM
- REST API desteği
- Coğrafi veri işleme yetenekleri

## Açık Kaynak ve Topluluk

Antiquake Risk Avcıları uygulaması, açık kaynak bir projedir. GNU General Public License (GPL) altında dağıtılmaktadır. Bu sayede:

- Kodun şeffaf ve denetlenebilir olması
- Topluluk katkılarına açık olması
- Benzer projeler için örnek teşkil etmesi
- Sürdürülebilir geliştirme ortamı sağlanması
- Özgür yazılım felsefesinin desteklenmesi

hedeflenmektedir.

## Proje Çıktıları ve Beklenen Etkiler

1. **Veri Odaklı Risk Yönetimi**
   - Mahalle ölçeğinde risk haritalaması
   - Bilimsel araştırmalar için veri seti oluşturma
   - Üst ölçek planlama çalışmalarına girdi sağlama

2. **Topluluk Dayanıklılığı**
   - Mahalle sakinlerinin risk farkındalığının artırılması
   - Risk verilerinin şeffaf paylaşımı
   - Yerel bilginin kayıt altına alınması

3. **Model Oluşturma**
   - Diğer mahalleler için örnek uygulama
   - Ölçeklenebilir ve tekrarlanabilir metodoloji
   - Açık kaynak yaklaşımıyla yaygınlaştırma

## İnovasyon ve Sürdürülebilirlik

Proje, aşağıdaki yenilikçi yaklaşımları içermektedir:

- Vatandaş bilimi (citizen science) metodolojisi
- Topluluk temelli veri toplama
- Coğrafi bilgi sistemleri ile risk analizi
- Açık veri yaklaşımı

## Gelecek Planları

- Diğer mahallelere yaygınlaştırma
- Topluluk etkileşimi özelliklerinin eklenmesi
- Risk analizi araçlarının geliştirilmesi
- Veri görselleştirme özelliklerinin artırılması
- Uluslararası işbirlikleri geliştirme

---

*Bu uygulama, deprem risk azaltma çalışmalarına teknolojik bir yaklaşım getirerek, topluluk temelli afet yönetimi modelinin önemli bir bileşeni olmayı hedeflemektedir.*
