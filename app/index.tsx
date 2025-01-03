import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function MainIndex() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Welcome to Negen Pulse App</Text>

      <View style={{ marginBottom: 10 }}>
        <Button title="Sign In" onPress={() => router.push('/login')} />
      </View>

      <Text style={{ fontSize: 18, marginBottom: 10, textAlign: 'center' }}>
        If you are new here, please click below to sign up.
      </Text>

      <View>
        <Button title="Sign Up" onPress={() => router.push('/signup')} />
      </View>
    </View>
  );
}
