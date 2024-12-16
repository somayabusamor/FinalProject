// app/tabs/ContactUs.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ContactUs = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Us</Text>
      <Text style={styles.description}>Email: example@example.com</Text>
      <Text style={styles.description}>Phone: +123456789</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, textAlign: 'center' },
});

export default ContactUs;
