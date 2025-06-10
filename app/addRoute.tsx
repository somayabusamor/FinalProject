import React, { useEffect, useRef, useState } from "react";
import { PlotlyHTMLElement } from 'plotly.js';
import axios, { AxiosError } from 'axios';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from './AuthContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
const API_BASE_URL = 'http://localhost:8082/api'; // Should match your backend

interface Location {
  lat: number;
  lon: number;
}

interface RoutePoint {
  lat: number;
  lon: number;
}

interface Route {
  _id: string;
  title: string;
  points: RoutePoint[];
  color: string;
  verified: boolean;
  votes: {
    userId: string;
    vote: 'yes' | 'no';
    weight?: number; // Add this optional property

  }[];
}

interface VoteResponse {
  success: boolean;
  data: Route;
  message?: string;
}
// Replace your existing ErrorResponse interface with:
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
const RoutePage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [mapCenter, setMapCenter] = useState<{lat:number; lon:number} | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);
  const [tempRoutePoints, setTempRoutePoints] = useState<RoutePoint[]>([]);
  const previewMapRef = useRef<HTMLDivElement>(null);
  const [newRoute, setNewRoute] = useState<Omit<Route, '_id' | 'verified' | 'votes'>>({
    title: '',
    points: [],
    color: '#3A86FF'
  });
  const { user, token } = useAuth();
  const router = useRouter();
  const [voteError, setVoteError] = useState("");
  const [voteSuccess, setVoteSuccess] = useState("");


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
      backgroundColor: "#fff",
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
      top: "60px",
      right: 20,
      backgroundColor: "white",
      padding: 25,
      borderRadius: 12,
      border: "1px solid #f0e6e2",
      boxShadow: "0 0 20px rgba(0,0,0,0.15)",
      zIndex: 2,
      width: 350,
      maxWidth: "90%"
    },
    routesList: {
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
      maxWidth: "800px",
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
    routeItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 0",
      borderBottom: "1px solid #f0e6e2"
    },
    routeColor: {
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
    pointCard: {
      padding: "10px",
      background: "white",
      borderRadius: "8px",
      fontSize: "14px",
      border: "1px solid #f0e6e2",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
    },
      drawButton: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      backgroundColor: '#6d4c41',
      padding: '12px 16px',
      color: '#FFD700',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      transition: 'all 0.3s ease'
    },
    drawButtonActive: {
      backgroundColor: '#f44336'
    }
  };
    // Move the distance calculation functions up here
  const calculateDistance = (point1: RoutePoint, point2: RoutePoint) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = point1.lat * Math.PI/180;
    const φ2 = point2.lat * Math.PI/180;
    const Δφ = (point2.lat-point1.lat) * Math.PI/180;
    const Δλ = (point2.lon-point1.lon) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const calculateTotalDistance = (points: RoutePoint[]) => {
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      total += calculateDistance(points[i], points[i+1]);
    }
    return total;
  };

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/routes`);
        setRoutes(response.data);
      } catch (error) {
        console.error("Backend connection failed:", error);
        alert("Could not connect to server. Please check if backend is running.");
        setRoutes([]);
      } finally {
        setIsMapLoading(false);
      }
    };

    loadRoutes();
  }, []);

  useEffect(() => {
    renderMap();
  }, [routes, isDrawingRoute, tempRoutePoints]);
  // Get real user ID after login
    // Replace your current useEffect for fetching user with this:
  useEffect(() => {
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
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear invalid token
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

  // Get user location
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
    const mapElement = mapRef.current;
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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingRoute || !mapRef.current || !mapCenter) return;
    setIsDrawing(true);
    addRoutePoint(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingRoute || !isDrawing || !mapRef.current || !mapCenter) return;
    addRoutePoint(e);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };
const addRoutePoint = (e: React.MouseEvent<HTMLDivElement>) => {
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

  setTempRoutePoints(prev => [...prev, { lat: latClamped, lon }]);
};

const saveRoute = async () => {
  try {
    // Validate before sending
    if (tempRoutePoints.length < 2) {
      alert('Route must have at least 2 points');
      return;
    }

    if (!newRoute.title.trim()) {
      alert('Please enter a route title');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userString = await AsyncStorage.getItem('user');
    if (!userString) {
      throw new Error('User data not found');
    }

    const user = JSON.parse(userString);
    
    const response = await axios.post(`${API_BASE_URL}/routes`, {
      title: newRoute.title.trim(),
      points: tempRoutePoints,
      color: newRoute.color || '#3A86FF',
      createdBy: user._id
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000 // 10 second timeout
    });

    // Rest of your success handling...
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    console.error("Save failed:", error);
    
    let errorMessage = 'Failed to save route';
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out';
    } else if (error.response) {
      // Handle specific status codes
      if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid request data';
      } else if (error.response.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        await AsyncStorage.multiRemove(['user', 'token']);
        router.push('/login');
      } else if (error.response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    }
    
    alert(`Save failed: ${errorMessage}`);
  }
};
const handleRouteVote = async (routeId: string, voteType: 'yes' | 'no') => {
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
    const currentRoute = routes.find(r => r._id === routeId);
    const currentVote = currentRoute?.votes.find(v => v.userId === user._id);

    const response = await axios.put(
      `${API_BASE_URL}/routes/${routeId}/vote`,
      { vote: voteType },
      {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    setRoutes(prevRoutes => prevRoutes.map(route => {
      if (route._id === routeId) {
        return {
          ...route,
          votes: response.data.data.votes,
          verified: response.data.data.verified,
          _calculatedWeights: response.data.data.calculatedWeights
        };
      }
      return route;
    }));

    setVoteSuccess(
      currentVote 
        ? `Changed vote to ${voteType} (Weight: ${user.isSuperlocal ? '2' : '1'})`
        : `Vote recorded! (Weight: ${user.isSuperlocal ? '2' : '1'})`
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
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");
  useEffect(() => {
      if (deleteSuccess || deleteError) {
        const timer = setTimeout(() => {
          setDeleteSuccess("");
          setDeleteError("");
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [deleteSuccess, deleteError]);
    
  const handleDeleteRoute = async (routeId: string) => {
    try {
      setDeleteError(""); // Clear previous errors
      setDeleteSuccess(""); // Clear previous success
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      await axios.delete(`${API_BASE_URL}/routes/${routeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setRoutes(prev => prev.filter(r => r._id !== routeId));
      if (selectedRoute?._id === routeId) {
        setSelectedRoute(null);
      }
      
      setDeleteSuccess("Route deleted successfully!");
    } catch (error) {
      console.error("Error deleting route:", error);
      
      let errorMessage = "Failed to delete route";
      const axiosError = error as AxiosError<{ message?: string }>;
      
      if (axiosError.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        await AsyncStorage.multiRemove(['user', 'token']);
        router.push('/login');
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      }
      
      setDeleteError(errorMessage);
    } finally {
      // Auto-clear messages after 3 seconds
      setTimeout(() => {
        setDeleteSuccess("");
        setDeleteError("");
      }, 3000);
    }
  };
    // Add this useEffect to render the preview map when a route is selected
      useEffect(() => {
        if (selectedRoute && previewMapRef.current) {
          window.Plotly.newPlot(
            previewMapRef.current,
            [{
              type: "scattermapbox",
              lat: selectedRoute.points.map(p => p.lat),
              lon: selectedRoute.points.map(p => p.lon),
              mode: "lines+markers",
              line: { color: selectedRoute.color, width: 3 },
              marker: { size: 6, color: selectedRoute.color }
            }],
            {
              mapbox: { 
                style: "open-street-map", 
                center: {
                  lat: selectedRoute.points[0].lat,
                  lon: selectedRoute.points[0].lon
                },
                zoom: 12 
              },
              margin: { t: 0, b: 0, l: 0, r: 0 },
              showlegend: false
            }
          );
        }
      }, [selectedRoute]);

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

    const routeTraces = routes.map(route => ({
      type: "scattermapbox",
      lat: route.points.map(p => p.lat),
      lon: route.points.map(p => p.lon),
      text: [route.title + (route.verified ? '' : ' (Pending)')],
      mode: "lines+markers",
      line: {
        color: route.verified ? route.color : '#AAAAAA',
        width: 3
      },
      marker: {
        size: 6,
        color: route.verified ? route.color : '#AAAAAA',
        symbol: 'circle'
      },
      name: route.title,
      customdata: [route._id],
      hoverinfo: "text"
    }));

    const drawingRouteTrace = isDrawingRoute && tempRoutePoints.length > 0 ? {
      type: "scattermapbox",
      lat: tempRoutePoints.map(p => p.lat),
      lon: tempRoutePoints.map(p => p.lon),
      text: ["Drawing route..."],
      mode: "lines+markers",
      line: {
        color: newRoute.color,
        width: 4
      },
      marker: {
        size: 6,
        color: newRoute.color,
        symbol: 'circle'
      },
      name: "Drawing Route",
      hoverinfo: "none"
    } : null;

    const layout = {
      mapbox: {
        style: "open-street-map",
        center: mapCenter || { lat: location.lat, lon: location.lon },
        zoom: mapZoom,
      },
      margin: { t: 0, b: 0, l: 0, r: 0 },
      showlegend: false
    };

    const traces = [userLocationTrace, ...routeTraces];
    if (drawingRouteTrace) traces.push(drawingRouteTrace);

    window.Plotly.react(
      mapRef.current,
      traces,
      layout
    ).then(() => {
      const plotElement = mapRef.current as unknown as PlotlyHTMLElement;
      
      plotElement.on('plotly_click', (data: any) => {
        const point = data.points[0];
        if (!point) return;

        if (point.customdata) {
          const routeId = point.customdata;
          const clickedRoute = routes.find(r => r._id === routeId);
          if (clickedRoute) setSelectedRoute(clickedRoute);
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

  return (
    <div style={styles.container}>
      {isMapLoading ? (
        <div style={styles.loadingContainer}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              border: "6px solid #f3f3f3",
              borderTop: "6px solid #6d4c41",
              borderRadius: "50%",
              width: 48,
              height: 48,
              animation: "spin 1s linear infinite"
            }} />
            <span style={{ marginTop: 16, color: "#6d4c41", fontWeight: "bold" }}>Loading...</span>
            <style>
              {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
            </style>
          </div>
        </div>
      ) : (
        <>
          <div
            ref={mapRef}
            onMouseDown={isDrawingRoute ? handleMouseDown : undefined}
            onMouseMove={isDrawingRoute ? handleMouseMove : undefined}
            onMouseUp={isDrawingRoute ? handleMouseUp : undefined}
            style={styles.mapContainer}
          />

          {/* Draw Route Button */}
          <button 
            onClick={() => setIsDrawingRoute(!isDrawingRoute)}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 1000,
              padding: '12px 16px',
              backgroundColor: isDrawingRoute ? '#f44336' : '#6d4c41',
              color: '#FFD700',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            
            <MaterialIcons 
              name={isDrawingRoute ? 'close' : 'edit'} 
              size={20} 
              color="#FFD700" 
            />
            {isDrawingRoute ? 'Cancel Drawing' : 'Draw Route'}
          </button>

        {isDrawingRoute && (
          <div style={{
            ...styles.formContainer,
            top: '60px',  // Positioned below the button
            right: 20,    // Aligned with button
            left: 'auto', // Override previous left positioning
            transform: 'none', // Remove previous transform
            width: '300px'
          }}>
            <h3>Drawing Route</h3>
            <p>Click and drag to draw your route</p>
            <p>Points: {tempRoutePoints.length}</p>
            
            <input
              type="text"
              placeholder="Route title"
              value={newRoute.title}
              onChange={(e) => setNewRoute({...newRoute, title: e.target.value})}
              style={styles.input}
            />
            
            <div style={styles.buttonGroup}>
              <button 
                onClick={saveRoute}
                disabled={tempRoutePoints.length < 2 || !newRoute.title.trim()}
                style={{
                  ...styles.button,
                  opacity: (tempRoutePoints.length < 2 || !newRoute.title.trim()) ? 0.5 : 1
                }}
              >
                Save Route
              </button>
              <button 
                onClick={() => {
                  setIsDrawingRoute(false);
                  setTempRoutePoints([]);
                  setNewRoute({
                    title: '',
                    points: [],
                    color: '#3A86FF'
                  });
                }}
                style={styles.buttonSecondary}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {routes.length > 0 && (
          <div style={styles.routesList}>
            <h4>Routes ({routes.length})</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {routes.map(route => (
                <li 
                  key={route._id}
                  style={styles.routeItem}
                  onClick={() => setSelectedRoute(route)}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{
                      ...styles.routeColor,
                      backgroundColor: route.verified ? route.color : '#AAAAAA',
                      border: route.verified ? 'none' : '1px solid #999'
                    }} />
                    <div>
                      <div>{route.title}</div>
                      <div style={styles.verificationBadge}>
                        {route.verified ? 'Verified' : 'Pending'} ({route.points.length} points)
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={styles.header}>
          <h3>Routes Map</h3>
          <p>Click "Draw Route" to create a new route</p>
        </div>
      </>
    )}

              {selectedRoute && (
              <div style={styles.modalOverlay} onClick={() => setSelectedRoute(null)}>
                <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                  <h3 style={styles.title}>{selectedRoute.title}</h3>
                  <p style={{ 
                    color: selectedRoute.verified ? '#4CAF50' : '#FF9800',
                    fontWeight: 'bold',
                    marginBottom: '20px'
                  }}>
                    {selectedRoute.verified ? '✅ Verified Route' : '🕒 Pending Verification'}
                  </p>
          
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            {/* Mini Map Preview */}
            <div style={{ flex: 1, height: '300px' }}>
              <div 
                ref={previewMapRef} 
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            
            {/* Route Summary */}
            <div style={{ flex: 1 }}>
              <h4 style={styles.subtitle}>Route Summary</h4>
              <div style={styles.verificationStatus}>
                <div><strong>Total Points:</strong> {selectedRoute.points.length}</div>
                <div>
                  <strong>Distance:</strong> {
                    calculateTotalDistance(selectedRoute.points) > 1000 
                      ? `${(calculateTotalDistance(selectedRoute.points)/1000).toFixed(2)} km` 
                      : `${calculateTotalDistance(selectedRoute.points).toFixed(0)} meters`
                  }
                </div>
                <div><strong>Start Point:</strong> 
                  <br />Lat: {selectedRoute.points[0].lat.toFixed(6)}
                  <br />Lon: {selectedRoute.points[0].lon.toFixed(6)}
                </div>
                <div><strong>End Point:</strong> 
                  <br />Lat: {selectedRoute.points[selectedRoute.points.length-1].lat.toFixed(6)}
                  <br />Lon: {selectedRoute.points[selectedRoute.points.length-1].lon.toFixed(6)}
                </div>
              </div>

              {!selectedRoute.verified && (
                <div style={{ marginTop: '15px' }}>
                  <h4 style={styles.subtitle}>Verification Status</h4>
                  
                  {/* Replace the existing weight calculation with this */}
                  {(() => {
                    // Calculate weights with proper type checking
                    const yesWeight = selectedRoute.votes
                      .filter(v => v.vote === 'yes')
                      .reduce((sum, vote) => sum + (vote.weight || 1), 0);

                    const noWeight = selectedRoute.votes
                      .filter(v => v.vote === 'no')
                      .reduce((sum, vote) => sum + (vote.weight || 1), 0);

                    const totalVotes = selectedRoute.votes.length;
                    const totalWeight = yesWeight + noWeight;

                    return (
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          marginBottom: '5px'
                        }}>
                          <span style={{ color: "#4CAF50", fontWeight: 'bold' }}>
                            Yes: {yesWeight} ({(yesWeight/totalWeight*100).toFixed(0)}%)
                          </span>
                          <span style={{ color: "#f44336", fontWeight: 'bold' }}>
                            No: {noWeight} ({(noWeight/totalWeight*100).toFixed(0)}%)
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
                            width: `${(yesWeight/totalWeight*100)}%`,
                            height: '100%',
                            backgroundColor: '#4CAF50',
                            float: 'left'
                          }} />
                          <div style={{
                            width: `${(noWeight/totalWeight*100)}%`,
                            height: '100%',
                            backgroundColor: '#f44336',
                            float: 'left'
                          }} />
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '12px', color: '#757575' }}>
                          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} • {totalWeight} total weight
                        </div>
                      </div>
                    );
                  })()}

                  {/* Success/Error messages remain the same */}
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
                  {/* Voting buttons remain the same */}
                  {(() => {
                    // Find the current user's vote for this route
                    const userId = currentUserId;
                    const currentVote = selectedRoute.votes.find(v => v.userId === userId);
                    return (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleRouteVote(selectedRoute._id, 'yes')}
                          disabled={isVoting}
                          style={{
                            ...styles.button,
                            backgroundColor: '#4CAF50',
                            flex: 1,
                            opacity: isVoting ? 0.7 : 1,
                            border: currentVote?.vote === 'yes' ? '3px solid gold' : 'none'
                          }}
                        >
                          {isVoting 
                            ? 'Processing...' 
                            : currentVote?.vote === 'yes' 
                              ? '✔ Voted Yes' 
                              : 'Vote Yes'}
                        </button>
                        <button
                          onClick={() => handleRouteVote(selectedRoute._id, 'no')}
                          disabled={isVoting}
                          style={{
                            ...styles.button,
                            backgroundColor: '#f44336',
                            flex: 1,
                            opacity: isVoting ? 0.7 : 1,
                            border: currentVote?.vote === 'no' ? '3px solid gold' : 'none'
                          }}
                        >
                          {isVoting 
                            ? 'Processing...' 
                            : currentVote?.vote === 'no' 
                              ? '✔ Voted No' 
                              : 'Vote No'}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Route Points with Search */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={styles.subtitle}>Route Points</h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '10px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  padding: '10px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px'
                }}>
                  {selectedRoute.points.map((point, index) => (
                    <div key={index} style={{ 
                      padding: '10px', 
                      background: 'white', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      border: '1px solid #f0e6e2'
                    }}>
                      <div><strong>Point {index + 1}</strong></div>
                      <div>Lat: {point.lat.toFixed(6)}</div>
                      <div>Lon: {point.lon.toFixed(6)}</div>
                    </div>
                  ))}
                </div>
              </div>

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
                <button 
                  onClick={() => handleDeleteRoute(selectedRoute._id)}
                  style={{
                    ...styles.button,
                    backgroundColor: '#f44336',
                  }}
                >
                  Delete Route
                </button>
                <button 
                  onClick={() => setSelectedRoute(null)}
                  style={styles.button}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default RoutePage;