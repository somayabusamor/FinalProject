import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';  // Import from react-navigation

const villagesData = [
  {
    id: 'alzarnoq',
    name: 'Al-Zarnuq',
    description: 'Al-Zarnuq is one of the unrecognized villages in the Negev.',
    image: 'https://www.arab48.com/images/2018/04/30/70519.jpg',
  },
  {
    id: 'wadi-alnaam',
    name: 'Wadi Al-Na\'am',
    description: 'Wadi Al-Na\'am, the largest unrecognized village in the Negev, suffers from a lack of services.',
    image: 'https://panet-images1.yanbu.news/pics/2019/07/30/665976.jpg',
  },
  {
    id: 'khashem-zaneh',
    name: 'Khashem Zaneh',
    description: 'Khashem Zaneh is a small unrecognized village in the Negev, facing infrastructure challenges.',
    image: 'https://www.alqassam.net/images/news_images/2018/11/555555.jpg',
  },
];

type Village = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export default function VillageDetail() {
  const route = useRoute();  // Use useRoute() hook from React Navigation
  const { id } = route.params as { id: string };  // Extract the 'id' from route.params

  const [village, setVillage] = useState<Village | null>(null);

  useEffect(() => {
    if (id) {
      // Find the village by the id
      const selectedVillage = villagesData.find((v) => v.id === id);
      setVillage(selectedVillage || null);
    }
  }, [id]);

  if (!village) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Village not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: village.image }} style={styles.image} />
      <Text style={styles.title}>{village.name}</Text>
      <Text style={styles.description}>{village.description}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
});
