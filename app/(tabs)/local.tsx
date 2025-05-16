import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from
'react-native';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/frontend/context/LanguageProvider';
import { useTranslations } from '@/frontend/constants/locales';
import { I18nManager } from 'react-native';


export default function LocalPage() {
  const { language } = useLanguage();
  const  t  = useTranslations();
  return (
<View style={{ flex: 1, direction: I18nManager.isRTL ? 'rtl' : 'ltr' }}>
      {/* Tab Navigation */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#FFD700',
          tabBarInactiveTintColor: '#8d6e63',
          tabBarStyle: {
            backgroundColor: '#6d4c41',
            borderTopWidth: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: 'bold',
          },
        }}
      >
        <Tabs.Screen
          name="homepage"
          options={{
            title: t.tabs.home,
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="ContactUs"
          options={{
            title: t.tabs.contact,
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="contact-mail" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="AboutUs"
          options={{
            title: t.tabs.about,
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="info" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="SubmitUpdate"
          options={{
            title: t.tabs.update,
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="update" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: t.tabs.map,
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="map" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="location"
          options={{
            title: t.tabs.location,
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="location-on" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
  
      {/* Scrollable Content */}
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons name="people" size={32} color="#FFD700" />
          <Text style={styles.headerText}>{t.localPage.title}</Text>
        </View>
  
        {/* Main Content */}
        <View style={styles.content}>
          {/* Card 1 - Alerts */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="notifications" size={24} color="#6d4c41" />
              <Text style={styles.cardTitle}>{t.localPage.communityAlerts}</Text>
            </View>
            <View style={styles.alertItem}>
              <MaterialIcons name="warning" size={16} color="#d32f2f" />
              <Text style={styles.alertText}>{t.localPage.alerts.roadConstruction}</Text>
            </View>
            <View style={styles.alertItem}>
              <MaterialIcons name="event" size={16} color="#6d4c41" />
              <Text style={styles.alertText}>{t.localPage.alerts.townMeeting}</Text>
            </View>
            <View style={styles.alertItem}>
              <MaterialIcons name="water" size={16} color="#2196F3" />
              <Text style={styles.alertText}>{t.localPage.alerts.waterMaintenance}</Text>
            </View>
          </View>
  
          {/* Card 2 - Quick Actions */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="bolt" size={24} color="#6d4c41" />
              <Text style={styles.cardTitle}>{t.localPage.quick_actions}</Text>
            </View>
            <TouchableOpacity style={styles.goldButton}>
              <MaterialIcons name="report" size={20} color="#6d4c41" />
              <Text style={styles.goldButtonText}>{t.localPage.report_issue}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.brownButton}>
              <MaterialIcons name="contact-phone" size={20} color="#FFD700" />
              <Text style={styles.brownButtonText}>{t.localPage.contact_authorities}</Text>
            </TouchableOpacity>
          </View>
  
          {/* Card 3 - Updates */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="new-releases" size={24} color="#6d4c41" />
              <Text style={styles.cardTitle}>{t.localPage.updates}</Text>
            </View>
            <Text style={styles.updateText}>{t.localPage.updatesText}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f5', // Very light brown background
  },
  header: {
    backgroundColor: '#6d4c41', // Dark brown
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  headerText: {
    color: '#FFD700', // Gold
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0e6e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e6e2',
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6d4c41', // Dark brown
    marginLeft: 10,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 5,
  },
  alertText: {
    fontSize: 16,
    color: '#5d4037', // Slightly lighter brown
    marginLeft: 10,
  },
  goldButton: {
    backgroundColor: '#FFD700', // Gold
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  goldButtonText: {
    color: '#6d4c41', // Dark brown
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  brownButton: {
    backgroundColor: '#8d6e63', // Light brown
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  brownButtonText: {
    color: '#FFD700', // Gold
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  updateText: {
    color: '#8d6e63', // Light brown
    fontSize: 16,
    lineHeight: 24,
  },
});