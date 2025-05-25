import React, { useEffect, useRef, useState } from "react";
import { PlotlyHTMLElement } from 'plotly.js';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import mongoose from 'mongoose';

const API_BASE_URL = 'http://localhost:8082/api';

interface Location {
  lat: number;
  lon: number;
}
// Update the interface for Landmark
interface Landmark {
  _id: string;
  title: string;
  lat: number;
  lon: number;
  color: string;
  imageUrl: string;
  verified: boolean;
  votes: {
    userId: string;
    vote: 'yes' | 'no';
    weight: number;
  }[];
  createdBy: mongoose.Types.ObjectId | string;
  _calculatedWeights?: {
    totalWeight: number;
    yesWeight: number;
    noWeight: number;
  };
}

interface VoteResponse {
  success: boolean;
  data: Landmark;
  message?: string;
}

interface ErrorResponse {
  message?: string;
  error?: string;
  stack?: string;
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

const LandmarkPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [mapCenter, setMapCenter] = useState<{lat:number; lon:number} | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [clickedLocation, setClickedLocation] = useState<Location | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [newLandmark, setNewLandmark] = useState({
    title: '',
    lat: 0,
    lon: 0,
    color: '#8B4513',
    imageUrl: ''
  });

  const router = useRouter();
  const [voteError, setVoteError] = useState("");
  const [voteSuccess, setVoteSuccess] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");

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
      padding: "25px",
      borderRadius: "12px",
      width: "90%",
      maxWidth: "500px",
      maxHeight: "90vh",
      overflowY: "auto",
      border: "1px solid #f0e6e2",
      boxShadow: "0 0 20px rgba(0,0,0,0.2)"
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
      fontSize: "18px",
      fontWeight: "600",
      color: "#5d4037",
      margin: "15px 0 10px 0",
      borderBottom: "1px solid #f0e6e2",
      paddingBottom: "5px"
    },
    imagePreview: {
      maxWidth: "100%",
      maxHeight: 200,
      margin: "10px 0",
      borderRadius: 8,
      border: "1px solid #d7ccc8"
    }
  };

  useEffect(() => {
    const loadLandmarks = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/landmarks`);
        setLandmarks(response.data);
      } catch (error) {
        console.error("Error loading landmarks:", error);
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
    // Update the fetchUser function
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.log("No token found");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setCurrentUserId(response.data.user._id);
        setCurrentUserRole(response.data.user.role); // Add this line
      } catch (error) {
        console.error("Auth check failed:", error);
        await AsyncStorage.removeItem('token');
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (voteSuccess) {
      const timer = setTimeout(() => setVoteSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [voteSuccess]);

  useEffect(() => {
    if (deleteSuccess || deleteError) {
      const timer = setTimeout(() => {
        setDeleteSuccess("");
        setDeleteError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteSuccess, deleteError]);

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
        color: '#FFD700',
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
      customdata: [landmark._id],
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
          const clickedLandmark = landmarks.find(l => l._id === landmarkId);
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

  // Update the addLandmark function
  const addLandmark = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      if (!newLandmark.title.trim()) {
        alert('Please enter a landmark title');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/landmarks`, {
        title: newLandmark.title.trim(),
        lat: newLandmark.lat,
        lon: newLandmark.lon,
        color: newLandmark.color || '#8B4513',
        imageUrl: newLandmark.imageUrl || ''
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setLandmarks(prev => [...prev, response.data]);
      setShowForm(false);
      setNewLandmark({
        title: '',
        lat: 0,
        lon: 0,
        color: '#8B4513',
        imageUrl: ''
      });
    } catch (error) {
      console.error("Error adding landmark:", error);
      alert("Failed to add landmark. Please try again.");
    }
  };

  const handleLandmarkVote = async (landmarkId: string, voteType: 'yes' | 'no') => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      setIsVoting(true);
      setVoteError("");
      setVoteSuccess("");

      const user = JSON.parse(await AsyncStorage.getItem('user') || '{}');
      const currentLandmark = landmarks.find(l => l._id === landmarkId);
      const currentVote = currentLandmark?.votes.find(v => v.userId === user._id);

      const response = await axios.put(
        `${API_BASE_URL}/landmarks/${landmarkId}/vote`,
        { vote: voteType },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setLandmarks(prevLandmarks => prevLandmarks.map(landmark => {
        if (landmark._id === landmarkId) {
          return {
            ...landmark,
            votes: response.data.data.votes,
            verified: response.data.data.verified,
            _calculatedWeights: response.data.data.calculatedWeights
          };
        }
        return landmark;
      }));

      setVoteSuccess(
        currentVote 
          ? `Changed vote to ${voteType} (Weight: ${user.isSuper ? '2' : '1'})`
          : `Vote recorded! (Weight: ${user.isSuper ? '2' : '1'})`
      );

    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error("Voting error:", {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        error: axiosError.message
      });
      
      setVoteError(axiosError.response?.data?.message || 'Failed to submit vote');

      if (axiosError.response?.status === 401) {
        await AsyncStorage.multiRemove(['user', 'token']);
        router.push('/login');
      }
    } finally {
      setIsVoting(false);
    }
  };
  
  const handleDeleteLandmark = async (landmarkId: string) => {
    try {
      setDeleteError("");
      setDeleteSuccess("");
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      await axios.delete(`${API_BASE_URL}/landmarks/${landmarkId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setLandmarks(prev => prev.filter(l => l._id !== landmarkId));
      if (selectedLandmark?._id === landmarkId) {
        setSelectedLandmark(null);
      }
      
      setDeleteSuccess("Landmark deleted successfully!");
    } catch (error) {
      console.error("Error deleting landmark:", error);
      
      let errorMessage = "Failed to delete landmark";
      const axiosError = error as AxiosError<{ message?: string }>;
      
      if (axiosError.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        await AsyncStorage.multiRemove(['user', 'token']);
        router.push('/login');
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      }
      
      setDeleteError(errorMessage);
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
                  onClick={addLandmark}
                  disabled={!newLandmark.title.trim()}
                  style={{
                    ...styles.button,
                    opacity: !newLandmark.title.trim() ? 0.5 : 1
                  }}
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
                        backgroundColor: landmark.verified ? landmark.color : '#AAAAAA',
                        border: landmark.verified ? 'none' : '1px solid #999'
                      }} />
                      <div>
                        <div>{landmark.title}</div>
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

      {selectedLandmark && (
    <div style={styles.modalOverlay} onClick={() => setSelectedLandmark(null)}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h3 style={styles.title}>{selectedLandmark.title}</h3>
        <p style={{ 
          color: selectedLandmark.verified ? '#4CAF50' : '#FF9800',
          fontWeight: 'bold',
          marginBottom: '20px'
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
          <p>Latitude: {selectedLandmark.lat.toFixed(6)}</p>
          <p>Longitude: {selectedLandmark.lon.toFixed(6)}</p>
        </div>

        <div style={styles.verificationStatus}>
          <h4>Verification Status</h4>
          {(() => {
            // Calculate weights with proper type checking
            const yesWeight = selectedLandmark.votes
              .filter(v => v.vote === 'yes')
              .reduce((sum, vote) => sum + (vote.weight ?? 1), 0);

            const noWeight = selectedLandmark.votes
              .filter(v => v.vote === 'no')
              .reduce((sum, vote) => sum + (vote.weight ?? 1), 0);

            const totalWeight = yesWeight + noWeight;
            const percentageYes = totalWeight > 0 ? (yesWeight / totalWeight * 100) : 0;

            return (
              <>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '5px'
                }}>
                  <span style={{ color: "#4CAF50", fontWeight: 'bold' }}>
                    Yes: {yesWeight} ({(percentageYes).toFixed(0)}%)
                  </span>
                  <span style={{ color: "#f44336", fontWeight: 'bold' }}>
                    No: {noWeight} ({(100 - percentageYes).toFixed(0)}%)
                  </span>
                </div>
                <div style={{
                  height: '10px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '5px',
                  overflow: 'hidden',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    width: `${percentageYes}%`,
                    height: '100%',
                    backgroundColor: '#4CAF50'
                  }} />
                  <div style={{
                    width: `${100 - percentageYes}%`,
                    height: '100%',
                    backgroundColor: '#f44336'
                  }} />
                </div>
                <div style={{ textAlign: 'center', fontSize: '12px', color: '#757575' }}>
                  {selectedLandmark.votes.length} {selectedLandmark.votes.length === 1 ? 'vote' : 'votes'} • {totalWeight} total weight
                </div>
                <p style={{ marginTop: '10px', fontSize: '14px' }}>
                  Needs 5 total weight with ≥80% Yes votes to verify
                </p>
              </>
            );
          })()}
          
          {!selectedLandmark.verified && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLandmarkVote(selectedLandmark._id, 'yes');
                }}
                disabled={isVoting}
                style={{
                  ...styles.button,
                  backgroundColor: '#4CAF50',
                  flex: 1,
                  opacity: isVoting ? 0.7 : 1,
                  border: selectedLandmark.votes.find(v => v.userId === currentUserId)?.vote === 'yes' 
                    ? '3px solid gold' 
                    : 'none',
                  boxShadow: selectedLandmark.votes.find(v => v.userId === currentUserId)?.vote === 'yes'
                    ? '0 0 10px rgba(76, 175, 80, 0.7)'
                    : 'none'
                }}
              >
                {isVoting 
                  ? 'Processing...' 
                  : selectedLandmark.votes.find(v => v.userId === currentUserId)?.vote === 'yes' 
                    ? '✔ Voted Yes' 
                    : 'Vote Yes'}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLandmarkVote(selectedLandmark._id, 'no');
                }}
                disabled={isVoting}
                style={{
                  ...styles.button,
                  backgroundColor: '#f44336',
                  flex: 1,
                  opacity: isVoting ? 0.7 : 1,
                  border: selectedLandmark.votes.find(v => v.userId === currentUserId)?.vote === 'no' 
                    ? '3px solid gold' 
                    : 'none',
                  boxShadow: selectedLandmark.votes.find(v => v.userId === currentUserId)?.vote === 'no'
                    ? '0 0 10px rgba(244, 67, 54, 0.7)'
                    : 'none'
                }}
              >
                {isVoting 
                  ? 'Processing...' 
                  : selectedLandmark.votes.find(v => v.userId === currentUserId)?.vote === 'no' 
                    ? '✔ Voted No' 
                    : 'Vote No'}
              </button>
            </div>
          )}
        </div>

        {/* Success/Error messages */}
        {voteSuccess && (
          <div style={{
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid #4CAF50',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{voteSuccess}</span>
          </div>
        )}

        {voteError && (
          <div style={{
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid #f44336',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MaterialIcons name="error" size={20} color="#f44336" />
            <span style={{ color: '#f44336', fontWeight: 'bold' }}>{voteError}</span>
          </div>
        )}

        {/* Delete Success Message */}
        {deleteSuccess && (
          <div style={{
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid #4CAF50',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{deleteSuccess}</span>
          </div>
        )}

        {/* Delete Error Message */}
        {deleteError && (
          <div style={{
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid #f44336',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MaterialIcons name="error" size={20} color="#f44336" />
            <span style={{ color: '#f44336', fontWeight: 'bold' }}>{deleteError}</span>
          </div>
        )}
        {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {currentUserId && (
              <button 
                onClick={() => handleDeleteLandmark(selectedLandmark._id)}
                disabled={
                  selectedLandmark.createdBy.toString() !== currentUserId && 
                  currentUserRole !== 'admin'
                }
                style={{
                  ...styles.button,
                  backgroundColor: '#f44336',
                  opacity: (
                    selectedLandmark.createdBy.toString() !== currentUserId && 
                    currentUserRole !== 'admin'
                  ) ? 0.5 : 1
                }}
              >
                Delete Landmark
              </button>
            )}
            <button 
              onClick={() => setSelectedLandmark(null)}
              style={styles.button}
            >
              Close
            </button>
          </div>
      </div>
    </div>
  )}
    </div>
  );
};

export default LandmarkPage;