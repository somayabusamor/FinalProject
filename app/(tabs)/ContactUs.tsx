import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // لاستخدام الأيقونات

const ContactUs = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Contact Us</Text>

      <View style={styles.contactItem}>
        <MaterialIcons name="email" size={24} color="#4CAF50" />
        <Text style={styles.contactText}>asraaalgergawi@gmail.com</Text>
      </View>

      <View style={styles.contactItem}>
        <MaterialIcons name="phone" size={24} color="#4CAF50" />
        <Text style={styles.contactText}>0523694162</Text>
      </View>

      <View style={styles.contactItem}>
        <MaterialIcons name="email" size={24} color="#4CAF50" />
        <Text style={styles.contactText}>tasnesh@ac.sce.ac.il</Text>
      </View>

      <View style={styles.contactItem}>
        <MaterialIcons name="phone" size={24} color="#4CAF50" />
        <Text style={styles.contactText}>0523694162</Text>
      </View>

      <View style={styles.contactItem}>
        <MaterialIcons name="email" size={24} color="#4CAF50" />
        <Text style={styles.contactText}>ssomaya252@gmail.com</Text>
      </View>

      <View style={styles.contactItem}>
        <MaterialIcons name="phone" size={24} color="#4CAF50" />
        <Text style={styles.contactText}>0523694162</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
    elevation: 2, // للظل
  },
  contactText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
  },
});

export default ContactUs;
