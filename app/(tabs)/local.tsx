import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/frontend/context/LanguageProvider';
import { useTranslations } from '@/frontend/constants/locales';
import { I18nManager } from 'react-native';


import { IconSymbol } from '@/frontend/components/ui/IconSymbol';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

// Use this in both local.tsx and admin.tsx
interface SuperLocalRequest {
  _id: string;       // Changed from 'id' to '_id'
  userId: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;  // Changed from 'date' to 'createdAt'
}
interface UserData {
  _id: string;       // Add this
  name: string;
  email: string;
  points: number;
  isSuperLocal: boolean;
}
export default function LocalPage() {
  const { language } = useLanguage();
  const  t  = useTranslations();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  // Then in your component:
  const [userData, setUserData] = useState<UserData>({
    _id: '',           // Initialize with empty string
    name: '',
    email: '',
    points: 0,
    isSuperLocal: false
  });
  const [requestSent, setRequestSent] = useState(false);
  const [superLocalRequests, setSuperLocalRequests] = useState<SuperLocalRequest[]>([]);
  useFocusEffect(
      React.useCallback(() => {
        const fetchData = async () => {
          const token = await AsyncStorage.getItem('token');
          if (token) {
            try {
              const response = await axios.get('http://localhost:8082/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (response.data?.success) {
                const user = response.data.user;
                setUserData({
                  _id: user._id,
                  name: user.name || user.email.split('@')[0],
                  email: user.email,
                  points: 0,
                  isSuperLocal: user.isSuper || false
                });
              }
            } catch (error) {
              console.error('Error refreshing user data:', error);
            }
          }
        };
        fetchData();
      }, [])
    );
  // In local.tsx
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Correct the port to 8082
        const response = await axios.get('http://localhost:8082/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data?.success) {
          const user = response.data.user; // Note: it's response.data.user, not response.data.data
          setUserData({
            _id: user._id,      // Make sure this is included
            name: user.name || user.email.split('@')[0],
            email: user.email,
            points: 0,
            isSuperLocal: user.isSuper || false
          });
          
          // Check requests
          const requests = await fetchSuperLocalRequests();
          const hasPendingRequest = requests.some(
            req => req.userId === user._id && req.status === 'pending'
          );
          setRequestSent(hasPendingRequest);
          
          await AsyncStorage.setItem('userRole', user.role);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to stored data
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserData({
            _id: user._id,      // Make sure this is included
            name: user.name || user.email.split('@')[0],
            email: user.email,
            points: 0,
            isSuperLocal: user.isSuper || false
          });
        }
      }
    };
    
    fetchUserData();
  }, []);

  const handleAddRoute = () => {
    router.push('/addRoute');
  };

  const handleAddLandmark = () => {
    router.push('/addLandmark');
  };

  const fetchSuperLocalRequests = async (): Promise<SuperLocalRequest[]> => {
    try {
      const storedRequests = await AsyncStorage.getItem('superLocalRequests');
      return storedRequests ? JSON.parse(storedRequests) : [];
    } catch (error) {
      console.error('Error fetching requests:', error);
      return [];
    }
  };

  // Replace the real API call with mock data
  const handleRequestSuperLocal = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    // Make the API request
    const response = await axios.post(
      'http://localhost:8082/api/auth/request-super',
      {}, // Empty body since we're using the token
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );

    if (response.data.success) {
      Alert.alert('Success', response.data.message);
      setRequestSent(true);
      
      // Update local requests cache with the complete request data
      const newRequest = {
        _id: response.data.request._id,
        userId: response.data.request.userId,
        name: userData.name, // Using the local userData
        email: userData.email, // Using the local userData
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const existingRequests = await fetchSuperLocalRequests();
      await AsyncStorage.setItem(
        'superLocalRequests',
        JSON.stringify([...existingRequests, newRequest])
      );
    } else {
      Alert.alert('Error', response.data.message);
    }
  } catch (error) {
    console.error('Request error:', error);
    let errorMessage = 'Failed to submit request';
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || 
                     error.message || 
                     'Network error occurred';
    }
    Alert.alert('Error', errorMessage);
  }
};
  useEffect(() => {
      const checkRequests = async () => {
      const requests = await AsyncStorage.getItem('superLocalRequests');
      console.log('Current requests in storage:', requests);
    };
    checkRequests();
  }, [requestSent]); // Runs when request status changes

  if (role === 'emergency') {
    return <Text>You do not have access to this screen.</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Keep your existing Tabs configuration */}

      <ScrollView style={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileEmail}>{userData.email}</Text>
            <View style={styles.pointsContainer}>
            </View>
            {userData.isSuperLocal ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Super Local</Text>
              </View>
            ) : (
              <Text style={styles.regularLocalText}>Local Resident</Text>
            )}
          </View>
        </View>

        {/* Status Card - Moved under profile */}
        <View style={styles.statusCard}>
          {userData.isSuperLocal ? (
            <>
              <View style={styles.statusHeader}>
                <MaterialIcons name="verified" size={24} color="#4caf50" />
                <Text style={styles.statusTitle}>Super Local Status</Text>
              </View>
              <Text style={styles.statusText}>
                You have Super Local privileges! Your contributions are prioritized and help shape the village map for everyone.
              </Text>
            </>
          ) : (
            <>
              <View style={styles.statusHeader}>
                <MaterialIcons name="stars" size={24} color="#FFD700" />
                <Text style={styles.statusTitle}>Become a Super Local</Text>
              </View>
              <Text style={styles.statusText}>
                Gain special privileges by becoming a Super Local. Your contributions will 
                be prioritized and you'll help shape the village map for everyone.
              </Text>
              {!requestSent && (
                <TouchableOpacity 
                  style={styles.requestButton}
                  onPress={handleRequestSuperLocal}
                >
                  <Text style={styles.requestButtonText}>Apply Now</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.addButton]}
            onPress={handleAddRoute}
          >
            <MaterialIcons name="add-road" size={24} color="#6d4c41" />
            <Text style={styles.actionButtonText}>Add Route</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.addButton]}
            onPress={handleAddLandmark}
          >
            <MaterialIcons name="place" size={24} color="#6d4c41" />
            <Text style={styles.actionButtonText}>Add Landmark</Text>
          </TouchableOpacity>
        </View>

        {/* Keep the rest of your existing components */}
        {!userData.isSuperLocal && !requestSent && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.superLocalButton]}
            onPress={handleRequestSuperLocal}
          >
            <MaterialIcons name="verified" size={24} color="#FFD700" />
            <Text style={styles.superLocalButtonText}>Request Super Local Status</Text>
          </TouchableOpacity>
        )}

        {requestSent && (
          <View style={styles.requestStatus}>
            <MaterialIcons name="hourglass-empty" size={20} color="#6d4c41" />
            <Text style={styles.requestStatusText}>Super Local request pending admin approval</Text>
          </View>
        )}

        {/* Main Content */}
        <View style={styles.content}>
          {/* Card 2 - Quick Actions */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="bolt" size={24} color="#6d4c41" />
              <Text style={styles.cardTitle}>{t.localPage.quick_actions}</Text>
            </View>
            <TouchableOpacity style={styles.goldButton}>
              <MaterialIcons name="report" size={20} color="#6d4c41" />
              <Text style={styles.goldButtonText}>{t.localPage.report_issue}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );  
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f5',
  },
  profileHeader: {
    backgroundColor: '#6d4c41',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileEmail: {
    color: '#f0e6e2',
    fontSize: 14,
    marginTop: 2,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  pointsText: {
    color: '#FFD700',
    fontSize: 14,
    marginLeft: 4,
  },
  badge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  badgeText: {
    color: '#6d4c41',
    fontSize: 12,
    fontWeight: 'bold',
  },
  regularLocalText: {
    color: '#f0e6e2',
    fontSize: 12,
    marginTop: 6,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButton: {
    backgroundColor: '#FFD700',
  },
  superLocalButton: {
    backgroundColor: '#6d4c41',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  actionButtonText: {
    color: '#6d4c41',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  superLocalButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  requestStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f0e6e2',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  requestStatusText: {
    color: '#6d4c41',
    fontSize: 14,
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0e6e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e6e2',
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6d4c41',
    marginLeft: 10,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 5,
  },
  alertText: {
    fontSize: 16,
    color: '#5d4037',
    marginLeft: 10,
  },
  goldButton: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  goldButtonText: {
    color: '#6d4c41',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
    // Add/update these styles:
  statusCard: {
    backgroundColor: '#fff8f5',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0e6e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6d4c41',
    marginLeft: 10,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#5d4037',
    marginBottom: 10,
  },
  requestButton: {
    backgroundColor: '#6d4c41',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  requestButtonText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Add these styles to your StyleSheet:
superUserMessage: {
  backgroundColor: '#e8f5e9',
  padding: 16,
  margin: 16,
  borderRadius: 8,
  borderLeftWidth: 4,
  borderLeftColor: '#4caf50',
},
regularUserMessage: {
  backgroundColor: '#e3f2fd',
  padding: 16,
  margin: 16,
  borderRadius: 8,
  borderLeftWidth: 4,
  borderLeftColor: '#2196f3',
},
messageTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 8,
  color: '#2e7d32',
},
messageText: {
  fontSize: 14,
  lineHeight: 20,
  color: '#424242',
},
});