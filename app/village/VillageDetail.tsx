import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

// نوع البيانات القادمة عبر route
type VillageDetailRouteProps = {
  route: {
    params: {
      id: string;
    };
  };
};

const villages = [
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

export default function VillageDetail({ route }: VillageDetailRouteProps) {
  const { id } = route.params;

  const village = villages.find(v => v.id === id);

  if (!village) {
    return <Text>Village not found!</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: village.image }} style={styles.image} />
      <Text style={styles.name}>{village.name}</Text>
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
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
  },
});
