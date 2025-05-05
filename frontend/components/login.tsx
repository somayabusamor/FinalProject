import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios, { AxiosError } from 'axios';
import { useTranslations, LocaleKeys } from '@/frontend/constants/locales';
import { MaterialIcons } from '@expo/vector-icons';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<LocaleKeys>('en');
  const t = useTranslations(language);

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8082/api/login', {
        email,
        password
      });
  
      const role = response.data.user.role;
  
      if (role === "local") {
        router.push('/local');
      } else if (role === "emergency") {
        router.push('/(tabs)/homepage');
      } else if (role === "admin") {
        router.push('/admin');
      }
  
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        console.log("Login error response:", err.response.data);
      } else {
        console.log("Login error:", err.message);
      }
    }
  };

  const changeLanguage = (lang: LocaleKeys) => {
    setLanguage(lang);
  };

  return (
    <View style={[
      styles.container,
      { direction: language === 'ar' || language === 'he' ? 'rtl' : 'ltr' }
    ]}>
      {/* Language Selector */}
      <View style={styles.languageSelector}>
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

      <View style={styles.header}>
        <MaterialIcons name="login" size={40} color="#FFD700" />
        <Text style={styles.title}>{t.auth.login.title}</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder={t.auth.login.email}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#8d6e63"
          textAlign={language === 'ar' || language === 'he' ? 'right' : 'left'}
        />
        <TextInput
          style={styles.input}
          placeholder={t.auth.login.password}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#8d6e63"
          textAlign={language === 'ar' || language === 'he' ? 'right' : 'left'}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>{t.auth.login.button}</Text>
        </TouchableOpacity>
        
        <View style={styles.signupLinkContainer}>
          <Text style={styles.signupText}>{t.auth.login.noAccount}</Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.signupLink}>{t.auth.login.signupLink}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6d4c41',
    marginTop: 10,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0e6e2',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#d7ccc8',
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#5d4037',
  },
  button: {
    backgroundColor: '#6d4c41',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupLinkContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#8d6e63',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6d4c41',
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
  languageSelector: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 3,
  },
  activeLanguage: {
    backgroundColor: '#6d4c41',
  },
  languageText: {
    color: '#6d4c41',
    fontWeight: 'bold',
  },
});