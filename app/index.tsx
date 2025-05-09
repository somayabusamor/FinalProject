import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Animated, Easing, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslations } from '@/frontend/constants/locales';
import type { LocaleKeys } from '@/frontend/constants/locales/types';
import axios from 'axios';

type Village = {
  _id: string;
  name: string;
  description: string;
  images?: string[];  // Now using images array
  names?: Record<LocaleKeys, string>;
  descriptions?: Record<LocaleKeys, string>;
};

export default function MainIndex() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [language, setLanguage] = useState<LocaleKeys>('en');
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations(language);
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8082";

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
          name: village.names[language] || village.name,
          description: village.descriptions[language] || village.description
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

  const changeLanguage = (lang: LocaleKeys) => {
    setLanguage(lang);
  };

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
          onPress={() => window.location.reload()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Animated.Text style={[styles.welcomeText, { opacity: fadeAnim }]}>
          {t.common.welcome} <Text style={styles.brandName}>{t.common.appName}</Text>! 🌟
        </Animated.Text>

        {/* Language Selector */}
        <View style={styles.languageSelector}>
          <Text style={styles.languageLabel}>{t.common.language}:</Text>
          {(['en', 'ar', 'he'] as LocaleKeys[]).map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => changeLanguage(lang)}
              style={[styles.languageButton, language === lang && styles.activeLanguage]}
            >
              <Text style={styles.languageText}>
                {lang === 'en' ? 'EN' : lang === 'ar' ? 'عربي' : 'עברית'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Left Buttons */}
        <View style={styles.leftButtonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
            <Text style={styles.buttonText}>{t.auth.signIn}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/signup')}>
            <Text style={styles.buttonText}>{t.auth.signUp}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t.villages.title}</Text>
        </View>

        {/* Description Paragraph */}
        <View style={styles.paragraphContainer}>
          <Text style={[
            styles.paragraphText,
            { 
              writingDirection: language === 'ar' || language === 'he' ? 'rtl' : 'ltr',
              textAlign: language === 'ar' || language === 'he' ? 'right' : 'left'
            }
          ]}>
            {language === 'en' && "Unrecognized villages in the Negev are home to about 70,000 Bedouins living in 35 villages that cover around 180,000 dunams (1.4% of Israel's land). Due to the lack of official recognition, these communities face severe shortages in basic infrastructure and services such as electricity, water, and sewage, relying instead on generators and water tanks. Government policies reflect systemic neglect, as Bedouins are not recognized as an indigenous population, which denies them rights under international law and deepens inequalities with the Jewish majority."}
            {language === 'ar' && "القرى غير المعترف بها في النقب هي موطن لحوالي 70,000 بدوي يعيشون في 35 قرية تغطي حوالي 180,000 دونم (1.4٪ من أراضي إسرائيل). بسبب عدم الاعتراف الرسمي، تواجه هذه المجتمعات نقصًا حادًا في البنية التحتية والخدمات الأساسية مثل الكهرباء والمياه والصرف الصحي، وتعتمد بدلاً من ذلك على المولدات وخزانات المياه. تعكس السياسات الحكومية الإهمال المنهجي، حيث لا يتم الاعتراف بالبدو كسكان أصليين، مما يحرمهم من الحقوق بموجب القانون الدولي ويعمق عدم المساواة مع الأغلبية اليهودية."}
            {language === 'he' && "הכפרים הבלתי מוכרים בנגב הם ביתם של כ-70,000 בדואים החיים ב-35 כפרים המשתרעים על פני כ-180,000 דונם (1.4% משטח ישראל). בשל חוסר ההכרה הרשמי, קהילות אלו סובלות ממחסור חמור בתשתיות ושירותים בסיסיים כמו חשמל, מים וביוב, ונאלצות להסתמך על גנרטורים ומיכלי מים. מדיניות הממשלה משקפת הזנחה מערכתית, כאשר הבדואים אינם מוכרים כאוכלוסייה ילידית, מה שמונע מהם זכויות לפי החוק הבינלאומי ומעמיק את אי השוויון עם הרוב היהודי."}
          </Text>
        </View>

        {/* Villages List */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
        {translatedVillages.map((village) => (
          <TouchableOpacity
          key={village._id}
          onPress={() => router.push(`/village/${village._id}`)}
          style={styles.card}
       >
        <Image 
          source={{ uri: getImageUrl(village) }} 
          style={styles.cardImage} 
          defaultSource={{ uri: 'https://static-cdn.toi-media.com/www/uploads/2021/06/000_9BN43E.jpg' }}
        />
              <Text style={[
                styles.cardTitle,
                { 
                  writingDirection: language === 'ar' || language === 'he' ? 'rtl' : 'ltr',
                  textAlign: language === 'ar' || language === 'he' ? 'right' : 'left'
                }
              ]}>
                {village.name}
              </Text>
              <Text style={[
                styles.cardDescription,
                { 
                  writingDirection: language === 'ar' || language === 'he' ? 'rtl' : 'ltr',
                  textAlign: language === 'ar' || language === 'he' ? 'right' : 'left'
                }
              ]}>
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
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 20,
    bottom: 10,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  paragraphText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5b3a29',
  },
  cardRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fdf8ec',
    borderRadius: 10,
    padding: 10,
    marginRight: 15,
    width: 250,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    color: '#5b3a29',
  },
  cardDescription: {
    fontSize: 14,
    color: '#7b5e43',
    textAlign: 'center',
  },
  languageSelector: {
    position: 'absolute',
    right: 20,
    top: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  languageLabel: {
    color: '#f5f1e1',
    marginRight: 8,
    fontWeight: 'bold',
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 5,
    backgroundColor: '#d2b48c',
  },
  activeLanguage: {
    backgroundColor: '#a47149',
  },
  languageText: {
    color: '#fff',
    fontWeight: 'bold',
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
    color: '#d9534f',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8b5e3c',
    padding: 15,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
/*const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 120,
    backgroundColor: '#2b6cb0',
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
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  brandName: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: 'bold',
  },
  leftButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 20,
    bottom: 10,
  },
  button: {
    backgroundColor: '#fff',
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
    color: '#2b6cb0',
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
    backgroundColor: '#2b6cb0',
    width: '100%',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginRight: 15,
    width: 250,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  languageSelector: {
    position: 'absolute',
    right: 20,
    top: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  languageLabel: {
    color: '#fff',
    marginRight: 8,
    fontWeight: 'bold',
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 3,
  },
  activeLanguage: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  languageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    writingDirection: language === 'ar' || language === 'he' ? 'rtl' : 'ltr',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    writingDirection: language === 'ar' || language === 'he' ? 'rtl' : 'ltr',
  },
});*/