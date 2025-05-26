import React, { useEffect, useRef, useState } from "react";
import './homepage.css';
import { useRouter } from 'expo-router';
import axios from "axios";
import mapboxgl from 'mapbox-gl';
import emergencyIcon from './location_icon.png';
interface Landmark {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}


type Point = {
  lat: number;
  lon: number;
  Name?: string; // or `title?: string` if you prefer
};

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
  const [startPoint, setStartPoint] = useState<{ lat: number; lon: number; title?: string } | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lon: number;title?: string } | null>(null);
  const [route, setRoute] = useState<{ lat: number[]; lon: number[] } | null>(null);
  const [routeDetails, setRouteDetails] = useState<{ distance: string; duration: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const router = useRouter();
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<{ lat: number, lon: number, title: string } | null>(null);

  const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1Ijoic3JhZWwxMiIsImEiOiJjbTVpZmk1angwd2puMmlzNzliendwcDZhIn0.K1gCuh7b0tNdi58FGEhBcA';

  // Sample landmarks data
    const staticLandmarks = [
    { lat: 31.155844, lon: 34.807268, title: "Algergawi Shop" },
    { lat: 31.15478, lon: 34.809776, title: "Electricity Pole" },
    { lat: 31.155101, lon: 34.811155, title: "Electric Company" },
    { lat: 31.163493, lon: 34.820984, title: "Al-Azazma School" },
    { lat: 31.15632, lon: 34.810717, title: "Algergawi Mosque" },
    { lat: 31.166333, lon: 34.812421, title: "Abu Swilim Building Materials" },
    { lat: 31.166306, lon: 34.814712, title: "Abu Swilim Mosque" },
    { lat: 31.163345, lon: 34.815559, title: "Abu Muharib's Butcher Shop" },
    { lat: 31.155848, lon: 34.807387, title: "Mauhidet Clinic" },
    { lat: 31.166374, lon: 34.810585, title: "General Dental Clinic" },
    { lat: 31.156483, lon: 34.805685, title: "The Entry of the Electric Company" },
    { lat: 31.155741, lon: 34.806393, title: "The Green Container" },
  ];
const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number }>({ lat: 33.892166, lon: 35.513889 });
const [mapZoom, setMapZoom] = useState(10); // Default zoom

  const [landmarks, setLandmarks] = useState(staticLandmarks); // initialize with static
 
  const convertToDMS = (lat: number, lon: number) => {
    const toDMS = (deg: number, type: "lat" | "lon") => {
      const dir = type === "lat" ? (deg >= 0 ? "N" : "S") : deg >= 0 ? "E" : "W";
      const abs = Math.abs(deg);
      const degrees = Math.floor(abs);
      const minutesFloat = (abs - degrees) * 60;
      const minutes = Math.floor(minutesFloat);
      const seconds = ((minutesFloat - minutes) * 60).toFixed(1);
  
      return `${degrees}°${String(minutes).padStart(2, '0')}'${String(seconds).padStart(4, '0')}"${dir}`;
    };
  
    return {
      latDMS: toDMS(lat, "lat"),
      lonDMS: toDMS(lon, "lon"),
    };
  };

  useEffect(() => {
    const fetchLandmarks = async () => {
      try {
        const response = await axios.get("http://localhost:8082/api/landmarks");
        const dbLandmarks = response.data;

        // Combine frontend + backend landmarks
        const combined = [...staticLandmarks, ...dbLandmarks];
        setLandmarks(combined);
      } catch (error) {
        console.error("Error fetching landmarks:", error);
        // Keep only static landmarks if fetch fails
      }
    };

    fetchLandmarks();
  }, []);
  
  
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
  const handleLandmarkClick = (landmark: Landmark) => {
    setSelectedLandmark({
      lat: landmark.latitude,
      lon: landmark.longitude,
      title: landmark.name,
    });
    setMapCenter({ lat: landmark.latitude, lon: landmark.longitude });
    setMapZoom(14);
  };
  
  // Get user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          
          const { latitude, longitude } = position.coords;
          //const { latDMS, lonDMS }= convertToDMS(latitude, longitude);
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
  useEffect(() => {
    if (I18nManager.isRTL !== (language === 'ar')) {
      I18nManager.forceRTL(language === 'ar');
    }
  }, [language]);

  // Render or update map
  const renderMap = () => {
    if (!mapRef.current || !window.Plotly || !mapInitialized) {
      console.log('Map not ready to render');
      return;
    }

    const data: any[] = [];

    // Add landmarks

    // Add landmarks
    landmarks.forEach((landmark) => {
      data.push({
        type: "scattermapbox",
        lat: [landmark.lat],
        lon: [landmark.lon],
        text: [landmark.title],
        mode: "markers+text",
        marker: {
          size: 10,
          color: "blue",
          symbol: "marker" // optional for default symbol
        },
        name: landmark.title
      });
    })
   
// Add start point
if (startPoint) {
  const { latDMS, lonDMS } = convertToDMS(startPoint.lat, startPoint.lon);
  data.push({
    type: "scattermapbox",
    lat: [startPoint.lat],
    lon: [startPoint.lon],
    text: [`Start Point\n${latDMS}, ${lonDMS}`],
    mode: "markers+text",
    marker: { size: 14, color: "red" },
    textposition: "top right",
    name: "Start Point"
  });
}

// Add destination
if (destination) {
  const { latDMS, lonDMS } = convertToDMS(destination.lat, destination.lon);
  data.push({
    type: "scattermapbox",
    lat: [destination.lat],
    lon: [destination.lon],
    text: [`Destination\n${latDMS}, ${lonDMS}`],
    mode: "markers+text",
    marker: { size: 14, color: "green" },
    textposition: "top right",
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
    const layout = {
      mapbox: {
        style: "mapbox://styles/mapbox/streets-v11",
        center: {  lat: landmarks[0].lat,lon: landmarks[0].lon },
        zoom: 18,
        layers: landmarks.map((landmark) => ({
          sourcetype: "image",
          source: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Example pin icon
          coordinates: [
            [landmark.lon - 0.001, landmark.lat + 0.001], // top left
            [landmark.lon + 0.001, landmark.lat + 0.001], // top right
            [landmark.lon + 0.001, landmark.lat - 0.001], // bottom right
            [landmark.lon - 0.001, landmark.lat - 0.001]  // bottom left
          ]
        }))
      },
      margin: { t: 0, b: 0, l: 0, r: 0 }
    };
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
        return { lon, lat };
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
  
    // 1. Check if address exists in staticLandmarks
    const landmark = staticLandmarks.find(
      (lm) => lm.title.toLowerCase() === address.trim().toLowerCase()
    );
  
    if (landmark) {
      // If found in staticLandmarks, use its coordinates directly
      setStartPoint({ lat: landmark.lat, lon: landmark.lon, title: landmark.title });
      focusOnPoint({ lat: landmark.lat, lon: landmark.lon });
      return;
    }
  
    // 2. If not found in staticLandmarks, try geocoding
    const result = await geocodeAddress(address);
    if (result) {
      setStartPoint(result);
      focusOnPoint(result);
    } else {
      alert(t.HomePage.couldNotFindLocation);
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
  
    // Check if address exists in staticLandmarks
    const landmark = staticLandmarks.find(
      (lm) => lm.title.toLowerCase() === address.trim().toLowerCase()
    );
  
    if (landmark) {
      // If found in staticLandmarks, use its coordinates directly
      setDestination({ lat: landmark.lat, lon: landmark.lon, title: landmark.title});
      focusOnPoint({ lat: landmark.lat, lon: landmark.lon });
      return;
    }
  
    // Otherwise, try to geocode
    const result = await geocodeAddress(address);
    if (result) {
      setDestination(result);
      focusOnPoint(result);
    } else {
      alert(t.HomePage.couldNotFindLocation);
    }
  };
  

  const focusOnPoint = (point: { lat: number; lon: number } | null) => {
    if (!mapRef.current || !point || !window.Plotly) return;
    window.Plotly.relayout(mapRef.current, {
      "mapbox.center": { lat: point.lat, lon: point.lon },
      "mapbox.zoom": 14,
    });
  };
  

  // Update the return statement with new button layout:
  return (
    <div className="homepage-container">
      <div className="left-container">
        <form onSubmit={updateStartPoint}>
          <label>
            {t.HomePage.startingPoint}:
            <input
              type="text"
              name="startPoint"
              placeholder="lat,lon : Current Location or specific address"
              defaultValue={startPoint ? "Current Location" : ""}
              required
            />
          </label>
          <button type="submit">{t.HomePage.setStartingPoint}</button>
          <div className="button-group">
            <button
              onClick={() => focusOnPoint(startPoint)}
              disabled={!startPoint}
              className="control-button"
            >
              {t.HomePage.goToStart}
            </button>
          </div>
        </form>

        <form onSubmit={updateDestination}>
          <label>
            {t.HomePage.destination}:
            <input
              type="text"
              name="destination"
              placeholder="lat,lon / Destination Name"
              required
            />
          </label>
          <button type="submit">{t.HomePage.setDestination}</button>
          <div className="button-group">
            <button
              onClick={() => focusOnPoint(destination)}
              disabled={!destination}
              className="control-button"
            >
              {t.HomePage.goToDestination}
            </button>
          </div>
        </form>

        <div className="route-actions">
          <button
            onClick={fetchRoute}
            disabled={!startPoint || !destination || loading}
            className="route-button"
          >
            {loading ? t.HomePage.loading : t.HomePage.showRoute}
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
      <div className="right-container">
      <div ref={mapRef} className="map-container">
        {selectedLandmark && (
          <div
            className="icon-overlay"
            style={{
              position: 'absolute',
              top: '40%',
              left: '40%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}
          >
            <img
              src={emergencyIcon}
              alt={selectedLandmark.title}
              style={{ width: '80px', height: '80px' }}
            />
            <div>{selectedLandmark.title}</div>
          </div>
        )}
      </div>
</div>

  
     <div ref={mapRef} className="map-container"></div>
    </div>
    
  );
};

export default HomePage;