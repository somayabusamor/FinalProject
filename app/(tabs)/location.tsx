import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Plotly: any;
  }
}

const HomePage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lon: number } | null>(null);

  const MAPBOX_TOKEN = "YOUR_MAPBOX_ACCESS_TOKEN";

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
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
        const plotlyScript = document.createElement("script");
        plotlyScript.src = "https://cdn.plot.ly/plotly-latest.min.js";
        plotlyScript.async = true;

        plotlyScript.onload = () => {
          renderMap();
          addClickHandler();
        };

        document.body.appendChild(plotlyScript);
      } else {
        renderMap();
        addClickHandler();
      }
    };

    const renderMap = () => {
      const data = [
        {
          type: "scattermapbox",
          lat: [location.lat],
          lon: [location.lon],
          text: ["You are here!"],
          mode: "markers",
          marker: { size: 14, color: "red" },
        },
      ];

      window.Plotly.newPlot(
        mapRef.current,
        data,
        {
          mapbox: {
            style: "open-street-map",
            center: { lat: location.lat, lon: location.lon },
            zoom: 12,
          },
          margin: { t: 0, b: 0, l: 0, r: 0 },
        }
      );
    };

    const addClickHandler = () => {
      mapRef.current?.addEventListener("plotly_click", (event: any) => {
        const clickedData = event.points[0];
        const lat = clickedData.lat;
        const lon = clickedData.lon;

        setClickedLocation({ lat, lon });
      });
    };

    loadPlotly();
  }, [location]);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* Map Background */}
      <div
        ref={mapRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
      ></div>

      {/* Foreground Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          color: "Black",
          padding: "20px",
          textAlign: "center",
          textShadow: "1px 1px 3px black",
        }}
      >
        <h1>Interactive Map</h1>
        {clickedLocation && (
          <p>
            <strong>Clicked Location:</strong> Latitude: {clickedLocation.lat}, Longitude: {clickedLocation.lon}
          </p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
