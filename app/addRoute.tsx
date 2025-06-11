import React, { useEffect, useRef, useState } from "react";
import { PlotlyHTMLElement } from 'plotly.js';
import axios, { AxiosError } from 'axios';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from './AuthContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import mongoose from "mongoose";
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
  points: { lat: number; lon: number }[];
  color: string;
  verified: boolean;
  status: 'pending' | 'verified' | 'rejected' | 'disputed';
  votes: RouteVote[];
  verificationData?: VerificationData;
  createdBy: mongoose.Types.ObjectId | string;
  _calculatedWeights?: {
    totalWeight: number;
    yesWeight: number;
    noWeight: number;
  };
}
interface VerificationData {
  totalWeight: number;
  yesWeight: number;
  noWeight: number;
  confidenceScore: number;
}
interface RouteVote {
  userId: string;
  vote: 'yes' | 'no';
  weight: number;
  timestamp?: Date;
}
interface RouteVoteResponse {
  success: boolean;
  data: Route;
  message?: string;
  userWeight?: number;
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
    color: '#3A86FF',
    status: 'pending',
    createdBy: ''
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
  // Add this helper function to get user weight
const getUserWeight = (user: any): number => {
  if (!user) return 1;

  // Super local users get 4x weight
  if (user.isSuperlocal) return 4;

  // Users with high reputation get 2x weight
  if (user.reputationScore && user.reputationScore >= 70) return 2;

  // Default weight
  return 1;
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
      setTimeout(() => {
    setIsMapLoading(false);
  }, 1000); // adjust based on actual loading
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

  // No need to access plotElement.layout as it's not used here
  // Calculate longitude and latitude properly
  const lon = mapCenter.lon + ((x - bounds.width/2) / (bounds.width/2)) * (180 / Math.pow(2, mapZoom));
  const lat = mapCenter.lat - ((y - bounds.height/2) / (bounds.height/2)) * (180 / Math.pow(2, mapZoom));

  // Clamp latitude to valid map bounds
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

    const response = await axios.post(`${API_BASE_URL}/routes`, {
      title: newRoute.title.trim(),
      points: tempRoutePoints,
      color: newRoute.color || '#3A86FF'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Add the new route to the list
    setRoutes(prev => [...prev, response.data.data]);
    
    // Reset drawing state
    setIsDrawingRoute(false);
    setTempRoutePoints([]);
    setNewRoute({
      title: '',
      points: [],
      color: '#3A86FF',
      status: 'pending',
      createdBy: ''
    });
    
    alert('Route saved successfully!');
  } catch (error) {
    console.error("Save failed:", error);
    alert('Failed to save route. Please try again.');
  }
};
// Update your handleRouteVote function to use weights
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
    // Add validation before sending
        if (!routeId || !voteType) {
          throw new Error('Invalid vote parameters');
        }

    const response = await axios.put<RouteVoteResponse>(
      `${API_BASE_URL}/routes/${routeId}/vote`,
      { vote: voteType },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    // Update the routes state with the new vote data
    setRoutes(prevRoutes => prevRoutes.map(route => {
      if (route._id === routeId) {
        return {
          ...route,
          votes: response.data.data.votes,
          verified: response.data.data.verified,
          verificationData: response.data.data.verificationData,
          _calculatedWeights: response.data.data._calculatedWeights
        };
      }
      return route;
    }));

    // Use the weight from the response or fallback to calculated weight
    const weight = response.data.userWeight ?? getUserWeight(user);
    setVoteSuccess(
      currentVote
        ? `Changed vote to ${voteType} (Weight: ${weight}x)`
        : `Vote recorded! (Weight: ${weight}x)`
    );

  } catch (error: any) {
    let errorMessage = "Failed to submit vote";

    if (error.response) {
      console.error("Server response error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });

      errorMessage = error.response.data?.error ||
                    error.response.data?.message ||
                    `Server error (${error.response.status})`;
    } else if (error.request) {
      console.error("No response received:", error.request);
      errorMessage = "No response from server";
    } else {
      console.error("Request setup error:", error.message);
      errorMessage = error.message;
    }

    setVoteError(errorMessage);

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
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
          zoom: 12,
          projection: {
            type: 'mercator'
          }
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
      projection: {
        type: 'mercator'  // Ensure we're using proper projection
      }
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
        {/* Loading spinner */}
      </div>
    ) : (
      <>
        <div
          ref={mapRef}
          onMouseDown={isDrawingRoute ? handleMouseDown : undefined}
          onMouseMove={isDrawingRoute && isDrawing ? handleMouseMove : undefined}
          onMouseUp={isDrawingRoute ? handleMouseUp : undefined}
          onMouseLeave={isDrawingRoute ? handleMouseUp : undefined}
          style={{
            ...styles.mapContainer,
            cursor: isDrawingRoute ? 'crosshair' : 'grab'
          }}
        />

        {/* Combined Header with Draw Route Button */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '15px',
          borderRadius: '12px',
          border: '1px solid #f0e6e2',
          zIndex: 1,
          userSelect: 'none'
        }}>
          <div>
            <h3 style={{ margin: 0 }}>Routes Map</h3>
            <p style={{ margin: '5px 0 0 0' }}>Click "Draw Route" to create a new route</p>
          </div>
          
          <button 
            onClick={() => setIsDrawingRoute(!isDrawingRoute)}
            style={{
              backgroundColor: isDrawingRoute ? '#f44336' : '#6d4c41',
              color: '#FFD700',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              minWidth: '150px',
              justifyContent: 'center'
            }}
          >
            <MaterialIcons 
              name={isDrawingRoute ? 'close' : 'edit'} 
              size={20} 
              color="#FFD700" 
            />
            {isDrawingRoute ? 'Cancel Drawing' : 'Draw Route'}
          </button>
        </div>

        {isDrawingRoute && (
          <div style={{
            ...styles.formContainer,
            top: '80px',
            right: 20,
            left: 'auto',
            transform: 'none',
            width: '320px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: 0 }}>Drawing Route</h3>
              <MaterialIcons 
                name="close" 
                size={24} 
                color="#6d4c41" 
                onClick={() => {
                  setIsDrawingRoute(false);
                  setTempRoutePoints([]);
                  setNewRoute({
                    title: '',
                    points: [],
                    color: '#3A86FF',
                    status: 'pending',
                    createdBy: ''
                  });
                }}
                style={{ cursor: 'pointer' }}
              />
            </div>

            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <p style={{ margin: '5px 0' }}>
                <MaterialIcons name="info" size={16} color="#6d4c41" /> 
                <span style={{ marginLeft: '8px' }}>Click and drag to draw</span>
              </p>
              <p style={{ 
                margin: '5px 0',
                fontWeight: 'bold',
                color: tempRoutePoints.length < 2 ? '#f44336' : '#4CAF50'
              }}>
                Points: {tempRoutePoints.length} {tempRoutePoints.length < 2 && '(Need at least 2)'}
              </p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="route-title" style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#5d4037'
              }}>
                Route Title
              </label>
              <input
                id="route-title"
                type="text"
                placeholder="Enter route name"
                value={newRoute.title}
                onChange={(e) => setNewRoute({...newRoute, title: e.target.value})}
                style={{
                  ...styles.input,
                  borderColor: !newRoute.title.trim() ? '#f44336' : '#d7ccc8'
                }}
              />
              {!newRoute.title.trim() && (
                <p style={{ color: '#f44336', fontSize: '12px', margin: '5px 0 0 0' }}>
                  Please enter a route title
                </p>
              )}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#5d4037'
              }}>
                Route Color
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['#3A86FF', '#4CAF50', '#FF9800', '#9C27B0', '#F44336'].map(color => (
                  <div 
                    key={color}
                    onClick={() => setNewRoute({...newRoute, color})}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: newRoute.color === color ? '3px solid #6d4c41' : '2px solid #d7ccc8',
                      cursor: 'pointer'
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={newRoute.color}
                  onChange={(e) => setNewRoute({...newRoute, color: e.target.value})}
                  style={{
                    width: '30px',
                    height: '30px',
                    padding: 0,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button 
                onClick={() => setTempRoutePoints([])}
                disabled={tempRoutePoints.length === 0}
                style={{
                  ...styles.buttonSecondary,
                  opacity: tempRoutePoints.length === 0 ? 0.5 : 1,
                  flex: 1
                }}
              >
                <MaterialIcons 
                  name="delete" 
                  size={18} 
                  style={{ marginRight: 8 }}
                />
                Clear
              </button>
              <button 
                onClick={saveRoute}
                disabled={tempRoutePoints.length < 2 || !newRoute.title.trim()}
                style={{
                  ...styles.button,
                  opacity: (tempRoutePoints.length < 2 || !newRoute.title.trim()) ? 0.5 : 1,
                  flex: 2
                }}
              >
                <MaterialIcons 
                  name="save" 
                  size={18} 
                  style={{ marginRight: 8 }}
                />
                Save Route
              </button>
            </div>

            {tempRoutePoints.length > 1 && (
              <div style={{ 
                marginTop: '15px',
                backgroundColor: '#f5f5f5',
                padding: '10px',
                borderRadius: '8px'
              }}>
                <p style={{ margin: '5px 0', fontWeight: '600' }}>
                  Route Preview
                </p>
                <p style={{ margin: '5px 0' }}>
                  Distance: {calculateTotalDistance(tempRoutePoints) > 1000 
                    ? `${(calculateTotalDistance(tempRoutePoints)/1000).toFixed(2)} km` 
                    : `${calculateTotalDistance(tempRoutePoints).toFixed(0)} meters`}
                </p>
              </div>
            )}
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

                  {/* Verification progress with weights */}
                  {(() => {
                    const yesWeight = selectedRoute.verificationData?.yesWeight || 
                      selectedRoute.votes
                        .filter(v => v.vote === 'yes')
                        .reduce((sum, vote) => sum + (vote.weight || 1), 0);

                    const noWeight = selectedRoute.verificationData?.noWeight || 
                      selectedRoute.votes
                        .filter(v => v.vote === 'no')
                        .reduce((sum, vote) => sum + (vote.weight || 1), 0);

                    const totalWeight = selectedRoute.verificationData?.totalWeight || 
                      (yesWeight + noWeight);

                    const percentageYes = totalWeight > 0 ? (yesWeight / totalWeight * 100) : 0;
                    const requiredWeight = 5 + (0.2 * selectedRoute.votes.length);
                    const confidenceScore = selectedRoute.verificationData?.confidenceScore || 
                      Math.min(100,
                        (Math.min(1, totalWeight / (requiredWeight * 1.5)) * 50) +
                        ((yesWeight / Math.max(1, totalWeight)) * 50)
                      );

                    const currentUserVote = selectedRoute.votes.find(v => v.userId === currentUserId);
                    const userWeight = currentUserVote?.weight || 0;

                    return (
                      <>
                        {/* Confidence Meter */}
                        <div style={{ marginBottom: '15px' }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '5px'
                          }}>
                            <span>Confidence Score:</span>
                            <span style={{
                              fontWeight: 'bold',
                              color: confidenceScore > 75 ? '#4CAF50' :
                                    confidenceScore > 50 ? '#FF9800' : '#f44336'
                            }}>
                              {Math.round(confidenceScore)}%
                            </span>
                          </div>
                          <div style={{
                            height: '8px',
                            backgroundColor: '#e0e0e0',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${confidenceScore}%`,
                              height: '100%',
                              backgroundColor: confidenceScore > 75 ? '#4CAF50' :
                                                confidenceScore > 50 ? '#FF9800' : '#f44336'
                            }} />
                          </div>
                        </div>

                        {/* Vote Breakdown */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '5px'
                        }}>
                          <span style={{ color: "#4CAF50", fontWeight: 'bold' }}>
                            Yes: {yesWeight.toFixed(1)} ({(percentageYes).toFixed(0)}%)
                          </span>
                          <span style={{ color: "#f44336", fontWeight: 'bold' }}>
                            No: {noWeight.toFixed(1)} ({(100 - percentageYes).toFixed(0)}%)
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
                        </div>

                        {/* Weight Information */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '10px',
                          marginBottom: '15px'
                        }}>
                          <div>
                            <div style={{ fontSize: '12px', color: '#757575' }}>Total Weight</div>
                            <div style={{ fontWeight: 'bold' }}>{totalWeight.toFixed(1)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: '#757575' }}>Required</div>
                            <div style={{ fontWeight: 'bold' }}>{requiredWeight.toFixed(1)}</div>
                          </div>
                        </div>

                        {/* User Weight */}
                        {currentUserId && (
                          <div style={{
                            backgroundColor: '#f5f5f5',
                            padding: '10px',
                            borderRadius: '8px',
                            marginBottom: '15px',
                            border: '1px solid #e0e0e0'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span>Your Voting Power:</span>
                              <span style={{
                                fontWeight: 'bold',
                                color: userWeight >= 4 ? '#4CAF50' :
                                      userWeight >= 2 ? '#FF9800' : '#757575'
                              }}>
                                {userWeight.toFixed(1)}x
                              </span>
                            </div>
                            {userWeight > 1 && (
                              <div style={{
                                fontSize: '12px',
                                color: '#757575',
                                marginTop: '5px'
                              }}>
                                {userWeight >= 4 ? 'Super Local' :
                                userWeight >= 2 ? 'Verified Contributor' : ''}
                              </div>
                            )}
                            {currentUserVote && (
                              <div style={{
                                fontSize: '12px',
                                color: '#757575',
                                marginTop: '5px'
                              }}>
                                You voted {currentUserVote.vote} (weight: {currentUserVote.weight.toFixed(1)})
                              </div>
                            )}
                          </div>
                        )}
                      </>
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
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleRouteVote(selectedRoute._id, 'yes')}
                      disabled={isVoting}
                      style={{
                        ...styles.button,
                        backgroundColor: '#4CAF50',
                        flex: 1,
                        opacity: isVoting ? 0.7 : 1,
                        border: selectedRoute.votes.find(v => v.userId === currentUserId)?.vote === 'yes' ? '3px solid gold' : 'none'
                      }}
                    >
                      {isVoting
                        ? 'Processing...'
                        : selectedRoute.votes.find(v => v.userId === currentUserId)?.vote === 'yes'
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
                        border: selectedRoute.votes.find(v => v.userId === currentUserId)?.vote === 'no' ? '3px solid gold' : 'none'
                      }}
                    >
                      {isVoting
                        ? 'Processing...'
                        : selectedRoute.votes.find(v => v.userId === currentUserId)?.vote === 'no'
                          ? '✔ Voted No'
                          : 'Vote No'}
                    </button>
                  </div>
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