import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';

const villages = [
  {
    id: 'Umalhieran',
    name: 'Atir - Um Alhieran',
    description: 'Al-Zarnuq is one of the unrecognized villages in the Negev.',
    image: 'https://palqura.com/images/city/181677779338.jpeg',
  },
  {
    id: 'wadi-alnaam',
    name: 'Wadi Al-Na\'am',
    description: 'Wadi Al-Na\'am, the largest unrecognized village in the Negev, suffers from a lack of services.',
    image: 'https://law.acri.org.il/ar/wp-content/uploads/2014/03/wadi-al-naam2.jpg',
  },
  {
    id: 'khashem-zaneh',
    name: 'Khashem Zaneh',
    description: 'Khashem Zaneh is a small unrecognized village in the Negev, facing infrastructure challenges.',
    image: 'https://www.sikkuy-aufoq.org.il/wp-content/uploads/2020/11/c57e03f7-5054-4ac8-97a8-e2b5bd10197c-e1605085894243-1024x620.jpg',
  },
];

export default function MainIndex() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Animated.Text style={[styles.welcomeText, { opacity: fadeAnim }]}>
          🌟 Welcome to <Text style={styles.brandName}>Negev Pulse App</Text>! 🌟
        </Animated.Text>

        {/* Aligned to the left */}
        <View style={styles.leftButtonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/signup')}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Repositioned Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Unrecognized Villages in the Negev</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
          {villages.map((village) => (
            <TouchableOpacity
              key={village.id}
              onPress={() => router.push({ pathname: '/village/[id]', params: { id: village.id } })}
              style={styles.card}>
              <Image source={{ uri: village.image }} style={styles.cardImage} />
              <Text style={styles.cardTitle}>{village.name}</Text>
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
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
});
