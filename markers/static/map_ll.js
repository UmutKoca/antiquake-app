const osm = "https://www.openstreetmap.org/copyright";
const copy = `© <a href='${osm}'>OpenStreetMap</a>`;
const url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";


const osmLayer = L.tileLayer(url, { attribution: copy });

// ArcGIS Light Gray Canvas Layer
const lightGrayCanvasUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const lightGrayCanvasLayer = L.tileLayer(lightGrayCanvasUrl, {
    maxZoom: 20,
    attribution: "© <a href='https://www.esri.com/'>Esri</a>"
});

// ArcGIS Satellite Layer
const satelliteUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const satelliteLayer = L.tileLayer(satelliteUrl, {
    maxZoom: 20,
    attribution: "© <a href='https://www.esri.com/'>Esri</a>"
});


// ArcGIS World Street Map
const arcgisWorldStreetUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
const arcgisWorldStreetLayer = L.tileLayer(arcgisWorldStreetUrl, {
    maxZoom: 20,
    attribution: "© <a href='https://www.esri.com/'>Esri</a>"
});

const cartoDbLightLayer = L.tileLayer('https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}@2x.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
});


const map = L.map(
    "map",
    {
        layers: [osmLayer]
    }
);

// Harita Kontrolleri
const baseLayers = {
    "OpenStreetMap": osmLayer,
    "Satellite": satelliteLayer,
    'CartoDB Light': cartoDbLightLayer
};

L.control.layers(baseLayers).addTo(map);

// Kullanıcının konumunu bulma ve oraya zoomlama
map
    .locate({ setView: true, maxZoom: 16 })  // Konum isteği ve zoom
    .on("locationfound", (e) => {
        // Kullanıcının bulunduğu konuma yakınlaştırma
        map.setView(e.latlng, 18);  // 13 seviyesinde yakınlaştırma
    })
    .on("locationerror", () => {
        // Konum bulunamazsa varsayılan sınırları kullan
        map.setView([41.0292, 29.0236], 13);
    });

const layerGroup = L.layerGroup().addTo(map);

async function load_markers() {
    const markers_url = `/api/markers/?in_bbox=${map
        .getBounds()
        .toBBoxString()}`;
    const response = await fetch(
        markers_url
    );
    const geojson = await response.json();
    return geojson;
}

async function render_markers() {
    const markers = await load_markers();
    layerGroup.clearLayers();
    L.geoJSON(markers)
        .bindPopup(
            (layer) =>
                layer.feature.properties.description
        )
        .addTo(layerGroup);
}

map.on("moveend", render_markers);

let selectedLatLng = null;
const infoPanel = document.getElementById('info-panel');

// Kapatma butonuna tıklandığında paneli gizleme
const closeButton = document.getElementById('close-panel');
closeButton.addEventListener('click', function () {
    infoPanel.style.display = 'none';  // Paneli gizle
});

// Haritaya tıklandığında form panelini açma
map.on('click', function (e) {
    selectedLatLng = e.latlng;  // Seçilen koordinatları al
    infoPanel.style.display = 'block';  // Paneli göster
});

// Form gönderimi
const form = document.getElementById('dataForm');
form.addEventListener('submit', async function (event) {
    event.preventDefault(); // Sayfanın yeniden yüklenmesini önle

    const description = document.getElementById('description').value;
    let photoFile = document.getElementById('photo').files[0];


    const formData = new FormData();
    formData.append('description', description);
    if (photoFile) {
        formData.append('photo', photoFile);
    }
    formData.append('location', JSON.stringify({
        type: "Point",
        coordinates: [selectedLatLng.lng, selectedLatLng.lat] // GeoJSON formatında konum
    }));
    // Verileri API'ye gönderme
    try {
        const response = await fetch('/api/markers/', { // API URL'si güncellendi
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            }
        });
        if (response.ok) {
            Toastify({
                text: "Başarıyla kaydedildi.",
                className: "info",
                style: {
                    background: "green",
                    color: "#fff"
                },
                close: true,
                gravity: 'bottom',
            }).showToast();
            infoPanel.style.display = 'none'; // Paneli gizle
            form.reset(); // Formu sıfırla
        } else {
            Toastify({
                text: 'Veri kaydedilemedi. Hata: ' + response.statusText,
                className: "info",
                style: {
                    background: "red",  // Mavi'den turkuaz tonlarına geçiş
                    color: "#fff"
                },
                close: true,
                gravity: 'bottom'
            }).showToast();
            console.log(response.status)
        }
    } catch (error) {
        console.error('Hata:', error);
        alert('Bir hata oluştu.');
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

