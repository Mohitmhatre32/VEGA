import L from 'leaflet';
import { TERRAIN_COLORS, MAP_CONFIG } from './constants';
import { TERRAIN_TYPES } from './constants';

// Fix for leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create custom icons for each terrain type
export const createTerrainIcon = (terrainType: string, confidence: number) => {
  const color = TERRAIN_COLORS[terrainType as keyof typeof TERRAIN_COLORS] || '#00d9ff';
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        font-weight: bold;
        box-shadow: 0 0 10px ${color}80;
      ">
        ${Math.round(confidence)}%
      </div>
    `,
    className: 'terrain-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

// Map style with dark theme
export const mapStyle: L.StyleFunction = (feature?: any) => {
  return {
    color: '#2d3a5c',
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.3,
  };
};

export const mapContainerStyle = {
  width: '100%',
  height: '100%',
  backgroundColor: '#0f1629',
};
