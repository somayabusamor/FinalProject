import React, { useEffect, useRef, useState } from "react";
import { PlotlyHTMLElement } from 'plotly.js';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import mongoose from 'mongoose';

const API_BASE_URL = 'http://localhost:8082/api';

// Types
interface Location {
  lat: number;
  lon: number;
}

interface VerificationData {
  totalWeight: number;
  yesWeight: number;
  noWeight: number;
  confidenceScore: number;
}

interface Vote {
  userId: string;
  vote: 'yes' | 'no';
  weight: number;
  timestamp?: Date;
}

interface Landmark {
  _id: string;
  title: string;
  description: string;  // Add this line
  lat: number;
  lon: number;
  color: string;
  imageUrl: string;
  verified: boolean;
  status: 'pending' | 'verified' | 'rejected' | 'disputed';
  votes: Vote[];
  verificationData?: VerificationData;
  createdBy: mongoose.Types.ObjectId | string;
  _calculatedWeights?: {
    totalWeight: number;
    yesWeight: number;
    noWeight: number;
  };
}

interface User {
  _id: string;
  isSuperlocallocal?: boolean;
  reputationScore?: number;
  role?: string;
  verifiedLandmarksAdded?: number; // Add this
  getVoteWeight?: () => number; // Add this if you want to use the method
}

interface VoteResponse {
  success: boolean;
  data: Landmark;
  message?: string;
  userWeight?: number; // Add this
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

// Components
const LandmarkListItem: React.FC<{
  landmark: Landmark;
  onClick: () => void;
  isSelected: boolean;
}> = ({ landmark, onClick, isSelected }) => {
  return (
    <li 
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 15px",
        borderBottom: "1px solid #f0e6e2",
        cursor: "pointer",
        backgroundColor: isSelected ? '#f5f5f5' : 'white',
        borderLeft: isSelected ? '4px solid #6d4c41' : 'none',
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", width: '100%' }}>
        <div style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          marginRight: 12,
          flexShrink: 0,
          backgroundColor: landmark.verified ? landmark.color : '#AAAAAA',
          border: landmark.verified ? 'none' : '1px solid #999'
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
            {landmark.title}
          </div>
          <div style={{
            fontSize: 12,
            color: "#8d6e63",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            marginTop: 4
          }}>
            {landmark.verified ? (
              <>
                <MaterialIcons name="verified" size={14} color="#4CAF50" />
                <span style={{ marginLeft: 4 }}>Verified</span>
              </>
            ) : (
              <>
                <MaterialIcons name="schedule" size={14} color="#FF9800" />
                <span style={{ marginLeft: 4 }}>Pending</span>
              </>
            )}
          </div>
        </div>
        {isSelected && (
          <MaterialIcons name="chevron-right" size={20} color="#6d4c41" />
        )}
      </div>
    </li>
  );
};
// Add this helper function to get user weight
// Helper function to get user weight
const getUserWeight = (user: User | null): number => {
  if (!user) return 1;
  
  // Super local users get 4x weight
  if (user.isSuperlocallocal) return 4;
  
  // Users who added verified landmarks get 2x weight
  if (user.verifiedLandmarksAdded && user.verifiedLandmarksAdded > 0) return 2;
  
  // Users with high reputation get 2x weight
  if (user.reputationScore && user.reputationScore >= 70) return 2;
  
  // Default weight
  return 1;
};

const LandmarkModal: React.FC<{
  landmark: Landmark;
  currentUser: User | null;
  onClose: () => void;
  onVote: (landmarkId: string, voteType: 'yes' | 'no') => void;
  onDelete: (landmarkId: string) => void;
  isVoting: boolean;
  voteSuccess: string;
  voteError: string;
  deleteSuccess: string;
  deleteError: string;
}> = ({
  landmark,
  currentUser,
  onClose,
  onVote,
  onDelete,
  isVoting,
  voteSuccess,
  voteError,
  deleteSuccess,
  deleteError
}) => {
  // Calculate verification data
  const yesWeight = landmark.verificationData?.yesWeight || 
    landmark.votes
      .filter(v => v.vote === 'yes')
      .reduce((sum, vote) => sum + (vote.weight || 1), 0);

  const noWeight = landmark.verificationData?.noWeight || 
    landmark.votes
      .filter(v => v.vote === 'no')
      .reduce((sum, vote) => sum + (vote.weight || 1), 0);

  const totalWeight = landmark.verificationData?.totalWeight || 
    (yesWeight + noWeight);
    
  const percentageYes = totalWeight > 0 ? (yesWeight / totalWeight * 100) : 0;
  const requiredWeight = 5 + (0.2 * landmark.votes.length);
  const confidenceScore = landmark.verificationData?.confidenceScore || 
    Math.min(100, 
      (Math.min(1, totalWeight / (requiredWeight * 1.5)) * 50) +
      ((yesWeight / Math.max(1, totalWeight)) * 50)
    );

  const currentUserVote = landmark.votes.find(v => v.userId === currentUser?._id);
  const userWeight = currentUserVote?.weight || 0; // Default to 0 if no vote yet

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid #f0e6e2',
        boxShadow: '0 0 20px rgba(0,0,0,0.2)'
      }} onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '10px'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#6d4c41',
            margin: 0
          }}>{landmark.title}</h3>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            marginLeft: '10px'
          }}>
            <MaterialIcons name="close" size={24} color="#6d4c41" />
          </button>
        </div>

        {/* Status Badge */}
        <p style={{ 
          color: landmark.verified ? '#4CAF50' : '#FF9800',
          fontWeight: 'bold',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {landmark.verified ? (
            <>
              <MaterialIcons name="verified" size={20} color="#4CAF50" />
              Verified Landmark
            </>
          ) : (
            <>
              <MaterialIcons name="schedule" size={20} color="#FF9800" />
              Pending Verification
              {landmark.status === 'disputed' && ' (Needs Tribal Review)'}
            </>
          )}
        </p>
        
        {/* Image Preview */}
        {landmark.imageUrl && (
          <img 
            src={landmark.imageUrl} 
            style={{
              width: '100%',
              maxHeight: '200px',
              objectFit: 'cover',
              borderRadius: '8px',
              margin: '10px 0',
              border: '1px solid #d7ccc8'
            }}
            alt={landmark.title}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        {/* Coordinates Section */}
        <div style={{ margin: "20px 0" }}>
          <h4 style={{
            fontSize: '18px',
            fontWeight: "600",
            color: "#5d4037",
            margin: "0 0 15px 0",
            borderBottom: "1px solid #f0e6e2",
            paddingBottom: "5px"
          }}>Coordinates</h4>
          <div style={{
            display: 'flex',
            gap: '20px',
            marginTop: '10px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <MaterialIcons name="place" size={18} color="#8d6e63" />
              <div>
                <div style={{ fontSize: '12px', color: '#757575' }}>Latitude</div>
                <div style={{ fontWeight: '500' }}>{landmark.lat.toFixed(6)}</div>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <MaterialIcons name="place" size={18} color="#8d6e63" />
              <div>
                <div style={{ fontSize: '12px', color: '#757575' }}>Longitude</div>
                <div style={{ fontWeight: '500' }}>{landmark.lon.toFixed(6)}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Add this section to display the description */}
        {landmark.description && (
          <div style={{ margin: "20px 0" }}>
            <h4 style={{
              fontSize: '18px',
              fontWeight: "600",
              color: "#5d4037",
              margin: "0 0 15px 0",
              borderBottom: "1px solid #f0e6e2",
              paddingBottom: "5px"
            }}>Description</h4>
            <p style={{ margin: 0, lineHeight: 1.5 }}>{landmark.description}</p>
          </div>
        )}
        {/* Verification Status Section */}
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '8px',
          margin: '20px 0',
          border: '1px solid #f0e6e2'
        }}>
          <h4 style={{
            margin: '0 0 15px 0',
            fontSize: '16px'
          }}>Verification Status</h4>
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
          {currentUser && (
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
        </div>

        {/* Vote Buttons */}
        {!landmark.verified && landmark.status !== 'disputed' && (
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginTop: '15px'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVote(landmark._id, 'yes');
              }}
              disabled={isVoting}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: '#4CAF50',
                ...(currentUserVote?.vote === 'yes' ? {
                  border: '3px solid gold',
                  boxShadow: '0 0 10px rgba(255, 215, 0, 0.7)'
                } : {}),
                opacity: isVoting ? 0.7 : 1
              }}
            >
              {isVoting 
                ? 'Processing...' 
                : currentUserVote?.vote === 'yes' 
                  ? '✔ Voted Yes' 
                  : 'Vote Yes'}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVote(landmark._id, 'no');
              }}
              disabled={isVoting}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: '#f44336',
                ...(currentUserVote?.vote === 'no' ? {
                  border: '3px solid gold',
                  boxShadow: '0 0 10px rgba(255, 215, 0, 0.7)'
                } : {}),
                opacity: isVoting ? 0.7 : 1
              }}
            >
              {isVoting 
                ? 'Processing...' 
                : currentUserVote?.vote === 'no' 
                  ? '✔ Voted No' 
                  : 'Vote No'}
            </button>
          </div>
        )}

        {/* Dispute Notice */}
        {landmark.status === 'disputed' && (
          <div style={{ 
            backgroundColor: '#FFF3E0',
            padding: '15px',
            borderRadius: '8px',
            marginTop: '15px',
            border: '1px solid #FFB74D'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px'
            }}>
              <MaterialIcons name="warning" size={20} color="#FF9800" />
              <span style={{ fontWeight: 'bold' }}>Tribal Review Needed</span>
            </div>
            <p style={{ fontSize: '14px', margin: 0 }}>
              This landmark has conflicting votes and requires review by the tribal council.
            </p>
          </div>
        )}

        {/* Status Messages */}
        {(voteSuccess || voteError || deleteSuccess || deleteError) && (
          <div style={{ marginTop: '15px' }}>
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
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          marginTop: '20px'
        }}>
          {currentUser && (
            <button 
              onClick={() => onDelete(landmark._id)}
              disabled={
                (landmark.createdBy?.toString() ?? '') !== currentUser._id && 
                currentUser.role !== 'admin'
              }
              style={{
                backgroundColor: '#f44336',
                padding: '12px 16px',
                borderRadius: '8px',
                color: 'white',
                border: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                flex: 1,
                opacity: (
                  landmark.createdBy.toString() !== currentUser._id && 
                  currentUser.role !== 'admin'
                ) ? 0.5 : 1
              }}
            >
              Delete Landmark
            </button>
          )}
          <button 
            onClick={onClose}
            style={{
              backgroundColor: '#6d4c41',
              padding: '12px 16px',
              borderRadius: '8px',
              color: '#FFD700',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
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
    description: '',  // Add this line
    lat: 0,
    lon: 0,
    color: '#8B4513',
    imageUrl: ''
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();
  const [voteError, setVoteError] = useState("");
  const [voteSuccess, setVoteSuccess] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load landmarks
  useEffect(() => {
    const loadLandmarks = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/landmarks`);
        setLandmarks(response.data);
      } catch (error) {
        console.error("Error loading landmarks:", error);
        setLandmarks([]);
      } finally {
        setIsLoading(false);
        setIsMapLoading(false);
      }
    };
    loadLandmarks();
  }, []);

  // Render map when landmarks change
  useEffect(() => {
    renderMap();
  }, [landmarks]);

  // Fetch current user
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
        setCurrentUser({
          _id: response.data.user._id,
          isSuperlocallocal: response.data.user.isSuperlocallocal,
          reputationScore: response.data.user.reputationScore,
          role: response.data.user.role
        });
        setCurrentUserRole(response.data.user.role);
      } catch (error) {
        console.error("Auth check failed:", error);
        await AsyncStorage.removeItem('token');
      }
    };

    fetchUser();
  }, []);

  // Clear success/error messages after timeout
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

  // Load Plotly and render map
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

  // Handle map click
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

  // Render map with Plotly
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

  // Add new landmark
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
        description: '',  // Add this line
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
/* */
  // Handle landmark vote
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

      const response = await axios.put<VoteResponse>(
      `${API_BASE_URL}/landmarks/${landmarkId}/vote`,
      { vote: voteType },
      {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    // Update local state with the response
    setLandmarks(prev => prev.map(l => 
      l._id === landmarkId ? response.data.data : l
    ));
    
    // Use the weight from the response or fallback to calculated weight
    const weight = response.data.userWeight ?? getUserWeight(currentUser);
    setVoteSuccess(`Vote recorded! (Weight: ${weight}x)`);
    
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

  // Handle landmark deletion
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
    <div style={{
      position: "relative",
      width: "100vw",
      height: "100vh",
      backgroundColor: "#fff"
    }}>
      {isMapLoading ? (
        <div style={{
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
        }}>
          <div>Loading map...</div>
        </div>
      ) : (
        <>
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
              backgroundColor: "rgba(255,255,255,0.9)",
              padding: 15,
              borderRadius: 12,
              border: "1px solid #f0e6e2",
              zIndex: 1,
              userSelect: "none"
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
              padding: 25,
              borderRadius: 12,
              border: "1px solid #f0e6e2",
              boxShadow: "0 0 20px rgba(0,0,0,0.15)",
              zIndex: 2,
              width: 350,
              maxWidth: "90%"
            }}>
              <h3>Add New Landmark</h3>
              <input
                type="text"
                placeholder="Landmark title"
                value={newLandmark.title}
                onChange={(e) => setNewLandmark({...newLandmark, title: e.target.value})}
                style={{
                  width: "100%",
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#d7ccc8",
                  borderRadius: 8,
                  marginBottom: 20,
                  fontSize: 16,
                  backgroundColor: "#fff",
                  color: "#5d4037"
                }}
              />
              {/* Add this textarea for description */}
              <textarea
                placeholder="Description (optional)"
                value={newLandmark.description}
                onChange={(e) => setNewLandmark({...newLandmark, description: e.target.value})}
                style={{
                  width: "100%",
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#d7ccc8",
                  borderRadius: 8,
                  marginBottom: 20,
                  fontSize: 16,
                  backgroundColor: "#fff",
                  color: "#5d4037",
                  minHeight: 100,
                  resize: "vertical"
                }}
              />
              <input
                type="text"
                placeholder="Image URL (optional)"
                value={newLandmark.imageUrl}
                onChange={(e) => setNewLandmark({...newLandmark, imageUrl: e.target.value})}
                style={{
                  width: "100%",
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#d7ccc8",
                  borderRadius: 8,
                  marginBottom: 20,
                  fontSize: 16,
                  backgroundColor: "#fff",
                  color: "#5d4037"
                }}
              />
              <div style={{
                display: "flex",
                gap: 10,
                marginTop: 15
              }}>
                <button 
                  onClick={addLandmark}
                  disabled={!newLandmark.title.trim()}
                  style={{
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
                    width: "100%",
                    opacity: !newLandmark.title.trim() ? 0.5 : 1
                  }}
                >
                  Add Landmark
                </button>
                <button 
                  onClick={() => setShowForm(false)}
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: "12px 16px",
                    borderRadius: 8,
                    color: "#5d4037",
                    border: "1px solid #d7ccc8",
                    fontSize: 16,
                    cursor: "pointer"
                  }}
                >
                  Cancel
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
              padding: 15,
              borderRadius: 12,
              border: "1px solid #f0e6e2",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              zIndex: 1,
              maxHeight: 300,
              overflowY: "auto",
              width: 250,
              maxWidth: "90%"
            }}>
              <h4>Landmarks ({landmarks.length})</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {landmarks.map(landmark => (
                  <LandmarkListItem 
                    key={landmark._id}
                    landmark={landmark}
                    onClick={() => setSelectedLandmark(landmark)}
                    isSelected={selectedLandmark?._id === landmark._id}
                  />
                ))}
              </ul>
            </div>
          )}

          <div style={{
            position: "absolute",
            top: 20,
            left: 20,
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: 15,
            borderRadius: 12,
            border: "1px solid #f0e6e2",
            zIndex: 1,
            userSelect: "none"
          }}>
            <h3>Landmarks Map</h3>
            <p>Click on the map to add a new landmark</p>
          </div>
        </>
      )}

      {selectedLandmark && (
        <LandmarkModal 
          landmark={selectedLandmark}
          currentUser={currentUser}
          onClose={() => setSelectedLandmark(null)}
          onVote={handleLandmarkVote}
          onDelete={handleDeleteLandmark}
          isVoting={isVoting}
          voteSuccess={voteSuccess}
          voteError={voteError}
          deleteSuccess={deleteSuccess}
          deleteError={deleteError}
        />
      )}
    </div>
  );
};

export default LandmarkPage;