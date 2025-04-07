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

  useEffect(() => {
    // Get user's current location
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
      if (mapRef.current) {
        // Listen for plotly_click event on mapRef using native addEventListener
        mapRef.current.addEventListener("plotly_click", (event: any) => {
          const clickedData = event.points[0];
          const lat = clickedData.lat;
          const lon = clickedData.lon;

          setClickedLocation({ lat, lon });

          // Add new landmark on the map
          window.Plotly.addTraces(mapRef.current, {
            type: "scattermapbox",
            lat: [lat],
            lon: [lon],
            text: ["Landmark! 📍"],
            mode: "markers",
            marker: { size: 10, color: "blue" },
          });
        });
      }
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
          zIndex: 0, // ✅ show the map
        }}
      ></div>

      {/* Floating Box for Clicked Location */}
      {clickedLocation && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            backgroundColor: "white",
            padding: "10px 15px",
            borderRadius: "8px",
            boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
            zIndex: 1,
          }}
        >
          <h4>Clicked Location:</h4>
          <p>Lat: {clickedLocation.lat.toFixed(4)}</p>
          <p>Lon: {clickedLocation.lon.toFixed(4)}</p>
        </div>
      )}

      {/* Optional Foreground Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          color: "black",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1>Welcome to the Location Page 🌍</h1>
        <p>Click anywhere to add landmarks!</p>
      </div>
    </div>
  );
};

export default HomePage;
