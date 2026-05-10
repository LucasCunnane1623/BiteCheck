let map;
let allMarkers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map-container'), {
    center: { 
        lat: 40.73, 
        lng: -73.99 
    },
    zoom: 13,
    disableDefaultUI: true,
    zoomControl: true,
  });
  loadMarkers();
}

async function loadMarkers() {
  const res = await fetch('/api/restaurants');
  const restaurants = await res.json();

  restaurants.forEach(r => {
    let lat, lng;

    if (r.location && r.location.coordinates) {
        lat = r.location.coordinates[1];
        lng = r.location.coordinates[0];
    } else if (r.coords) {
        lat = r.coords.lat;
        lng = r.coords.lng;
    } else {
        return;
    }

    const color = r.color || 'green';

    const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        label: {
            text: String(r.score || '?'),
            color: '#fff',
            fontWeight: 'bold',
        },
        title: r.name,
        icon: buildMarkerIcon(color),
    });

    marker.addListener('click', () => openDetailsModal(r._id));
    allMarkers.push({ marker, color });
  });
}

function buildMarkerIcon(color) {
  const colorMap = {
    green:  '#22c55e',
    yellow: '#eab308',
    red:    '#ef4444',
  };
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: colorMap[color] || '#22c55e',
    fillOpacity: 1,
    strokeColor: '#1B1B1B',
    strokeWeight: 2,
    scale: 18,
  };
}

function applyColorFilter(activeColor) {
  allMarkers.forEach(({ marker, color }) => {
    marker.setVisible(activeColor === 'all' || color === activeColor);
  });
}