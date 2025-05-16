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
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

interface Village {
  _id: string;
  name: string;
  description: string;
  content: string;
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8082";
  const flatListRef = useRef<FlatList>(null);
  const SCREEN_WIDTH = Dimensions.get('window').width;

  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${normalizedBaseUrl}/${cleanPath}`;
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const viewSize = SCREEN_WIDTH;
    const newIndex = Math.round(contentOffset / viewSize);
    setCurrentIndex(newIndex);
  };

  // Markdown styles with proper typing
  const markdownStyles = {
    body: {
      color: '#5b3a29',
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#8b5e3c',
      marginTop: 20,
      marginBottom: 10,
    },
    heading2: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#8b5e3c',
      marginTop: 15,
      marginBottom: 8,
    },
    paragraph: {
      marginBottom: 15,
    },
    link: {
      color: '#8b5e3c',
      textDecorationLine: 'underline' as const,
    },
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
        const response = await axios.get<Village>(`${baseUrl}/api/villages/${id}`);
        
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
  }, [id, baseUrl]);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{village.name}</Text>
      </View>

      {village.images?.length > 0 ? (
        <View style={styles.galleryContainer}>
          <FlatList
            ref={flatListRef}
            data={village.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: item }}
                  style={styles.mainImage}
                  resizeMode="cover"
                />
              </View>
            )}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
          />
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>No images available</Text>
        </View>
      )}

      <View style={styles.contentWrapper}>
        <Markdown style={markdownStyles}>
          {village.content || village.description}
        </Markdown>

        {village.images?.length > 1 && (
          <View style={styles.thumbnailGallery}>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {village.images.map((img, index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => {
                    flatListRef.current?.scrollToIndex({
                      index,
                      animated: true,
                    });
                  }}
                  style={[
                    styles.thumbnailContainer,
                    index === currentIndex && styles.activeThumbnail
                  ]}
                >
                  <Image 
                    source={{ uri: img }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={20} color="#fff" />
        <Text style={styles.buttonText}>Back to Villages</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f1e1',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    backgroundColor: '#8b5e3c',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  galleryContainer: {
    height: 300,
  },
  imageContainer: {
    width: Dimensions.get('window').width,
    height: 300,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0d6c2',
  },
  placeholderText: {
    color: '#5b3a29',
    fontSize: 16,
  },
  contentWrapper: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8b5e3c',
    marginBottom: 15,
  },
  thumbnailGallery: {
    marginTop: 30,
  },
  thumbnailContainer: {
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 8,
  },
  activeThumbnail: {
    borderColor: '#8b5e3c',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 6,
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
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VillageDetail;