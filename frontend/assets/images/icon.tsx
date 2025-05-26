import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const EmergencyPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>מקרי חירום</Text>
      <Image
        source={require('./assets/images/location_icon.png')}
        style={styles.image}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain'
  }
});

export default EmergencyPage;
