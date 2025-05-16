import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconSymbol } from '@/frontend/components/ui/IconSymbol';
import TabBarBackground from '@/frontend/components/ui/TabBarBackground';
import { HapticTab } from '@/frontend/components/HapticTab';
import { useColorScheme } from '@/frontend/hooks/useColorScheme';
import { Colors } from '@/frontend/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('userRole');
        setRole(storedRole);
      } catch (error) {
        console.error('Error fetching role from AsyncStorage:', error);
      }
    };
    fetchRole();
  }, []);

  if (!role) {
    return null; // You could show a loading indicator here instead
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          ...Platform.select({
            ios: {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            },
            default: {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            },
          }),
        },
      }}
    >
      <Tabs.Screen
        name="homepage"
        options={{
          title: 'HomePage',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      {/* Show for everyone */}
      <Tabs.Screen
        name="ContactUs"
        options={{
          title: 'Contact Us',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="envelope.fill" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="AboutUs"
        options={{
          title: 'About Us',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="info.circle.fill" color={color} />,
        }}
      />

      {/* Only show location tab for non-emergency roles */}
      {role !== 'emergency' && (
        <Tabs.Screen
          name="location"
          options={{
            title: 'Location',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="location.fill" color={color} />,
          }}
        />
      )}

      {/* If you had a local tab, you would conditionally render it like this: */}
      {/* {role !== 'emergency' && (
        <Tabs.Screen
          name="local"
          options={{
            title: 'Local',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
          }}
        />
      )} */}
    </Tabs>
  );
}