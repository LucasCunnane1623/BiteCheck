let map;
let allMarkers = [];
const NYC_DEFAULT = { lat: 40.73, lng: -73.99 };

function initMap() {
  map = new google.maps.Map(document.getElementById('map-container'), {
    center: NYC_DEFAULT,
    zoom: 13,
    disableDefaultUI: true,
    zoomControl: true,
  });
  initLocation();
}

async function initLocation() {
  if (!navigator.geolocation) {
    loadMarkers(null);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const userLatLng = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      map.setCenter(userLatLng);
      placeUserPin(userLatLng);

      const res = await fetch('/api/users/me');
      const user = await res.json();
      const radius = user.appSearchRadiusMeters || 1500;

      loadMarkers(userLatLng, radius);
    },
    () => {
      loadMarkers(null);
    }
  );
}

function placeUserPin(latLng) {
  new google.maps.Marker({
    position: latLng,
    map,
    title: 'You are here',
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#3b82f6',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3,
      scale: 10,
    },
    zIndex: 999,
  });
}

async function loadMarkers(userLatLng, radius) {
  let url;
  if (userLatLng && radius) {
    url = `/api/restaurants/near?lat=${userLatLng.lat}&lng=${userLatLng.lng}&dist=${radius}`;
  } else {
    url = '/api/restaurants';
  }

  const res = await fetch(url);
  const restaurants = await res.json();

  restaurants.forEach(r => {
    let lat, lng;

    if (r.location?.coordinates) {
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