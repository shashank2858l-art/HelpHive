import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapContainer = ({ points = [] }) => {
  const mapNode = useRef(null);

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token || !mapNode.current) return undefined;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapNode.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [77.209, 28.6139],
      zoom: 3.4,
    });

    points.forEach((point) => {
      new mapboxgl.Marker({ color: point.type === 'event' ? '#a855f7' : '#22d3ee' })
        .setLngLat([point.lng, point.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${point.name}</strong><p>${point.label}</p>`))
        .addTo(map);
    });

    return () => map.remove();
  }, [points]);

  const hasToken = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);

  if (!hasToken) {
    return (
      <div className="glass grid-bg flex h-[420px] items-center justify-center rounded-2xl p-6 text-center text-slate-300">
        Add VITE_MAPBOX_TOKEN in client/.env to enable live map rendering.
      </div>
    );
  }

  return <div ref={mapNode} className="h-[420px] overflow-hidden rounded-2xl" />;
};

export default MapContainer;
