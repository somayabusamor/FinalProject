import React, { useEffect, useRef, useState } from "react";
import './homepage.css';

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

  const MAPBOX_TOKEN = "YOUR_MAPBOX_TOKEN";

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

      const lat = coordinates.map((coord: [number, number]) => coord[1]);
      const lon = coordinates.map((coord: [number, number]) => coord[0]);

      setRoute({ lat, lon });

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
      renderMap();
    }
  };

  const updateDestination = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const destInput = formData.get("destination") as string;

    const parsedDest = parseCoordinates(destInput);
    if (parsedDest) {
      setDestination(parsedDest);
      renderMap();
    }
  };

  const focusOnPoint = (point: { lat: number; lon: number } | null) => {
    if (!mapRef.current || !point || !window.Plotly) return;

    window.Plotly.relayout(mapRef.current, {
      "mapbox.center": { lat: point.lat, lon: point.lon },
      "mapbox.zoom": 14,
    });
  };

  return(
    <div className="left-container">
  <form onSubmit={updateStartPoint}>
    <label>
      Starting Point Coordinates (lat,lon):
      <input
        type="text"
        name="startPoint"
        placeholder="e.g., 40.7128,-74.0060"
        defaultValue={startPoint ? `${startPoint.lat},${startPoint.lon}` : ""}
        required
      />
    </label>
    <button type="submit">Set Starting Point</button>
  </form>
  <form onSubmit={updateDestination}>
    <label>
      Destination Coordinates (lat,lon):
      <input
        type="text"
        name="destination"
        placeholder="e.g., 40.7128,-74.0060"
        required
      />
    </label>
    <button type="submit">Set Destination</button>
  </form>
  <button onClick={() => focusOnPoint(startPoint)}>Go to Start</button>
  <button onClick={() => focusOnPoint(destination)}>Go to Destination</button>
  <button onClick={fetchRoute}>Show the Road</button>
</div>

  );
};

export default HomePage;