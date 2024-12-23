import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Plotly: any;
  }
}

const HomePage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    // Fetch user's location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          setStartLocation(`${longitude},${latitude}`); // Set the startLocation to the current position
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

  const handleSubmit = () => {
    alert(`Start: ${startLocation}, Destination: ${destination}`);
    // Logic to use the input values, e.g., show a route on the map
  };

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
          color: "white",
          padding: "20px",
          textAlign: "center",
          textShadow: "1px 1px 3px black",
        }}
      >
        <h1>Interactive Map</h1>

        {/* Labels and Inputs */}
        <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <label htmlFor="startLocation">Starting Point:</label>
            <input
              type="text"
              id="startLocation"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              placeholder="Enter start location"
              style={{ marginLeft: "10px", padding: "5px" }}
            />
          </div>
          <div>
            <label htmlFor="destination">Destination:</label>
            <input
              type="text"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination"
              style={{ marginLeft: "10px", padding: "5px" }}
            />
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleSubmit}
          style={{
            padding: "10px 20px",
            background: "green",
            color: "black",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Submit
        </button>

        {/* Display clicked location */}
        {clickedLocation && (
          <div style={{ marginTop: "20px", color: "white" }}>
            <h3>Clicked Location:</h3>
            <p>Latitude: {clickedLocation.lat}</p>
            <p>Longitude: {clickedLocation.lon}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
