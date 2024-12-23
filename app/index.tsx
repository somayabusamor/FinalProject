import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function MainIndex() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>Welcome to the App</Text>
      <Button title="Go to Tabs" onPress={() => router.push('/(tabs)')} />
    </View>
  );
}
