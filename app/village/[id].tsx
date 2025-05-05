import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

interface Village {
  _id: string;
  name: string;
  description: string;
  image?: string;
  names?: Record<string, string>;
  descriptions?: Record<string, string>;
}

export default function VillageDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [village, setVillage] = useState<Village | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8082";

  useEffect(() => {
    if (!id) {
      setError('No village ID provided');
      setLoading(false);
      return;
    }

    const fetchVillageDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}/api/villages/${id}`);
        
        if (!response.data) {
          throw new Error('Village not found');
        }
        
        setVillage(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch village');
        console.error("Error fetching village:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVillageDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5e3c" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!village) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Village not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: village.image || 'https://static-cdn.toi-media.com/www/uploads/2021/06/000_9BN43E.jpg' }} 
        style={styles.image} 
      />
      <Text style={styles.title}>{village.name}</Text>
      <Text style={styles.description}>{village.description}</Text>
      
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Back to Villages</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f1e1',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#5b3a29',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5b3a29',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#d9534f',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#8b5e3c',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});