import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    Plotly: any;
  }
}

const MapScreen: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    // Check if browser supports Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude }); // Save user's location
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    } else {
      console.error("Geolocation not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || !location) return;

    const loadPlotly = async () => {
      if (!window.Plotly) {
        const plotlyScript = document.createElement('script');
        plotlyScript.src = 'https://cdn.plot.ly/plotly-latest.min.js';
        plotlyScript.async = true;

        plotlyScript.onload = () => {
          renderMap();
        };

        document.body.appendChild(plotlyScript);
      } else {
        renderMap();
      }
    };

    const renderMap = () => {
      window.Plotly.newPlot(mapRef.current, [
        {
          type: 'scattermapbox',
          lat: [location.lat], // User's latitude
          lon: [location.lon], // User's longitude
          text: ['You are here!'],
          mode: 'markers',
          marker: { size: 14, color: 'red' }, // Red marker for user's location
        },
      ],
      {
        mapbox: {
          style: 'open-street-map',
          center: { lat: location.lat, lon: location.lon }, // Center map at user's location
          zoom: 12,
        },
        margin: { t: 0, b: 0, l: 0, r: 0 },
      });
    };

    loadPlotly();
  }, [location]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapScreen;
