
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslations } from '@/frontend/constants/locales';
import type { LocaleKeys } from '@/frontend/constants/locales/types';

type Village = {
  id: string;
  names: Record<LocaleKeys, string>;
  descriptions: Record<LocaleKeys, string>;
  image: string;
};

const villages: Village[] = [
  {
    id: 'Umalhieran',
    names: {
      en: 'Atir - Um Alhieran',
      ar: 'عتير - أم الحيران',
      he: 'עתיר - אום אל-חיראן'
    },
    descriptions: {
      en: 'Al-Zarnuq is one of the unrecognized villages in the Negev.',
      ar: 'الزرقانة هي إحدى القرى غير المعترف بها في النقب.',
      he: 'אל-זרנוק הוא אחד הכפרים הלא מוכרים בנגב'
    },
    image: 'https://palqura.com/images/city/181677779338.jpeg',
  },
  {
    id: 'wadi-alnaam',
    names: {
      en: 'Wadi Al-Na\'am',
      ar: 'وادي النعم',
      he: 'ואדי אל-נעם'
    },
    descriptions: {
      en: 'The largest unrecognized village in the Negev, suffers from a lack of services.',
      ar: 'أكبر قرية غير معترف بها في النقب، تعاني من نقص الخدمات.',
      he: 'הכפר הלא מוכר הגדול ביותר בנגב, סובל ממחסור בשירותים'
    },
    image: 'https://law.acri.org.il/ar/wp-content/uploads/2014/03/wadi-al-naam2.jpg',
  },
  {
    id: 'khashem-zaneh',
    names: {
      en: 'Khashem Zaneh',
      ar: 'خشم زنة',
      he: 'חשום זנה'
    },
    descriptions: {
      en: 'A small unrecognized village in the Negev, facing infrastructure challenges.',
      ar: 'قرية صغيرة غير معترف بها في النقب، تواجه تحديات بنية تحتية.',
      he: 'כפר קטן לא מוכר בנגב, מתמודד עם אתגרי תשתית'
    },
    image: 'https://www.sikkuy-aufoq.org.il/wp-content/uploads/2020/11/c57e03f7-5054-4ac8-97a8-e2b5bd10197c-e1605085894243-1024x620.jpg',
  },
];

export default function MainIndex() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [language, setLanguage] = useState<LocaleKeys>('en');
  const t = useTranslations(language);
  
  const translatedVillages = useMemo(() => {
    return villages.map(village => ({
      ...village,
      name: village.names[language],
      description: village.descriptions[language]
    }));
  }, [language]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    console.log('Language changed to:', language);
  }, [language]);

  const changeLanguage = (lang: LocaleKeys) => {
    setLanguage(lang);
  };

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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
          {translatedVillages.map((village) => (
            <TouchableOpacity
              key={village.id}
              onPress={() => router.push({ pathname: '/village/[id]', params: { id: village.id } })}
              style={styles.card}
            >
              <Image source={{ uri: village.image }} style={styles.cardImage} />
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

// Keep your existing styles

const styles = StyleSheet.create({
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