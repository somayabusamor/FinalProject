import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios, { AxiosError } from 'axios';
import { useTranslations, LocaleKeys } from '@/frontend/constants/locales';

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

      <View style={styles.formContainer}>
        <Text style={styles.title}>{t.auth.login.title}</Text>
        
        <TextInput
          style={styles.input}
          placeholder={t.auth.login.email}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#aaa"
          textAlign={language === 'ar' || language === 'he' ? 'right' : 'left'}
        />
        <TextInput
          style={styles.input}
          placeholder={t.auth.login.password}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#aaa"
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
    backgroundColor: '#f0f0f0',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 8,
    width: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupLinkContainer: {
    marginTop: 20,
    flexDirection: 'row',
  },
  signupText: {
    fontSize: 14,
    color: '#555',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
  },
  languageSelector: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 3,
  },
  activeLanguage: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  languageText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});