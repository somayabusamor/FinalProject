import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Animated, Easing, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslations } from '@/frontend/constants/locales';
import type { LocaleKeys } from '@/frontend/constants/locales/types';
import axios from 'axios';
import { useLanguage } from '@/frontend/context/LanguageProvider';

type Village = {
  _id: string;
  name: string;
  description: string;
  images?: string[];
  names?: Record<LocaleKeys, string>;
  descriptions?: Record<LocaleKeys, string>;
};

export default function MainIndex() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { language, changeLanguage, isRTL } = useLanguage();
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8082";

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleLanguageChange = (lang: LocaleKeys) => {
    fadeOut();
    setTimeout(() => {
      changeLanguage(lang);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 300);
  };

  useEffect(() => {
    const fetchVillages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}/api/villages`);
        setVillages(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error("Error fetching villages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVillages();
  }, [baseUrl]);

  const getImageUrl = (village: Village) => {
    return village.images && village.images.length > 0 
      ? village.images[0] 
      : 'https://static-cdn.toi-media.com/www/uploads/2021/06/000_9BN43E.jpg';
  };

  const translatedVillages = useMemo(() => {
    return villages.map(village => {
      if (village.names && village.descriptions) {
        return {
          ...village,
          id: village._id,
          name: village.names[language as LocaleKeys] || village.name,
          description: village.descriptions[language as LocaleKeys] || village.description
        };
      }
      return {
        ...village,
        id: village._id,
        name: village.name,
        description: village.description
      };
    });
  }, [villages, language]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#8b5e3c" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => location.reload()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { flexDirection: 'column' }]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Animated.Text style={[styles.welcomeText, { opacity: fadeAnim }]}>
          {t.common.welcome} <Text style={styles.brandName}>{t.common.appName}</Text>! 🌟
        </Animated.Text>

        {/* Language Selector */}
        <View style={[
          styles.languageSelector,
          { flexDirection: isRTL ? 'row-reverse' : 'row', [isRTL ? 'left' : 'right']: 20 }
        ]}>
          <Text style={styles.languageLabel}>{t.common.language}:</Text>
          {(['en', 'ar', 'he'] as LocaleKeys[]).map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => handleLanguageChange(lang)}
              style={[styles.languageButton, language === lang && styles.activeLanguage]}
            >
              <Text style={styles.languageText}>
                {lang === 'en' ? 'EN' : lang === 'ar' ? 'عربي' : 'עברית'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Buttons */}
        <View style={[
          styles.leftButtonContainer,
          { flexDirection: isRTL ? 'row-reverse' : 'row', [isRTL ? 'right' : 'left']: 20 }
        ]}>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
            <Text style={styles.buttonText}>{t.auth.signIn}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/signup')}>
            <Text style={styles.buttonText}>{t.auth.signUp}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t.villages.title}</Text>
        </View>

        <View style={styles.paragraphContainer}>
          <Text style={[
            styles.paragraphText,
            {
              writingDirection: isRTL ? 'rtl' : 'ltr',
              textAlign: isRTL ? 'right' : 'left'
            }
          ]}>
            {/* النصوص المترجمة */}
            {language === 'en' && "Unrecognized villages in the Negev..."}
            {language === 'ar' && "القرى غير المعترف بها في النقب..."}
            {language === 'he' && "הכפרים הבלתי מוכרים בנגב..."}
          </Text>
        </View>

        {/* Villages */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          {translatedVillages.map((village) => (
            <TouchableOpacity
              key={village._id}
              onPress={() => router.push(`/village/${village._id}`)}
              style={styles.card}
            >
              <Image
                source={{ uri: getImageUrl(village) }}
                style={styles.cardImage}
              />
              <Text style={{
                writingDirection: isRTL ? 'rtl' : 'ltr',
                textAlign: isRTL ? 'right' : 'left',
                ...styles.cardTitle
              }}>
                {village.name}
              </Text>
              <Text style={{
                writingDirection: isRTL ? 'rtl' : 'ltr',
                textAlign: isRTL ? 'right' : 'left',
                ...styles.cardDescription
              }}>
                {village.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f1e1',
  },
  header: {
    height: 120,
    backgroundColor: '#8b5e3c',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  languageSelector: {
    position: 'absolute',
    top: 50,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f5f1e1',
    textAlign: 'center',
    marginBottom: 10,
  },
  brandName: {
    color: '#d2b48c',
    fontSize: 22,
    fontWeight: 'bold',
  },
  leftButtonContainer: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#d2b48c',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#4b2e2e',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  titleContainer: {
    backgroundColor: '#a47149',
    width: '100%',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff8e1',
    textAlign: 'center',
  },
  paragraphContainer: {
    backgroundColor: '#fdf8ec',
    width: '100%',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  paragraphText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5b3a29',
  },
  card: {
    backgroundColor: '#fdf8ec',
    borderRadius: 10,
    padding: 10,
    marginRight: 15,
    width: 250,
    alignItems: 'center',
  },
  cardImage: {
    width: 220,
    height: 130,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4b2e2e',
  },
  cardDescription: {
    fontSize: 14,
    color: '#5b3a29',
    marginTop: 5,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#d2b48c',
    padding: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#4b2e2e',
    fontWeight: 'bold',
  },
  languageLabel: {
    color: '#fff',
    marginRight: 5,
    fontWeight: 'bold',
  },
  languageButton: {
    paddingHorizontal: 10,
  },
  languageText: {
    color: '#fff',
  },
  activeLanguage: {
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
  },
});
