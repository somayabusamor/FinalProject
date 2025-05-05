import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

type SignupData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
};

const Signup = () => {
  const router = useRouter();
  const [data, setData] = useState<SignupData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "local",
  });
  const [error, setError] = useState<string>("");

  const handleChange = (name: keyof SignupData, value: string) => {
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const url = `http://localhost:8082/api/signup`;
      const { data: res } = await axios.post(url, data);
      
      Alert.alert(
        'Success',
        'Account created successfully!',
        [{ text: 'OK', onPress: () => router.push('/login') }]
      );
    } catch (error: any) {
      console.error('API call failed:', error);
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <MaterialIcons name="person-add" size={40} color="#FFD700" />
            <Text style={styles.title}>Create Account</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={data.name}
              onChangeText={(text) => handleChange('name', text)}
              placeholderTextColor="#8d6e63"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={data.email}
              onChangeText={(text) => handleChange('email', text)}
              keyboardType="email-address"
              placeholderTextColor="#8d6e63"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={data.password}
              onChangeText={(text) => handleChange('password', text)}
              secureTextEntry
              placeholderTextColor="#8d6e63"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={data.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
              secureTextEntry
              placeholderTextColor="#8d6e63"
            />
            
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Account Type:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity 
                  style={[styles.roleButton, data.role === 'local' && styles.activeRole]}
                  onPress={() => handleChange('role', 'local')}
                >
                  <Text style={[styles.roleText, data.role === 'local' && styles.activeRoleText]}>
                    Local Resident
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleButton, data.role === 'emergency' && styles.activeRole]}
                  onPress={() => handleChange('role', 'emergency')}
                >
                  <Text style={[styles.roleText, data.role === 'emergency' && styles.activeRoleText]}>
                    Emergency Responder
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6d4c41',
    marginTop: 10,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0e6e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    width: '100%',
    maxWidth: 400,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#5d4037',
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    color: '#6d4c41',
    marginBottom: 10,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activeRole: {
    backgroundColor: '#6d4c41',
    borderColor: '#6d4c41',
  },
  roleText: {
    color: '#6d4c41',
    fontWeight: '500',
  },
  activeRoleText: {
    color: '#FFD700',
  },
  button: {
    backgroundColor: '#6d4c41',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#8d6e63',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6d4c41',
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default Signup;