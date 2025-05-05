import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios, { AxiosError } from 'axios';

interface Village {
  _id: string;
  name: string;
  description: string;
  images?: string[]; // Array of image URLs
  location?: {
    // Add location structure if needed
  };
  createdAt?: string;
  updatedAt?: string;
}

const VillageDetail = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
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
        const response = await axios.get<{ data: Village }>(`${baseUrl}/api/villages/${id}`);
        
        if (!response.data.data) {
          throw new Error('Village not found in response');
        }
        
        setVillage(response.data.data);
      } catch (err) {
        const error = err as AxiosError | Error;
        let errorMessage = 'Failed to fetch village details';
        
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
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

  // Use first image if available, otherwise fallback
  const imageUrl = village.images?.[0] || 'https://via.placeholder.com/300';

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.title}>{village.name}</Text>
      <Text style={styles.description}>{village.description}</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Back to Villages</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f1e1',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#5b3a29',
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
  loadingText: {
    marginTop: 10,
    color: '#8b5e3c',
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
    marginBottom: 10,
    textAlign: 'center',
  },
  debugText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#8b5e3c',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VillageDetail;