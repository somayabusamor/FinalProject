import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Plotly: any;
  }
}

export default function MapScreen() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const plotMap = () => {
      const mapboxAccessToken = 'pk.eyJ1Ijoic3JhZWwxMiIsImEiOiJjbTRwZTN1ZXIwdGNjMmpyMjNmMXN2b2owIn0.sePFQdsOdmLqggMVWaooXA'; // Replace with your Mapbox token
      const data = [
        {
          type: 'scattermapbox',
          lat: [37.78825], // Example latitude
          lon: [-122.4324], // Example longitude
          mode: 'markers',
          marker: { size: 12 },
          text: ['My Location'], // Marker label
        },
      ];

      const layout = {
        mapbox: {
          style: 'mapbox://styles/mapbox/streets-v11',
          center: { lat: 37.78825, lon: -122.4324 },
          zoom: 12,
          accesstoken: mapboxAccessToken,
        },
        margin: { t: 0, b: 0, l: 0, r: 0 },
      };

      window.Plotly.newPlot(mapRef.current, data, layout);
    };

    // Load Plotly library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.plot.ly/plotly-2.24.1.min.js';
    script.onload = plotMap;
    document.body.appendChild(script);
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
}
