// ----------------
// CONSTANTS & CONFIGURATIONS
// ----------------
let kuzguncukBoundary = null;

// Base map style configuration
const MAP_STYLE = {
    version: 8,
    glyphs: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${MAPTILER_API_KEY}`,
    sources: {
        osm: {
            type: "raster",
            tiles: ["https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}@2x.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap Contributors",
            maxzoom: 19
        }
    },
    layers: [
        {
            id: "osm",
            type: "raster",
            source: "osm"
        }
    ]
};

// Map initialization options
const MAP_INIT_OPTIONS = {
    container: 'map',
    style: MAP_STYLE,
    center: [29.03523, 41.03268],
    zoom: 15
};

// ----------------
// UTILITY FUNCTIONS
// ----------------
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

function isWithinKuzguncuk(lngLat) {
    if (!kuzguncukBoundary?.features?.length) return false;
    const point = turf.point([lngLat.lng, lngLat.lat]);
    const polygon = turf.feature(kuzguncukBoundary.features[0].geometry);
    return turf.booleanPointInPolygon(point, polygon);
}

// ----------------
// MAP INITIALIZATION
// ----------------
const map = new maplibregl.Map(MAP_INIT_OPTIONS);

// Initialize map controls
function initializeMapControls() {
    const gc = new maplibreglMaptilerGeocoder.GeocodingControl({ apiKey: MAPTILER_API_KEY });
    map.addControl(gc, "top-left");
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.ScaleControl(), 'bottom-right');
    map.addControl(new maplibregl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }), 'top-right');
    map.addControl(new maplibregl.FullscreenControl());

    // Arama kontrolünü ekle
    let geocoder = new maptiler.Geocoder({
        input: 'search',
        key: maptilerKey,
        language: 'tr',
        countries: ['tr'],
        bbox: [28.9637, 40.9968, 29.0679, 41.0431], // Kuzguncuk bölgesi sınırları
        proximity: [29.0340, 41.0360], // Kuzguncuk merkez noktası
    });
    geocoder.on('select', function(item) {
        map.flyTo({
            center: item.center,
            zoom: 16
        });
    });
}

// ----------------
// MARKERS HANDLING
// ----------------
async function loadMarkers() {
    const bounds = map.getBounds().toArray().flat();
    const url = `/api/markers/?in_bbox=${bounds}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const geojson = await response.json();

        if (map.getSource('markers')) {
            // Mevcut kaynağın verisini güncelle
            map.getSource('markers').setData(geojson);
        } else {
            // Marker kaynağını ve katmanlarını ekle
            initializeMarkerSource(geojson);
            addMarkerLayers();
        }
    } catch (error) {
        console.error('Error loading markers:', error);
    }
}

function initializeMarkerSource(geojson) {
    map.addSource('markers', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
    });
}

function addMarkerLayers() {
    // Clusters layer
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'markers',
        filter: ['has', 'point_count'],
        paint: {
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                10, 30,
                50, 40
            ],
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#2196F3',   // 0-9: Light blue
                10, '#1976D2',   // 10-24: Dark blue
                25, '#FFA726',   // 25-49: Orange
                50, '#F57C00',   // 50-99: Dark orange
                100, '#D32F2F'    // 100+: Red
            ]
        }
    });

    // Cluster count layer
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'markers',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Noto Sans Regular'],
            'text-size': 12
        },
        paint: {
            'text-color': '#ffffff'
        }
    });

    // Unclustered points layer
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'markers',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-radius': 6,
            'circle-color': '#007cbf',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });
}

// ----------------
// KUZGUNCUK BOUNDARY HANDLING
// ----------------
async function initializeKuzguncukBoundary() {
    try {
        const response = await fetch(kuzguncukGeojsonUrl);
        const data = await response.json();
        kuzguncukBoundary = data;
        
        const bounds = turf.bbox(data);
        map.fitBounds([
            [bounds[0], bounds[1]],
            [bounds[2], bounds[3]]
        ], {
            padding: 50
        });

        if (!map.getSource('kuzguncuk')) {
            addKuzguncukLayers(data);
        }
    } catch (error) {
        console.error('Error loading Kuzguncuk boundary:', error);
    }
}

function addKuzguncukLayers(data) {
    map.addSource('kuzguncuk', {
        type: 'geojson',
        data: data
    });

    map.addLayer({
        id: 'kuzguncuk-fill',
        type: 'fill',
        source: 'kuzguncuk',
        paint: {
            'fill-color': '#088',
            'fill-opacity': 0
        }
    });

    map.addLayer({
        id: 'kuzguncuk-outline',
        type: 'line',
        source: 'kuzguncuk',
        paint: {
            'line-color': '#0000ff',
            'line-width': 2,
            'line-dasharray': [2, 2],
            'line-opacity': 1
        }
    });
}

// ----------------
// EVENT HANDLERS
// ----------------
function handleMarkerClick(feature) {
    const description = feature.properties.description || 'Açıklama bulunamadı';
    const imageUrl = feature.properties.photo;
    const username = feature.properties.username || 'Anonim';
    const date = feature.properties.created_at ? new Date(feature.properties.created_at) : null;

    document.getElementById('description-display').innerText = description;
    document.getElementById('username-display').innerText = username;
    
    const imageElement = document.getElementById('image-display');
    if (imageUrl) {
        imageElement.src = imageUrl;
        imageElement.style.display = 'block';
        imageElement.onload = function() {
            imageElement.style.maxHeight = '300px';
            imageElement.style.width = 'auto';
            imageElement.style.margin = '0 auto';
        };
    } else {
        imageElement.style.display = 'none';
    }

    const dateElement = document.getElementById('date-display');
    if (date) {
        const formattedDate = `${date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })} tarihinde eklenmiştir.`;
        dateElement.innerText = formattedDate;
    } else {
        dateElement.innerText = '';
    }
    
    displayPanel.style.display = 'block';
}

function handleMapClick(e) {
    const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point', 'clusters'] });

    if (features.length) {
        const feature = features[0];
        if (feature.layer.id === 'unclustered-point') {
            handleMarkerClick(feature);
        } else if (feature.layer.id === 'clusters') {
            handleClusterClick(e);
        }
    } else {
        if (isWithinKuzguncuk(e.lngLat)) {
            selectedCoordinates = [e.lngLat.lng, e.lngLat.lat];
            infoPanel.style.display = 'block';
        } else {
            showToast('Sadece Kuzguncuk sınırları içinde işlem yapabilirsiniz.', 'error');
        }
    }
}

function handleClusterClick(e) {
    e.originalEvent.stopPropagation(); 
    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
    const clusterId = features[0].properties.cluster_id;

    map.getSource('markers').getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
        });
    });
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const description = document.getElementById('description').value;
    const photo = document.getElementById('photo').files[0];
    const formData = new FormData();
    
    formData.append('description', description);
    if (photo) {
        formData.append('photo', photo);
    }
    formData.append('location', JSON.stringify({
        type: 'Point',
        coordinates: selectedCoordinates
    }));

    try {
        const response = await fetch('/api/markers/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: formData
        });

        if (response.ok) {
            showToast('Veri başarıyla kaydedildi.', 'success');
            infoPanel.style.display = 'none';
            await loadMarkers();
            resetForm();
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.detail || 'Veri kaydedilemedi.';
            showToast(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Hata:', error);
        showToast('Bir hata oluştu.', 'error');
    }
}

function resetForm() {
    document.getElementById('description').value = '';
    const photoInput = document.getElementById('photo');
    const previewArea = document.getElementById('previewArea');
    const uploadArea = document.getElementById('uploadArea');
    
    photoInput.value = '';
    previewArea.classList.add('hidden');
    uploadArea.classList.remove('hidden');
}

function closeInfoPanel() {
    const infoPanel = document.getElementById('info-panel');
    infoPanel.style.display = 'none';
    resetForm();
}

// ----------------
// EVENT LISTENERS
// ----------------
function initializeEventListeners() {
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', closeInfoPanel);
    }

    map.on('load', async () => {
        await initializeKuzguncukBoundary();
        loadMarkers();
        initializeMapControls();
    });

    map.on('moveend', loadMarkers);
    map.on('click', handleMapClick);

    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });

    // DOM event listeners
    document.getElementById('close-panel').addEventListener('click', () => {
        infoPanel.style.display = 'none';
    });

    document.getElementById('close-display-panel').addEventListener('click', () => {
        displayPanel.style.display = 'none';
    });

    document.getElementById('dataForm').addEventListener('submit', handleFormSubmit);
}

// ----------------
// INITIALIZATION
// ----------------
const infoPanel = document.getElementById('info-panel');
const displayPanel = document.getElementById('display-panel');
let selectedCoordinates = null;

// Initialize the application
initializeEventListeners();

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('dataForm');
    const description = document.getElementById('description');
    const photoInput = document.getElementById('photo');
    const dropZone = document.getElementById('dropZone');
    const uploadArea = document.getElementById('uploadArea');
    const previewArea = document.getElementById('previewArea');
    const charCount = document.getElementById('char-count');
    const cancelButton = document.getElementById('cancel-button');
    const closeButton = document.getElementById('close-panel');
    const previewImg = document.getElementById('previewImg');

    // Karakter sayısı kontrolü
    description.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = `${length}/500`;
        if (length > 500) {
            charCount.classList.add('text-red-500');
            this.classList.add('border-red-500');
        } else {
            charCount.classList.remove('text-red-500');
            this.classList.remove('border-red-500');
        }
    });

    // Fotoğraf yükleme işlemleri
    function handleFile(file) {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            Toastify({
                text: "Lütfen sadece resim dosyası yükleyin",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                style: {
                    background: "#ef4444",
                }
            }).showToast();
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB kontrol
            Toastify({
                text: "Dosya boyutu 10MB'dan küçük olmalıdır",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                style: {
                    background: "#ef4444",
                }
            }).showToast();
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            uploadArea.classList.add('hidden');
            previewArea.classList.remove('hidden');
        }
        reader.readAsDataURL(file);
    }

    // Dosya seçimi
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        handleFile(file);
    });

    // Sürükle-bırak işlemleri
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('border-primary', 'bg-primary/5');
    }

    function unhighlight(e) {
        dropZone.classList.remove('border-primary', 'bg-primary/5');
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        handleFile(file);
    }

    // Form temizleme
    function resetForm() {
        form.reset();
        description.value = '';
        charCount.textContent = '0/500';
    }

    // İptal butonu
    cancelButton.addEventListener('click', function() {
        closeInfoPanel();
    });

    // Form gönderimi
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (description.value.length > 500) {
            Toastify({
                text: "Açıklama 500 karakterden uzun olamaz",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                style: {
                    background: "#ef4444",
                }
            }).showToast();
            return;
        }

        // Form gönderme işlemi...
        const formData = new FormData(this);
        formData.append('description', description.value);
        formData.append('latitude', currentMarker.getLngLat().lat);
        formData.append('longitude', currentMarker.getLngLat().lng);

        try {
            const response = await fetch('/add_marker/', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                Toastify({
                    text: "Konum başarıyla eklendi",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    style: {
                        background: "#22c55e",
                    }
                }).showToast();
                
                closeInfoPanel();
                loadMarkers(); // Haritayı yenile
            } else {
                throw new Error('Sunucu hatası');
            }
        } catch (error) {
            Toastify({
                text: "Bir hata oluştu. Lütfen tekrar deneyin.",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                style: {
                    background: "#ef4444",
                }
            }).showToast();
        }
    });
});
