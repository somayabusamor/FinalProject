import React, { useEffect, useRef, useState } from "react";
import './homepage.css';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/frontend/context/LanguageProvider';
import { useTranslations } from '@/frontend/constants/locales';
import { I18nManager } from 'react-native';
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
  const [loading, setLoading] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const router = useRouter();
  const { language } = useLanguage();
  const  t  = useTranslations();

  // Sample landmarks data
  const [landmarks] = useState<{ lat: number; lon: number; name: string }[]>([
    { lat: 31.155844, lon: 34.807268, name: t.landmarks.algergawiShop },
    { lat: 31.15478, lon: 34.809776, name: t.landmarks.electricityPole },
    { lat: 31.155101, lon: 34.811155, name: t.landmarks.electricCompany },
    { lat: 31.163493, lon: 34.820984, name: t.landmarks.azazmaSchool },
    { lat: 31.15632, lon: 34.810717, name: t.landmarks.algergawiMosque },
    { lat: 31.166333, lon: 34.812421, name: t.landmarks.abuSwilimMaterials },
    { lat: 31.166306, lon: 34.814712, name: t.landmarks.abuSwilimMosque },
    { lat: 31.163345, lon: 34.815559, name: t.landmarks.abuMuharibButcher },
    { lat: 31.155848, lon: 34.807387, name: t.landmarks.mauhidetClinic },
    { lat: 31.166374, lon: 34.810585, name: t.landmarks.dentalClinic },
    { lat: 31.156483, lon: 34.805685, name: t.landmarks.electricCompanyEntry },
    { lat: 31.155741, lon: 34.806393, name: t.landmarks.greenContainer },
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
        name: t.HomePage.startpoint
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
      alert(t.HomePage.enterStartingAddress);
      return;
    }

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
      alert(t.HomePage.enterDestinationAddress);
      return;
    }

    const result = await geocodeAddress(address);
    if (result) {
      setDestination(result);
      focusOnPoint(result);
    } else {
      alert(t.HomePage.couldNotFindLocation);
    }
  };

  return (
    <div className="homepage-container">
      <div className="left-container">
        <form onSubmit={updateStartPoint}>
          <label>
            {t.HomePage.startingPoint}:
            <input
              type="text"
              name="startPoint"
              placeholder={t.HomePage.enterStartingAddress}
              defaultValue={startPoint ? t.HomePage.currentLocation : ""}
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
              placeholder={t.HomePage.enterDestinationAddress}
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
            <h3>{t.HomePage.routeInformation}</h3>
            <p>
              {t.HomePage.distance}: {routeDetails.distance}
            </p>
            <p>
              {t.HomePage.duration}: {routeDetails.duration}
            </p>
          </div>
        )}
      </div>
      <div ref={mapRef} className="map-container"></div>
    </div>
    
  );
};

export default HomePage;