import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { IconSymbol } from '@/frontend/components/ui/IconSymbol';
import TabBarBackground from '@/frontend/components/ui/TabBarBackground';
import { HapticTab } from '@/frontend/components/HapticTab';
import { useColorScheme } from '@/frontend/hooks/useColorScheme';
import { Colors } from '@/frontend/constants/Colors';
import { I18nManager } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  useEffect(() => {
    I18nManager.forceRTL(I18nManager.isRTL);
  }, []);

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
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
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
      <Tabs.Screen
        name="SubmitUpdate"
        options={{
          title: 'Update',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
          href: null, // This hides it from the tab bar

        }}
      />
      {/* 👇 Hidden tab: 'local' */}
      <Tabs.Screen
        name="local"
        options={{
          href: null, // This hides it from the tab bar
        }}
      />
      <Tabs.Screen
        name="location"
        options={{
          title: 'location',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="location.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
