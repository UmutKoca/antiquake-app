// Define the map syle (OpenStreetMap raster tiles)
const style = {
    "version": 8,
    "sources": {
        "osm": {
            "type": "raster",
            "tiles": ["https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}@2x.png"],
            "tileSize": 256,
            "attribution": "&copy; OpenStreetMap Contributors",
            "maxzoom": 19
        }
    },
    "layers": [
        {
            "id": "osm",
            "type": "raster",
            "source": "osm" // This must match the source key above
        }
    ]
};


// Map'i oluşturma
const map = new maplibregl.Map({
    container: 'map',
    style: style,// OpenStreetMap tabanlı bir MapLibre stili
    center: [29.0236, 41.0292], // İstanbul koordinatları
    zoom: 13,
    //pitch: 40,
    //bearing: 20,
    //antialias: true
});

// Kullanıcının konumunu bulma ve oraya zoom yapma
map.on('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                map.setCenter([position.coords.longitude, position.coords.latitude]);
                map.setZoom(16);
            },
            () => {
                console.warn('Konum bulunamadı, varsayılan ayarlar kullanılacak.');
            }
        );
    }
});

const key = "NjI9cpkv3Guq8lij1eYS"

const gc = new maplibreglMaptilerGeocoder.GeocodingControl({ apiKey: key });

map.addControl(gc, "top-left");

map.addControl(new maplibregl.NavigationControl());
map.addControl(new maplibregl.ScaleControl({
    maxWidth: 80, // Ölçek çubuğunun maksimum genişliği
    unit: 'metric' // Ölçü birimi ('metric' veya 'imperial')
}));
map.addControl(new maplibregl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
}));
map.addControl(new maplibregl.FullscreenControl());

// Bilgi panelini seçme
const infoPanel = document.getElementById('info-panel');

// Kapatma butonuna tıklandığında paneli gizleme
const closeButton = document.getElementById('close-panel');
closeButton.addEventListener('click', () => {
    infoPanel.style.display = 'none';
});

let selectedCoordinates = null;

const displayPanel = document.getElementById('display-panel');
const closeDisplayPanelButton = document.getElementById('close-display-panel');

// Display paneli kapatma fonksiyonu
closeDisplayPanelButton.addEventListener('click', () => {
    displayPanel.style.display = 'none';
});

const isAuthenticated = document.body.getAttribute('data-authenticated');

// Haritaya tıklandığında form panelini açma
map.on('click', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
        layers: ['marker-layer']
    });

    if (features.length) {
        // Marker'a tıklandıysa, display panelde açıklama ve resmi göster
        const feature = features[0];
        const description = feature.properties.description || 'Açıklama bulunamadı';
        const imageUrl = feature.properties.photo

        // Açıklama ve resmi display panelde göster
        document.getElementById('description-display').innerText = description;
        const imageElement = document.getElementById('image-display');
        if (imageUrl) {
            imageElement.src = imageUrl;
            imageElement.style.display = 'block'; // Resmi göster
        } else {
            imageElement.style.display = 'none'; // Resmi gizle
        }
        displayPanel.style.display = 'block';
    } else {
        // Marker yoksa, yeni marker ekleme ekranını aç
        if (isAuthenticated === 'True') {
            selectedCoordinates = [e.lngLat.lng, e.lngLat.lat];
            infoPanel.style.display = 'block';
        } else {
            showToast('Veri girişi yapmak için oturum açmalısınız.', 'error');
        }
    }
});

// Form gönderimi
const form = document.getElementById('dataForm');
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const description = document.getElementById('description').value;
    let photoFile = document.getElementById('photo').files[0];

    const formData = new FormData();
    formData.append('description', description);

    if (photoFile) {
        formData.append('photo', photoFile);
    }

    formData.append('location', JSON.stringify({
        type: 'Point',
        coordinates: selectedCoordinates
    }));

    try {
        const response = await fetch('/api/markers/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            }
        });

        if (response.ok) {
            showToast('Veri başarıyla kaydedildi.', 'success');
            infoPanel.style.display = 'none';
            form.reset();
            loadMarkers();
        } else {
            showToast('Veri kaydedilemedi. Hata: ' + response.statusText, 'error');
        }
    } catch (error) {
        console.error('Hata:', error);
        showToast('Bir hata oluştu.', 'error');
    }
});

// CSRF token alma fonksiyonu
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


// Markers verilerini yükleme ve haritaya ekleme
async function loadMarkers() {
    const response = await fetch(`/api/markers/?in_bbox=${map.getBounds().toArray().flat()}`);
    const geojson = await response.json();

    // Var olan kaynakları temizle
    map.getSource('markers')?.setData(geojson);

    // Marker kaynağını güncelle
    if (!map.getSource('markers')) {
        map.addSource('markers', {
            type: 'geojson',
            data: geojson,
        });

        map.addLayer({
            id: 'marker-layer',
            type: 'circle',
            source: 'markers',
            paint: {
                'circle-radius': 10,
                'circle-color': '#007cbf'
            }
        });

        // map.on('click', 'marker-layer', (e) => {
        //     const description = e.features[0].properties.description;
        //     new maplibregl.Popup()
        //         .setLngLat(e.lngLat)
        //         .setHTML(`<p>${description}</p>`)
        //         .addTo(map);
        // });
    }
}

fetch(geojsonUrl)
    .then(response => response.json())
    .then(data => {
        console.log(data)
        map.addSource('kuzguncuk', {
            'type': 'geojson',
            'data': data
        });

        // Poligonun içi boş olsun (şeffaf)
        map.addLayer({
            'id': 'kuzguncuk-fill',
            'type': 'fill',
            'source': 'kuzguncuk',
            'paint': {
                'fill-color': '#088',   // Renk (görünmeyecek)
                'fill-opacity': 0        // İçi tamamen şeffaf
            }
        });

        // Dış kenarları kesikli mavi çizgiyle gösterelim
        map.addLayer({
            'id': 'kuzguncuk-outline',
            'type': 'line',
            'source': 'kuzguncuk',
            'paint': {
                'line-color': '#0000ff',  // Çizgi rengi mavi (#0000ff)
                'line-width': 2,          // Çizgi kalınlığı
                'line-dasharray': [2, 2], // Kesikli çizgi için: 2 piksel çiz, 2 piksel boşluk
                'line-opacity': 1         // Çizgi tam opak
            }
        });
    });

// Harita hareket ettiğinde marker'ları yeniden yükle
map.on('moveend', loadMarkers);

// Toast mesajı gösterme fonksiyonu
function showToast(message, type) {
    Toastify({
        text: message,
        className: "info",
        style: {
            background: type === 'success' ? "green" : "red",
            color: "#fff"
        },
        close: true,
        gravity: 'bottom',
    }).showToast();
}
