import React, { useEffect, useRef, useState } from "react";
import './homepage.css';
import { useRouter } from 'expo-router';


declare global {
  interface Window {
    Plotly: any;
  }
}
export const unstable_settings = {
  // Prevent this page from being added to the bottom tab bar
  tabBarVisible: false,
};
const HomePage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [startPoint, setStartPoint] = useState<{ lat: number; lon: number } | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lon: number } | null>(null);
  const [route, setRoute] = useState<{ lat: number[]; lon: number[] } | null>(null);
  const [routeDetails, setRouteDetails] = useState<{ distance: string; duration: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const router = useRouter();

  // Sample landmarks data
  const [landmarks] = useState<{ lat: number; lon: number; name: string }[]>([
    { lat: 31.155844, lon: 34.807268, name: "Algergawi Shop" },
    { lat: 31.15478, lon: 34.809776, name: "Electricity Pole" },
    { lat: 31.155101, lon: 34.811155, name: "Electric Company" },
    { lat: 31.163493, lon: 34.820984, name: "Al-Azazma School" },
    { lat: 31.15632, lon: 34.810717, name: "Algergawi Mosque" },
    { lat: 31.166333, lon: 34.812421, name: "Abu Swilim Building Materials" },
    { lat: 31.166306, lon: 34.814712, name: "Abu Swilim Mosque" },
    { lat: 31.163345, lon: 34.815559, name: "Abu Muharib's Butcher Shop" },
    { lat: 31.155848, lon: 34.807387, name: "Mauhidet Clinic" },
    { lat: 31.166374, lon: 34.810585, name: "General Dental Clinic" },
    { lat: 31.156483, lon: 34.805685, name: "The Entry of the Electric Company" },
    { lat: 31.155741, lon: 34.806393, name: "The Green Container" },
  ]);

  const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1Ijoic3JhZWwxMiIsImEiOiJjbTVpZmk1angwd2puMmlzNzliendwcDZhIn0.K1gCuh7b0tNdi58FGEhBcA';

  // Load Plotly script dynamically
  useEffect(() => {
    if (!window.Plotly) {
      const script = document.createElement('script');
      script.src = 'https://cdn.plot.ly/plotly-latest.min.js';
      script.onload = () => {
        console.log('Plotly loaded successfully');
        setMapInitialized(true);
      };
      script.onerror = () => console.error('Error loading Plotly');
      document.head.appendChild(script);
    } else {
      setMapInitialized(true);
    }

    return () => {
      if (window.Plotly && mapRef.current) {
        window.Plotly.purge(mapRef.current);
      }
    };
  }, []);

  // Get user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocation = { lat: latitude, lon: longitude };
          setLocation(currentLocation);
          setStartPoint(currentLocation);
        },
        (error) => {
          console.error("Error fetching location:", error);
          // Default to a location if geolocation fails
          setLocation({ lat: 31.155844, lon: 34.807268 });
          setStartPoint({ lat: 31.155844, lon: 34.807268 });
        }
      );
    } else {
      console.error("Geolocation not supported.");
      setLocation({ lat: 31.155844, lon: 34.807268 });
      setStartPoint({ lat: 31.155844, lon: 34.807268 });
    }
  }, []);

  // Render or update map
  const renderMap = () => {
    if (!mapRef.current || !window.Plotly || !mapInitialized) {
      console.log('Map not ready to render');
      return;
    }

    const data: any[] = [];

    // Add landmarks
    landmarks.forEach((landmark) => {
      data.push({
        type: "scattermapbox",
        lat: [landmark.lat],
        lon: [landmark.lon],
        text: [landmark.name],
        mode: "markers",
        marker: { size: 10, color: "blue" },
        name: landmark.name
      });
    });

    // Add start point
    if (startPoint) {
      data.push({
        type: "scattermapbox",
        lat: [startPoint.lat],
        lon: [startPoint.lon],
        text: ["Start Point"],
        mode: "markers",
        marker: { size: 14, color: "red" },
        name: "Start Point"
      });
    }

    // Add destination
    if (destination) {
      data.push({
        type: "scattermapbox",
        lat: [destination.lat],
        lon: [destination.lon],
        text: ["Destination"],
        mode: "markers",
        marker: { size: 14, color: "green" },
        name: "Destination"
      });
    }

    // Add route if available
    if (route) {
      data.push({
        type: "scattermapbox",
        lat: route.lat,
        lon: route.lon,
        mode: "lines",
        line: { width: 4, color: "brown" },
        name: "Route"
      });
    }

    const centerPoint = startPoint || location || { lat: 31.155844, lon: 34.807268 };

    try {
      window.Plotly.react(
        mapRef.current,
        data,
        {
          mapbox: {
            style: 'mapbox://styles/mapbox/streets-v11',
            center: centerPoint,
            zoom: 13,
          },
          margin: { t: 0, b: 0, l: 0, r: 0 },
          showlegend: true
        },
        {
          mapboxAccessToken: MAPBOX_TOKEN,
          responsive: true
        }
      );
    } catch (error) {
      console.error("Error rendering map:", error);
    }
  };

  // Watch for changes to update map
  useEffect(() => {
    if (mapInitialized) {
      renderMap();
    }
  }, [startPoint, destination, route, landmarks, mapInitialized]);

  const focusOnPoint = (point: { lat: number; lon: number } | null) => {
    if (!mapRef.current || !point || !window.Plotly) return;
    window.Plotly.relayout(mapRef.current, {
      "mapbox.center": { lat: point.lat, lon: point.lon },
      "mapbox.zoom": 14,
    });
  };

  const fetchRoute = async () => {
    if (!startPoint || !destination) {
      alert("Please set both the start point and the destination.");
      return;
    }

    setLoading(true);
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startPoint.lon},${startPoint.lat};${destination.lon},${destination.lat}?alternatives=false&geometries=geojson&language=en&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Error fetching route:", errorDetails); 
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const routeCoordinates = data.routes[0].geometry.coordinates;

      setRoute({
        lat: routeCoordinates.map((coord: any) => coord[1]),
        lon: routeCoordinates.map((coord: any) => coord[0]),
      });

      setRouteDetails({
        distance: (data.routes[0].legs[0].distance / 1000).toFixed(1) + ' km',
        duration: (data.routes[0].legs[0].duration / 60).toFixed(1) + ' min',
      });
    } catch (error) {
      console.error("Failed to fetch route:", error);
      alert("Failed to fetch route. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const geocodeAddress = async (address: string) => {
    if (!address.trim()) return null;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].center;
        return { lat, lon };
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const updateStartPoint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const address = formData.get("startPoint") as string;
    
    if (!address.trim()) {
      alert("Please enter a starting address");
      return;
    }

    const result = await geocodeAddress(address);
    if (result) {
      setStartPoint(result);
      focusOnPoint(result);
    } else {
      alert("Could not find this location. Please try a different address.");
    }
  };

  const updateDestination = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const address = formData.get("destination") as string;
    
    if (!address.trim()) {
      alert("Please enter a destination address");
      return;
    }

    const result = await geocodeAddress(address);
    if (result) {
      setDestination(result);
      focusOnPoint(result);
    } else {
      alert("Could not find this location. Please try a different address.");
    }
  };

  const handleNavigateToLandmarks = () => {
    router.push('/landmarks');
  };

  // Update the return statement with new button layout:
  return (
    <div className="homepage-container">
      <div className="left-container">
        <form onSubmit={updateStartPoint}>
          <label>
            Starting Point:
            <input
              type="text"
              name="startPoint"
              placeholder="e.g., Current Location or specific address"
              defaultValue={startPoint ? "Current Location" : ""}
              required
            />
          </label>
          <button type="submit">Set Starting Point</button>
          <div className="button-group">
            <button 
              onClick={() => focusOnPoint(startPoint)} 
              disabled={!startPoint}
              className="control-button"
            >
              Go to Start
            </button>
          </div>
        </form>

        <form onSubmit={updateDestination}>
          <label>
            Destination:
            <input
              type="text"
              name="destination"
              placeholder="e.g., Algergawi Mosque, Gaza"
              required
            />
          </label>
          <button type="submit">Set Destination</button>
          <div className="button-group">
            <button 
              onClick={() => focusOnPoint(destination)} 
              disabled={!destination}
              className="control-button"
            >
              Go to Destination
            </button>
          </div>
        </form>

        <div className="route-actions">
          <button 
            onClick={fetchRoute} 
            disabled={!startPoint || !destination || loading}
            className="route-button"
          >
            {loading ? "Loading..." : "Show Route"}
          </button>
        </div>

        {routeDetails && (
          <div className="route-details">
            <h3>Route Information</h3>
            <p>Distance: {routeDetails.distance}</p>
            <p>Duration: {routeDetails.duration}</p>
          </div>
        )}
      </div>
      <div ref={mapRef} className="map-container"></div>
    </div>
  );
};


export default HomePage;