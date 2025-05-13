import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView,
  FlatList,
  Dimensions 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Village {
  _id: string;
  name: string;
  description: string;
  images: string[];
  location?: {
    type: string;
    coordinates: number[];
  };
}

const VillageDetail = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [village, setVillage] = useState<Village | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8082";

  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${baseUrl}/${cleanPath}`;
  };

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

        const villageData = {
          ...response.data,
          images: response.data.images?.map((img: string) => getImageUrl(img)) || []
        };

        setVillage(villageData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch village details');
        console.error('Error fetching village details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVillageDetails();
  }, [id, baseUrl]); // Make sure all dependencies are properly declared

  // Debug useEffect
  useEffect(() => {
    if (village) {
      console.log('Village data:', village);
      if (village.images?.length > 0) {
        console.log('First image URL:', getImageUrl(village.images[0]));
      }
    }
  }, [village]);

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#8b5e3c" /></View>;
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
    return <View style={styles.errorContainer}><Text style={styles.errorText}>Village not found</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {village.images?.length > 0 ? (
          <Image 
            source={{ uri: getImageUrl(village.images[0]) }}
            style={styles.mainImage}
            resizeMode="cover"
            onError={() => setImageLoadError(true)}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text>No image available</Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{village.name}</Text>
        <Text style={styles.description}>{village.description}</Text>

        {village.images?.length > 1 && (
          <View style={styles.galleryContainer}>
            <Text style={styles.sectionTitle}>More Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {village.images.slice(1).map((img, index) => (
                <Image 
                  key={index}
                  source={{ uri: getImageUrl(img) }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.buttonText}>Back to Villages</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f1e1',
  },
  imageContainer: {
    height: 300,
    width: SCREEN_WIDTH,
    overflow: 'hidden',
  },
  mainImage: {
    width: SCREEN_WIDTH,
    height: '100%',
    backgroundColor: '#e0d6c2',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0d6c2',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#5b3a29',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5b3a29',
    marginBottom: 25,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#8b5e3c',
  },
  galleryContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#5b3a29',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#8b5e3c',
  },
});

export default VillageDetail;