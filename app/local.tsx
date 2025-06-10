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

interface SuperLocalRequest {
  _id: string;
  userId: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  points: number;
  isSuperlocalLocal: boolean;
}

export default function LocalPage() {
  const { language } = useLanguage();
  const t = useTranslations();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData>({
    _id: '',
    name: '',
    email: '',
    points: 0,
    isSuperlocalLocal: false
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
                isSuperlocalLocal: user.isSuperlocal || false
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('http://localhost:8082/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data?.success) {
          const user = response.data.user;
          setUserData({
            _id: user._id,
            name: user.name || user.email.split('@')[0],
            email: user.email,
            points: 0,
            isSuperlocalLocal: user.isSuperlocal || false
          });
          
          // Only check for pending requests if user is not already a Super Local
          if (!user.isSuperlocal) {
            const requests = await fetchSuperLocalRequests();
            const hasPendingRequest = requests.some(
              req => req.userId === user._id && req.status === 'pending'
            );
            setRequestSent(hasPendingRequest);
          }
          
          await AsyncStorage.setItem('userRole', user.role);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserData({
            _id: user._id,
            name: user.name || user.email.split('@')[0],
            email: user.email,
            points: 0,
            isSuperlocalLocal: user.isSuperlocal || false
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

  const handleRequestSuperLocal = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Not authenticated');
        return;
      }

      const response = await axios.post(
        'http://localhost:8082/api/auth/request-super',
        {},
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
        
        const newRequest = {
          _id: response.data.request._id,
          userId: response.data.request.userId,
          name: userData.name,
          email: userData.email,
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
  }, [requestSent]);

  if (role === 'emergency') {
    return <Text>You do not have access to this screen.</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileEmail}>{userData.email}</Text>
            <View style={styles.pointsContainer}>
            </View>
            {userData.isSuperlocalLocal ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Super Local</Text>
              </View>
            ) : (
              <Text style={styles.regularLocalText}>Local Resident</Text>
            )}
          </View>
        </View>

        <View style={styles.statusCard}>
          {userData.isSuperlocalLocal ? (
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

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleAddRoute}
          >
            <MaterialIcons name="add-road" size={24} color="#6d4c41" />
            <Text style={styles.actionButtonText}>Add Route</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleAddLandmark}
          >
            <MaterialIcons name="place" size={24} color="#6d4c41" />
            <Text style={styles.actionButtonText}>Add Landmark</Text>
          </TouchableOpacity>
        </View>

        {!userData.isSuperlocalLocal && !requestSent && (
          <TouchableOpacity 
            style={styles.superLocalButton}
            onPress={handleRequestSuperLocal}
          >
            <MaterialIcons name="verified" size={24} color="#FFD700" />
            <Text style={styles.superLocalButtonText}>Request Super Local Status</Text>
          </TouchableOpacity>
        )}

        {!userData.isSuperlocalLocal && requestSent && (
          <View style={styles.requestStatus}>
            <MaterialIcons name="hourglass-empty" size={20} color="#6d4c41" />
            <Text style={styles.requestStatusText}>Super Local request pending admin approval</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="bolt" size={24} color="#6d4c41" />
              <Text style={styles.cardTitle}>{t.localPage.quick_actions}</Text>
            </View>
            <TouchableOpacity style={styles.reportButton}>
              <MaterialIcons name="report" size={20} color="#6d4c41" />
              <Text style={styles.reportButtonText}>{t.localPage.report_issue}</Text>
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
    padding: 16,
  },
  profileHeader: {
    marginBottom: 20,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6d4c41',
  },
  profileEmail: {
    fontSize: 16,
    color: '#5d4037',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  badge: {
    backgroundColor: '#4caf50',
    padding: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  regularLocalText: {
    marginTop: 8,
    color: '#5d4037',
    fontStyle: 'italic',
  },
  statusCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 18,
    color: '#6d4c41',
  },
  statusText: {
    fontSize: 14,
    color: '#5d4037',
    lineHeight: 20,
  },
  requestButton: {
    marginTop: 12,
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  requestButtonText: {
    fontWeight: 'bold',
    color: '#6d4c41',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    width: '45%',
    justifyContent: 'center',
  },
  actionButtonText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#6d4c41',
  },
  superLocalButton: {
    backgroundColor: '#6d4c41',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
  },
  superLocalButtonText: {
    color: '#FFD700',
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
  reportButton: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButtonText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#6d4c41',
  },
});