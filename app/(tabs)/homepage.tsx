import React, { useEffect, useState } from "react";
import EmergencyPage from "../EmergencyPage";
import WorkerPage from "./local";
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomePage: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const getRole = async () => {
      const storedRole = await AsyncStorage.getItem("userRole");
      console.log("Stored role:", storedRole);
      setRole(storedRole);
    };
    getRole();
  }, []);

  if (!role) {
    return <p>Loading...</p>;
  }

  return (
    <>
      {role === "emergency" && <EmergencyPage />}
      {role === "local" && <WorkerPage />}
    </>
  );
};

export default HomePage;
