'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { mapTerrainPoints } from '@/lib/mockData';
import { createTerrainIcon, mapStyle } from '@/lib/mapConfig';
import { MAP_CONFIG } from '@/lib/constants';

export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const mapInstance = L.map(mapRef.current).setView(
      MAP_CONFIG.defaultCenter,
      MAP_CONFIG.defaultZoom
    );

    // Add tile layer
    L.tileLayer(MAP_CONFIG.tileServer, {
      attribution: MAP_CONFIG.attribution,
      maxZoom: MAP_CONFIG.maxZoom,
    }).addTo(mapInstance);

    // Add terrain markers
    mapTerrainPoints.forEach((point) => {
      const icon = createTerrainIcon(point.terrain, point.confidence);
      const marker = L.marker([point.lat, point.lng], { icon }).addTo(mapInstance);

      marker.bindPopup(`
        <div style="background: #0a0e27; color: #e0e7ff; padding: 8px; border-radius: 6px; border: 1px solid #2d3a5c;">
          <p style="margin: 0 0 4px 0; font-weight: bold;">${point.terrain}</p>
          <p style="margin: 0; font-size: 12px;">Confidence: ${point.confidence}%</p>
          <p style="margin: 4px 0 0 0; font-size: 12px;">Lat: ${point.lat.toFixed(2)}, Lng: ${point.lng.toFixed(2)}</p>
        </div>
      `);
    });

    mapInstanceRef.current = mapInstance;

    return () => {
      mapInstance.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return <div ref={mapRef} className="w-full h-[500px] rounded-2xl border border-cyan-500/20 overflow-hidden" />;
}
