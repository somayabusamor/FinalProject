import React, { useEffect, useState } from "react";
import EmergencyPage from "../EmergencyPage";
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomePage: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const getRole = async () => {
      const storedRole = await AsyncStorage.getItem("userRole");
      console.log("Stored role:", storedRole);
      setRole(storedRole ? storedRole.trim().toLowerCase() : null);
    };
    getRole();
  }, []);

  useEffect(() => {
    if (!role) return; // wait for role to load
    if (role !== "emergency" && role !== "admin") {
      // redirect to /local if not emergency or admin
      router.push('/local');
    }
  }, [role]);

  if (!role) {
    return <p>Loading...</p>;
  }

  if (role === "emergency") {
    return <EmergencyPage />;
  }

  // Optionally, show loading or null while redirecting
  return <p>Redirecting...</p>;
};

export default HomePage;
