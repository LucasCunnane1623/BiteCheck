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