import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ContactUs = () => {
  const contacts = [
    {
      name: "Asraa Al Gergawi",
      email: "asraaalgergawi@gmail.com",
      phone: "0523694162"
    },
    {
      name: "Tasneem",
      email: "tasnesh@ac.sce.ac.il",
      phone: "0523694162"
    },
    {
      name: "Somaya",
      email: "ssomaya252@gmail.com",
      phone: "0523694162"
    }
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Contact Us</Text>
      </View>

      {contacts.map((contact, index) => (
        <View key={index} style={styles.contactCard}>
          <Text style={styles.contactName}>{contact.name}</Text>
          
          <View style={styles.contactInfo}>
            <MaterialIcons name="email" size={20} color="#6d4c41" />
            <Text style={styles.contactText}>{contact.email}</Text>
          </View>
          
          <View style={styles.contactInfo}>
            <MaterialIcons name="phone" size={20} color="#6d4c41" />
            <Text style={styles.contactText}>{contact.phone}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#6d4c41',
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  contactCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6d4c41',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    paddingBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  contactText: {
    fontSize: 15,
    color: '#5d4037',
    marginLeft: 10,
  },
});

export default ContactUs;