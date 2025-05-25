import React, { useEffect, useRef, useState } from "react";
import Plotly from 'plotly.js';
import axios from 'axios';
const API_BASE_URL = 'http://localhost:8082/api'; // Adjust to your backend URL
// Add this at the top of your file
import { ErrorBoundary } from 'react-error-boundary';
interface Location {
  lat: number;
  lon: number;
}

interface Landmark {
  _id: string;  // Changed from id to _id
  lat: number;
  lon: number;
  title: string;
  color: string;
  imageUrl: string;
  verified: boolean;
  votes: {
    userId: string;
    vote: 'yes' | 'no';
  }[];
}

interface VoteResponse {
  success: boolean;
  data: Landmark;
  message?: string;
}

const HomePage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const [location, setLocation] = useState<Location | null>(null);
  const [clickedLocation, setClickedLocation] = useState<Location | null>(null);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newLandmark, setNewLandmark] = useState<Omit<Landmark, '_id' | 'verified' | 'votes'>>({
    title: '',
    lat: 0,
    lon: 0,
    color: '#8B4513',
    imageUrl: ''
  });
  const [mapCenter, setMapCenter] = useState<{lat:number; lon:number} | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [currentUserId] = useState<string>(() => `user-${Math.random().toString(36).substr(2, 9)}`);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  

  type AppStyles = {
    [key: string]: React.CSSProperties;
  };

  const styles: AppStyles = {
    container: {
      position: "relative",
      width: "100vw",
      height: "100vh",
      backgroundColor: "#fff"
    },
    loadingContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f5f5f5",
      zIndex: 10
    },
    mapContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 0,
      cursor: "crosshair"
    },
    locationInfo: {
      position: "absolute",
      top: 20,
      right: 20,
      backgroundColor: "white",
      padding: 15,
      borderRadius: 12,
      border: "1px solid #f0e6e2",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      zIndex: 1
    },
    formContainer: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "white",
      padding: 25,
      borderRadius: 12,
      border: "1px solid #f0e6e2",
      boxShadow: "0 0 20px rgba(0,0,0,0.15)",
      zIndex: 2,
      width: 350,
      maxWidth: "90%"
    },
    landmarksList: {
      position: "absolute",
      bottom: 20,
      left: 20,
      backgroundColor: "white",
      padding: 15,
      borderRadius: 12,
      border: "1px solid #f0e6e2",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      zIndex: 1,
      maxHeight: 300,
      overflowY: "auto",
      width: 250,
      maxWidth: "90%"
    },
    header: {
      position: "absolute",
      top: 20,
      left: 20,
      backgroundColor: "rgba(255,255,255,0.9)",
      padding: 15,
      borderRadius: 12,
      border: "1px solid #f0e6e2",
      zIndex: 1,
      userSelect: "none"
    },
    modalOverlay: {
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
    },
    modalContent: {
      backgroundColor: "white",
      padding: 25,
      borderRadius: 12,
      width: "90%",
      maxWidth: 500,
      maxHeight: "90%",
      overflowY: "auto",
      border: "1px solid #f0e6e2"
    },
    input: {
      width: "100%",
      padding: 12,
      borderWidth: 1,
      borderColor: "#d7ccc8",
      borderRadius: 8,
      marginBottom: 20,
      fontSize: 16,
      backgroundColor: "#fff",
      color: "#5d4037"
    },
    button: {
      backgroundColor: "#6d4c41",
      padding: "12px 16px",
      borderRadius: 8,
      color: "#FFD700",
      border: "none",
      fontSize: 16,
      fontWeight: "bold",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%"
    },
    buttonSecondary: {
      backgroundColor: "#f5f5f5",
      padding: "12px 16px",
      borderRadius: 8,
      color: "#5d4037",
      border: "1px solid #d7ccc8",
      fontSize: 16,
      cursor: "pointer"
    },
    buttonGroup: {
      display: "flex",
      gap: 10,
      marginTop: 15
    },
    landmarkItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 0",
      borderBottom: "1px solid #f0e6e2"
    },
    landmarkColor: {
      width: 14,
      height: 14,
      borderRadius: "50%",
      marginRight: 10,
      border: "1px solid #d7ccc8"
    },
    verificationBadge: {
      fontSize: 12,
      color: "#8d6e63",
      fontWeight: "bold"
    },
    imagePreview: {
      maxWidth: "100%",
      maxHeight: 200,
      margin: "10px 0",
      borderRadius: 8,
      border: "1px solid #d7ccc8"
    },
    verificationStatus: {
      backgroundColor: '#f5f5f5',
      padding: 15,
      borderRadius: 8,
      margin: "15px 0",
      border: "1px solid #f0e6e2"
    },
  voteButton: {
    flex: 1,
    minWidth: 120,
    padding: '10px 15px',
    border: 'none',
    borderRadius: 8,
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    margin: '0 5px',
    transition: 'all 0.3s ease',
    opacity: 1
  },
voteButtonYes: {
    backgroundColor: '#4CAF50',
  },
  voteButtonNo: {
    backgroundColor: '#f44336',
  },
  submittingButton: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6d4c41",
    marginBottom: 15
  },
    subtitle: {
      fontSize: 16,
      color: "#8d6e63",
      marginBottom: 10
    }
  };

    // Fixed useEffect for loading landmarks
  useEffect(() => {
    const loadLandmarks = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/landmarks`);
        setLandmarks(response.data);
      } catch (error) {
        console.error("Error loading landmarks:", error);
        // Fallback to empty array if API fails
        setLandmarks([]);
      } finally {
        setIsMapLoading(false);
      }
    };

    loadLandmarks();
  }, []);

  useEffect(() => {
    renderMap();
  }, [landmarks]);

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
          setLocation({ lat: 24.7136, lon: 46.6753 });
          setMapCenter({ lat: 24.7136, lon: 46.6753 });
        }
      );
    } else {
      setLocation({ lat: 24.7136, lon: 46.6753 });
      setMapCenter({ lat: 24.7136, lon: 46.6753 });
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || !location || isMapLoading) return;

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
  }, [location, isMapLoading]);

  // Update the handleVote function to use PUT method
const handleVote = async (voteType: 'yes' | 'no') => {
  if (!selectedLandmark?._id) {
    alert("Please select a landmark first");
    return;
  }

  try {
    setIsVoting(true);
    
    const response = await axios.put<VoteResponse>(
      `${API_BASE_URL}/landmarks/${selectedLandmark._id}/vote`,
      { 
        userId: currentUserId,
        vote: voteType 
      },
      {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Vote failed on server");
    }

    // Merge the updated votes with the existing landmark data
    const updatedLandmark = {
      ...selectedLandmark,
      verified: response.data.data.verified,
      votes: response.data.data.votes
    };

    // Update the landmarks list
    setLandmarks(prev => prev.map(lm => 
      lm._id === selectedLandmark._id ? updatedLandmark : lm
    ));
    
    // Update the selected landmark view
    setSelectedLandmark(updatedLandmark);

  } catch (error: any) {
    console.error("Vote error:", error);
    alert(error.response?.data?.message || "Voting failed. Please try again.");
  } finally {
    setIsVoting(false);
  }
};
// Update the handleDeleteLandmark function
const handleDeleteLandmark = async (_id: string) => {
  try {
    await axios.delete(`${API_BASE_URL}/landmarks/${_id}`);
    setLandmarks(prev => prev.filter(lm => lm._id !== _id));
    if (selectedLandmark?._id === _id) {
      setSelectedLandmark(null);
    }
  } catch (error: any) {
    console.error("Error deleting landmark:", error.message);
    alert("Failed to delete landmark. Please try again.");
  }
};

  // Update the renderMap function to use _id
  const renderMap = () => {
    if (!window.Plotly || !mapRef.current || !location) return;

    const userLocationTrace = {
      type: "scattermapbox",
      lat: [location.lat],
      lon: [location.lon],
      text: ["Your location"],
      mode: "markers",
      marker: {
        size: 14,
        color: '#FFD700', // Changed to always be yellow
        symbol: "circle"
      },
      name: "Your Location",
      hoverinfo: "text"
    };

    const landmarksTraces = landmarks.map(landmark => ({
      type: "scattermapbox",
      lat: [landmark.lat],
      lon: [landmark.lon],
      text: [landmark.title + (landmark.verified ? '' : ' (Pending)')],
      mode: "markers",
      marker: {
        size: 14,
        color: landmark.verified ? landmark.color : '#AAAAAA',
        symbol: 'circle',
        opacity: 1
      },
      name: landmark.title,
      customdata: [landmark._id],  // Changed to _id
      hoverinfo: "text"
    }));

    const layout = {
      mapbox: {
        style: "open-street-map",
        center: mapCenter || { lat: location.lat, lon: location.lon },
        zoom: mapZoom,
      },
      margin: { t: 0, b: 0, l: 0, r: 0 },
      showlegend: false
    };

    // Update the plotly_click event handler
  window.Plotly.react(
    mapRef.current,
    [userLocationTrace, ...landmarksTraces],
    layout
  ).then(() => {
    const plotElement = mapRef.current as unknown as PlotlyHTMLElement;
    
    plotElement.on('plotly_click', (data: any) => {
      const point = data.points[0];
      if (!point) return;

      if (point.customdata) {
        const landmarkId = point.customdata;
        const clickedLandmark = landmarks.find(l => l._id === landmarkId); // Changed to _id
          if (clickedLandmark) setSelectedLandmark(clickedLandmark);
        } else {
          setClickedLocation({ lat: point.lat, lon: point.lon });
          setNewLandmark(prev => ({
            ...prev,
            lat: point.lat,
            lon: point.lon
          }));
          setShowForm(true);
        }
      });

      plotElement.on('plotly_relayout', (eventdata: any) => {
        if (eventdata['mapbox.center']) {
          setMapCenter({
            lat: eventdata['mapbox.center'].lat,
            lon: eventdata['mapbox.center'].lon
          });
        }
        if (eventdata['mapbox.zoom']) {
          setMapZoom(eventdata['mapbox.zoom']);
        }
      });
    });
  };

  const onMapDivClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!mapRef.current || !mapCenter) return;

    const bounds = mapRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    const width = bounds.width;
    const height = bounds.height;
    const zoom = mapZoom;

    const scale = 256 * Math.pow(2, zoom);
    const lonPerPixel = 360 / scale;
    const latPerPixel = 360 / scale;

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

  // Fixed addLandmark function
const addLandmark = async (landmarkData: { 
    title: string; 
    lat: number; 
    lon: number; 
    imageUrl: string; 
    color: string 
  }) => {
    if (!landmarkData.title.trim()) return;

    try {
      const response = await axios.post<Landmark>(`${API_BASE_URL}/landmarks`, {
        title: landmarkData.title.trim(),
        lat: Number(landmarkData.lat),
        lon: Number(landmarkData.lon),
        color: landmarkData.color || '#FFD700',
        imageUrl: landmarkData.imageUrl || '',
        verified: false,
        votes: []
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setLandmarks(prev => [...prev, response.data]);
      setShowForm(false);
      setNewLandmark({
        title: '',
        lat: 0,
        lon: 0,
        color: '#FFD700',
        imageUrl: ''
      });
    } catch (error) {
      console.error("Error adding landmark:", error);
    }
  };
  return (
    <div style={styles.container}>
      {isMapLoading ? (
        <div style={styles.loadingContainer}>
          <div>Loading map...</div>
        </div>
      ) : (
        <>
          <div
            ref={mapRef}
            onClick={onMapDivClick}
            style={styles.mapContainer}
          />

          {clickedLocation && (
            <div style={styles.locationInfo}>
              <h4>Selected Location:</h4>
              <p>Latitude: {clickedLocation.lat.toFixed(6)}</p>
              <p>Longitude: {clickedLocation.lon.toFixed(6)}</p>
            </div>
          )}

          {showForm && (
            <div style={styles.formContainer}>
              <h3>Add New Landmark</h3>
              <input
                type="text"
                placeholder="Landmark title"
                value={newLandmark.title}
                onChange={(e) => setNewLandmark({...newLandmark, title: e.target.value})}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Image URL (optional)"
                value={newLandmark.imageUrl}
                onChange={(e) => setNewLandmark({...newLandmark, imageUrl: e.target.value})}
                style={styles.input}
              />
              <div style={styles.buttonGroup}>
                <button 
                  onClick={() => addLandmark({
                    ...newLandmark,
                    lat: clickedLocation?.lat || 0,
                    lon: clickedLocation?.lon || 0
                  })}
                  style={styles.button}
                >
                  Add Landmark
                </button>
                <button 
                  onClick={() => setShowForm(false)}
                  style={styles.buttonSecondary}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {landmarks.length > 0 && (
            <div style={styles.landmarksList}>
              <h4>Landmarks ({landmarks.length})</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {landmarks.map(landmark => (
                  <li 
                    key={landmark._id}
                    style={styles.landmarkItem}
                    onClick={() => setSelectedLandmark(landmark)}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div style={{
                        ...styles.landmarkColor,
                        backgroundColor: landmark.verified ? landmark.color : '#FFD700',
                        border: landmark.verified ? 'none' : '1px solid #999'
                      }} />
                      <div>
                        <div>{landmark.title}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLandmark(landmark._id);
                          }}
                          style={{ ...styles.buttonSecondary, padding: "4px 8px", fontSize: 12 }}
                        >
                          Delete
                        </button>
                        <div style={styles.verificationBadge}>
                          {landmark.verified ? 'Verified' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={styles.header}>
            <h3>Landmarks Map</h3>
            <p>Click on the map to add a new landmark</p>
          </div>
        </>
      )}
      {landmarks.map((landmark) => (
        <div key={landmark._id} style={styles.landmarkItem}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ ...styles.landmarkColor, backgroundColor: landmark.color }}></div>
              <span>{landmark.title}</span>
            </div>
            <button
              style={{ ...styles.buttonSecondary, backgroundColor: '#e57373', color: 'white' }}
              onClick={() => handleDeleteLandmark(landmark._id)}
            >
              Delete
            </button>
          </div>
        ))}


      {selectedLandmark && (
         <div style={styles.modalOverlay} onClick={() => setSelectedLandmark(null)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={styles.title}>{selectedLandmark.title}</h3>
            <p style={{ 
              color: selectedLandmark.verified ? '#4CAF50' : '#FF9800',
              fontWeight: 'bold'
            }}>
              {selectedLandmark.verified ? '✅ Verified Landmark' : '🕒 Pending Verification'}
            </p>
            
            {selectedLandmark.imageUrl && (
              <img 
                src={selectedLandmark.imageUrl} 
                style={styles.imagePreview}
                alt={selectedLandmark.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}

            <div style={{ margin: "15px 0" }}>
                <p style={styles.subtitle}>Coordinates:</p>
                <p>Latitude: {selectedLandmark?.lat?.toFixed(6) || 'N/A'}</p>
                <p>Longitude: {selectedLandmark?.lon?.toFixed(6) || 'N/A'}</p>
              </div>

            <div style={styles.verificationStatus}>
              <h4>Verification Status</h4>
              <p>
                <span style={{ color: "#4CAF50", fontWeight: 'bold' }}>
                  {selectedLandmark.votes.filter(v => v.vote === 'yes').length} Yes
                </span> / 
                <span style={{ color: "#f44336", fontWeight: 'bold' }}>
                  {' '}{selectedLandmark.votes.filter(v => v.vote === 'no').length} No
                </span>
              </p>
              <p>Needs 5 Yes votes to verify</p>
              
              {!selectedLandmark.verified && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote('yes');
                  }}
                  disabled={isVoting}
                  style={{
                    ...styles.voteButton,
                    ...styles.voteButtonYes,
                    ...(isVoting && styles.submittingButton)
                  }}
                >
                  {isVoting ? 'Submitting...' : 'Vote Yes'}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote('no');
                  }}
                  disabled={isVoting}
                  style={{
                    ...styles.voteButton,
                    ...styles.voteButtonNo,
                    ...(isVoting && styles.submittingButton)
                  }}
                >
                  {isVoting ? 'Submitting...' : 'Vote No'}
                </button>
              </div>
            )}
            </div>

            <button 
              onClick={() => setSelectedLandmark(null)}
              style={styles.button}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;