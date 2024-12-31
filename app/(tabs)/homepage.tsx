import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Plotly: any;
  }
}

const HomePage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [startPoint, setStartPoint] = useState<{ lat: number; lon: number } | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lon: number } | null>(null);
  const [route, setRoute] = useState<{ lat: number[]; lon: number[] } | null>(null);
  const [routeDetails, setRouteDetails] = useState<{ distance: string; duration: string } | null>(null);

  const MAPBOX_TOKEN = "pk.eyJ1Ijoic3JhZWwxMiIsImEiOiJjbTNlYzdqbjcwOXo2MmpxeDB5NjNsdjhzIn0.emm77XYeX3_fQ6q-ihS3VA";

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocation = { lat: latitude, lon: longitude };
          setLocation(currentLocation);
          setStartPoint(currentLocation); // Initialize the starting point with the current location
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    } else {
      console.error("Geolocation not supported by this browser.");
    }
  }, []);

  const renderMap = () => {
    if (!mapRef.current || !window.Plotly) return;

    const data = [];

    // Red marker for the starting point
    if (startPoint) {
      data.push({
        type: "scattermapbox",
        lat: [startPoint.lat],
        lon: [startPoint.lon],
        text: ["Start Point"],
        mode: "markers",
        marker: { size: 14, color: "red" },
      });
    }

    // Green marker for the destination
    if (destination) {
      data.push({
        type: "scattermapbox",
        lat: [destination.lat],
        lon: [destination.lon],
        text: ["Destination"],
        mode: "markers",
        marker: { size: 14, color: "green" },
      });
    }

    // Add the route as a line if it exists
    if (route) {
      data.push({
        type: "scattermapbox",
        lat: route.lat,
        lon: route.lon,
        mode: "lines",
        line: { width: 4, color: "blue" },
      });
    }

    window.Plotly.newPlot(
      mapRef.current,
      data,
      {
        mapbox: {
          style: "open-street-map",
          center: startPoint || location || undefined,
          zoom: 12,
        },
        margin: { t: 0, b: 0, l: 0, r: 0 },
      }
    );
  };
  const fetchRoute = async () => {
    if (!location || !destination) return;
  
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${location.lon},${location.lat};${destination.lon},${destination.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      const coordinates = data.routes[0].geometry.coordinates;
  
      // Convert coordinates into separate latitude and longitude arrays
      const lat = coordinates.map((coord: [number, number]) => coord[1]);
      const lon = coordinates.map((coord: [number, number]) => coord[0]);
  
      setRoute({ lat, lon });
  
      // Extract distance and duration details
      const distance = (data.routes[0].distance / 1000).toFixed(2) + " km";
      const duration = Math.round(data.routes[0].duration / 60) + " min";
  
      setRouteDetails({ distance, duration });
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };
  
  useEffect(renderMap, [startPoint, destination, route]);

  const parseCoordinates = (input: string) => {
    const [lat, lon] = input.split(",").map(Number);
    if (!isNaN(lat) && !isNaN(lon)) {
      return { lat, lon };
    }
    return null;
  };

  const updateStartPoint = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const startInput = formData.get("startPoint") as string;

    const parsedStart = parseCoordinates(startInput);
    if (parsedStart) {
      setStartPoint(parsedStart);
      renderMap(); // Update map immediately after setting the starting point
    }
  };

  const updateDestination = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const destInput = formData.get("destination") as string;

    const parsedDest = parseCoordinates(destInput);
    if (parsedDest) {
      setDestination(parsedDest);
      renderMap(); // Update map immediately after setting destination
    }
  };

  const focusOnPoint = (point: { lat: number; lon: number } | null) => {
    if (!mapRef.current || !point || !window.Plotly) return;

    window.Plotly.relayout(mapRef.current, {
      "mapbox.center": { lat: point.lat, lon: point.lon },
      "mapbox.zoom": 14,
    });
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Half: Map */}
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "50%",
          backgroundColor: "lightgray",
        }}
      ></div>

      {/* Bottom Half: Buttons/Form */}
      <div
        style={{
          width: "100%",
          height: "50%",
          backgroundColor: "#f9f9f9",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <form onSubmit={updateStartPoint} style={{ textAlign: "center", marginBottom: "20px" }}>
          <label>
            Starting Point Coordinates (lat,lon):
            <input
              type="text"
              name="startPoint"
              placeholder="e.g., 40.7128,-74.0060"
              defaultValue={startPoint ? `${startPoint.lat},${startPoint.lon}` : ""}
              required
              style={{ margin: "10px" }}
            />
          </label>
          <button type="submit" style={{ padding: "10px 20px", marginTop: "10px" }}>
            Set Starting Point
          </button>
        </form>
        <form onSubmit={updateDestination} style={{ textAlign: "center" }}>
          <label>
            Destination Coordinates (lat,lon):
            <input
              type="text"
              name="destination"
              placeholder="e.g., 40.7128,-74.0060"
              required
              style={{ margin: "10px" }}
            />
          </label>
          <button type="submit" style={{ padding: "10px 20px", marginTop: "10px" }}>
            Set Destination
          </button>
        </form>
        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          <button
            onClick={() => focusOnPoint(startPoint)}
            style={{ padding: "10px 20px", backgroundColor: "red", color: "white" }}
          >
            Go to Start
          </button>
          <button
            onClick={() => focusOnPoint(destination)}
            style={{ padding: "10px 20px", backgroundColor: "green", color: "white" }}
          >
            Go to Destination
          </button>
          <button
  onClick={fetchRoute}
  style={{
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "blue",
    color: "white",
    borderRadius: "5px",
  }}
>
  Show the Road
</button>

        </div>
      </div>
    </div>
  );
};

export default HomePage;
