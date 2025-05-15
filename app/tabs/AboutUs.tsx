import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AboutUs = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.mainTitle}>About Us</Text>
        <Text style={styles.subtitle}>
          Improving emergency access with accurate geographic data
        </Text>
      </View>

      {/* Project Overview */}
      <View style={styles.section}>
        <Text style={styles.heading}>Our Mission</Text>
        <Text style={styles.paragraph}>
          Emergency services in Israel face difficulties reaching unrecognized areas, leading to delays and potentially harmful consequences. Our platform aims to change this by providing a reliable way to collect and share accurate geographic data for these areas, helping emergency personnel reach their destinations quickly and efficiently.
        </Text>
      </View>

      {/* Problem Definition */}
      <View style={styles.section}>
        <Text style={styles.heading}>The Problem</Text>
        <View style={styles.listItem}>
          <MaterialIcons name="fiber-manual-record" size={14} color="#6d4c41" />
          <Text style={styles.listText}>Lack of accurate geographic data</Text>
        </View>
        <View style={styles.listItem}>
          <MaterialIcons name="fiber-manual-record" size={14} color="#6d4c41" />
          <Text style={styles.listText}>Delayed response times</Text>
        </View>
        <View style={styles.listItem}>
          <MaterialIcons name="fiber-manual-record" size={14} color="#6d4c41" />
          <Text style={styles.listText}>Limited information</Text>
        </View>
      </View>

      {/* Project Goal */}
      <View style={styles.section}>
        <Text style={styles.heading}>Our Goal</Text>
        <Text style={styles.paragraph}>
          Our platform collects and uploads accurate geographic data for unrecognized areas, creating a comprehensive database of coordinates, landmarks, and access routes. This enables local communities to contribute and update geographic data, providing a reference for emergency services to reach critical locations faster.
        </Text>
      </View>

      {/* How It Works */}
      <View style={styles.section}>
        <Text style={styles.heading}>How It Works</Text>
        <View style={styles.listItem}>
          <Text style={styles.number}>1.</Text>
          <Text style={styles.listText}><Text style={styles.bold}>Collect Data</Text>: Local communities add accurate geographic information.</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.number}>2.</Text>
          <Text style={styles.listText}><Text style={styles.bold}>Build Database</Text>: Information is uploaded and stored in a central database.</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.number}>3.</Text>
          <Text style={styles.listText}><Text style={styles.bold}>Access for Emergency Services</Text>: Emergency services access the database for quick references.</Text>
        </View>
      </View>

      {/* Our Vision */}
      <View style={styles.section}>
        <Text style={styles.heading}>Our Vision for the Future</Text>
        <Text style={styles.paragraph}>
          We envision a future where every unrecognized area in Israel has accurate, easily accessible geographic information, ensuring that emergency services can reach every corner of the country in record time.
        </Text>
      </View>

      {/* Contact Us */}
      <View style={[styles.section, styles.contact]}>
        <Text style={styles.heading}>Contact Us</Text>
        <Text style={styles.paragraph}>
          Have questions? Reach out to us at{' '}
          <Text style={styles.contactLink} onPress={() => Linking.openURL('mailto:support@example.com')}>
            support@example.com
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#6d4c41',
    paddingVertical: 25,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  heading: {
    fontSize: 22,
    color: '#6d4c41',
    fontWeight: '600',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    paddingBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    color: '#5d4037',
    lineHeight: 24,
    marginBottom: 5,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listText: {
    fontSize: 16,
    color: '#5d4037',
    marginLeft: 8,
    flex: 1,
    lineHeight: 22,
  },
  number: {
    fontSize: 16,
    color: '#6d4c41',
    fontWeight: 'bold',
    marginRight: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  contact: {
    alignItems: 'center',
  },
  contactLink: {
    color: '#8d6e63',
    fontWeight: 'bold',
  },
});

export default AboutUs;