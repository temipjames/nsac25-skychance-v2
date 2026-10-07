import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to re-center the map when location props change
function MapRecenter({ location }) {
  const map = useMap();

  useEffect(() => {
    if (
      location &&
      typeof location.lat === 'number' &&
      typeof location.lon === 'number' &&
      !isNaN(location.lat) &&
      !isNaN(location.lon)
    ) {
      map.flyTo([location.lat, location.lon], 9, { duration: 1.5 });
    }
  }, [location, map]);

  return null;
}

// Helper component to handle clicking anywhere directly on the map
function LocationMarker({ location, onLocationChange }) {
  useMapEvents({
    click(e) {
      onLocationChange({
        lat: Math.round(e.latlng.lat * 1000) / 1000,
        lon: Math.round(e.latlng.lng * 1000) / 1000
      });
    },
  });

  const isValidLocation =
    location &&
    typeof location.lat === 'number' &&
    typeof location.lon === 'number' &&
    !isNaN(location.lat) &&
    !isNaN(location.lon);

  return isValidLocation ? <Marker position={[location.lat, location.lon]} /> : null;
}

const Map = ({ onLocationChange, location }) => {
  const initialCenter = [
    !isNaN(location?.lat) ? location.lat : 51.5,
    !isNaN(location?.lon) ? location.lon : -0.1
  ];

  return (
    <div className="w-full h-64 border border-gray-300 rounded-lg overflow-hidden relative z-0 mt-2">
      <MapContainer
        center={initialCenter}
        zoom={3}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter location={location} />
        <LocationMarker location={location} onLocationChange={onLocationChange} />
      </MapContainer>
    </div>
  );
};

export default Map;
