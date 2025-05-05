import React, { useEffect, useRef, useState } from "react";

interface Location {
  lat: number;
  lon: number;
}

interface Landmark {
  id: string;
  lat: number;
  lon: number;
  title: string;
  color: string;
  imageUrl: string;
}

const HomePage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [clickedLocation, setClickedLocation] = useState<Location | null>(null);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newLandmark, setNewLandmark] = useState<Omit<Landmark, 'id'>>({
    title: '',
    lat: 0,
    lon: 0,
    color: '#4285F4',
    imageUrl: ''
  });
  const [mapCenter, setMapCenter] = useState<{lat:number; lon:number} | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);

  // Load saved landmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('landmarks');
    if (saved) setLandmarks(JSON.parse(saved));
  }, []);

  // Save landmarks and re-render map on landmarks change
  useEffect(() => {
    localStorage.setItem('landmarks', JSON.stringify(landmarks));
    renderMap();
  }, [landmarks]);

  // Get user location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setMapCenter({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        () => {
          setLocation({ lat: 24.7136, lon: 46.6753 }); // Riyadh default
          setMapCenter({ lat: 24.7136, lon: 46.6753 });
        }
      );
    } else {
      setLocation({ lat: 24.7136, lon: 46.6753 });
      setMapCenter({ lat: 24.7136, lon: 46.6753 });
    }
  }, []);

  // Load Plotly and render map on location change
  useEffect(() => {
    if (!mapRef.current || !location) return;

    const loadPlotly = async () => {
      if (!window.Plotly) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.plot.ly/plotly-2.18.2.min.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
      renderMap();
    };

    loadPlotly();
  }, [location]);

  // Function to render map with current user location and landmarks
  const renderMap = () => {
    if (!window.Plotly || !mapRef.current || !location) return;
  
    const userLocationTrace = {
      type: "scattermapbox",
      lat: [location.lat],
      lon: [location.lon],
      text: ["Your current location"],
      mode: "markers",
      marker: { 
        size: 14, 
        color: "red",
        symbol: 'circle' 
      },
      name: 'Your Location'
    };
  
    const landmarksData = landmarks.map(landmark => ({
      type: "scattermapbox",
      lat: [landmark.lat],
      lon: [landmark.lon],
      text: [landmark.title],
      mode: "markers",
      marker: {
        size: 14,
        color: landmark.color,
        symbol: 'circle' // Using simple circle symbol for reliability
      },
      name: landmark.title,
      customdata: [landmark.id] // Store landmark ID for reference
    }));
  
    const layout = {
      mapbox: {
        style: "open-street-map",
        center: mapCenter || { lat: location.lat, lon: location.lon },
        zoom: mapZoom,
      },
      margin: { t: 0, b: 0, l: 0, r: 0 },
      showlegend: true,
    };
  
    window.Plotly.react(
      mapRef.current,
      [userLocationTrace, ...landmarksData],
      layout,
      { responsive: true }
    );
  
    const plotElement = mapRef.current as unknown as { on: (event: string, callback: (data: any) => void) => void };
    plotElement.on('plotly_click', (data: any) => {
      const point = data.points[0];
      if (point) {
        // Check if this is a landmark click (user location is point 0)
        if (point.pointNumber > 0) {
          const landmarkId = point.customdata;
          const clickedLandmark = landmarks.find(l => l.id === landmarkId);
          if (clickedLandmark && clickedLandmark.imageUrl) {
            setSelectedLandmark(clickedLandmark);
          }
        } else {
          const clickedLoc = { lat: point.lat, lon: point.lon };
          setClickedLocation(clickedLoc);
          setNewLandmark(prev => ({
            ...prev,
            lat: clickedLoc.lat,
            lon: clickedLoc.lon
          }));
          setShowForm(true);
        }
      }
    });

    plotElement.on('plotly_relayout', (eventdata: any) => {
      if (eventdata['mapbox.center']) {
        const center = eventdata['mapbox.center'];
        setMapCenter({ lat: center.lat, lon: center.lon });
      }
      if (eventdata['mapbox.zoom']) {
        setMapZoom(eventdata['mapbox.zoom']);
      }
    });
  };

  // Convert click on map div to approximate lat, lon based on map center, zoom, and div size
  const onMapDivClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!mapRef.current || !mapCenter) return;

    const bounds = mapRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    const width = bounds.width;
    const height = bounds.height;
    const zoom = mapZoom;

    // Approximate calculation for degrees per pixel using Web Mercator scale
    const scale = 256 * Math.pow(2, zoom);
    const lonPerPixel = 360 / scale;
    const latPerPixel = 360 / scale; // Approximate for latitude

    const lon = mapCenter.lon + (x - width / 2) * lonPerPixel;
    const lat = mapCenter.lat - (y - height / 2) * latPerPixel;

    const latClamped = Math.min(85, Math.max(-85, lat));

    setClickedLocation({ lat: latClamped, lon });
    setNewLandmark(prev => ({
      ...prev,
      lat: latClamped,
      lon,
    }));
    setShowForm(true);
  };

  const addLandmark = () => {
    if (!newLandmark.title.trim()) return;

    const landmark: Landmark = {
      ...newLandmark,
      id: Date.now().toString()
    };

    setLandmarks(prevLandmarks => [...prevLandmarks, landmark]);

    setShowForm(false);
    setNewLandmark({
      title: '',
      lat: 0,
      lon: 0,
      color: '#4285F4',
      imageUrl: ''
    });
  };

  const removeLandmark = (id: string) => {
    setLandmarks(landmarks.filter(l => l.id !== id));
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <div
        ref={mapRef}
        onClick={onMapDivClick}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          cursor: "crosshair"
        }}
      />

      {clickedLocation && (
        <div style={{
          position: "absolute",
          top: 20,
          right: 20,
          backgroundColor: "white",
          padding: 10,
          borderRadius: 8,
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          zIndex: 1
        }}>
          <h4>Selected Location:</h4>
          <p>Latitude: {clickedLocation.lat.toFixed(6)}</p>
          <p>Longitude: {clickedLocation.lon.toFixed(6)}</p>
        </div>
      )}

      {showForm && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: 20,
          borderRadius: 8,
          boxShadow: "0 0 20px rgba(0,0,0,0.3)",
          zIndex: 2,
          width: 320
        }}>
          <h3>Add New Landmark</h3>
          <div style={{ marginBottom: 15 }}>
            <label>Landmark Title:</label>
            <input
              type="text"
              value={newLandmark.title}
              onChange={(e) => setNewLandmark({...newLandmark, title: e.target.value})}
              style={{ width: "100%", padding: 8 }}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 15 }}>
            <label>Image URL:</label>
            <input
              type="url"
              value={newLandmark.imageUrl}
              onChange={(e) => setNewLandmark({...newLandmark, imageUrl: e.target.value})}
              style={{ width: "100%", padding: 8 }}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div style={{ marginBottom: 15 }}>
            <label>Marker Color:</label>
            <input
              type="color"
              value={newLandmark.color}
              onChange={(e) => setNewLandmark({...newLandmark, color: e.target.value})}
              style={{ width: "100%", height: 40 }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setShowForm(false)}>Cancel</button>
            <button 
              onClick={addLandmark}
              disabled={!newLandmark.title.trim()}
              style={{ backgroundColor: "#4285F4", color: "white" }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {landmarks.length > 0 && (
        <div style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          backgroundColor: "white",
          padding: 10,
          borderRadius: 8,
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          zIndex: 1,
          maxHeight: 300,
          overflowY: "auto",
          minWidth: 200,
        }}>
          <h4>Landmarks ({landmarks.length})</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {landmarks.map(landmark => (
              <li key={landmark.id} style={{ 
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    backgroundColor: landmark.color,
                    borderRadius: "50%",
                    marginRight: 8
                  }} />
                  <div>
                    <div>{landmark.title}</div>
                    {landmark.imageUrl && (
                      <div style={{ fontSize: '0.8em', color: '#666' }}>
                        <a href={landmark.imageUrl} target="_blank" rel="noopener noreferrer">
                          View Image
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => removeLandmark(landmark.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "red",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "1.2em",
                    lineHeight: 1
                  }}
                  aria-label={`Remove landmark ${landmark.title}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedLandmark && selectedLandmark.imageUrl && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 100
        }} onClick={() => setSelectedLandmark(null)}>
          <div style={{
            maxWidth: "90%",
            maxHeight: "90%",
            backgroundColor: "white",
            padding: 20,
            borderRadius: 8
          }} onClick={e => e.stopPropagation()}>
            <h3>{selectedLandmark.title}</h3>
            <img 
              src={selectedLandmark.imageUrl} 
              alt={selectedLandmark.title}
              style={{ maxWidth: "100%", maxHeight: "400px" }}
            />
            <button 
              onClick={() => setSelectedLandmark(null)}
              style={{ marginTop: 10 }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div style={{
        position: "absolute",
        top: 20,
        left: 20,
        backgroundColor: "rgba(255,255,255,0.9)",
        padding: 10,
        borderRadius: 8,
        zIndex: 1,
        userSelect: "none"
      }}>
        <h3>Landmarks Map</h3>
        <p>Click on the map to add a new landmark</p>
      </div>
    </div>
  );
};

export default HomePage;
