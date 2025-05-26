import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';

export default function LocalPage() {
  return (
    <View style={{ flex: 1 }}>
      {/* Scrollable Content */}
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons name="people" size={32} color="#FFD700" />
          <Text style={styles.headerText}>Local Resident Dashboard</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Card 1 - Alerts */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="notifications" size={24} color="#6d4c41" />
              <Text style={styles.cardTitle}>Community Alerts</Text>
            </View>
            <View style={styles.alertItem}>
              <MaterialIcons name="warning" size={16} color="#d32f2f" />
              <Text style={styles.alertText}>New road construction</Text>
            </View>
            <View style={styles.alertItem}>
              <MaterialIcons name="event" size={16} color="#6d4c41" />
              <Text style={styles.alertText}>Upcoming town meeting</Text>
            </View>
            <View style={styles.alertItem}>
              <MaterialIcons name="water" size={16} color="#2196F3" />
              <Text style={styles.alertText}>Water maintenance notice</Text>
            </View>
          </View>

          {/* Card 2 - Quick Actions */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="bolt" size={24} color="#6d4c41" />
              <Text style={styles.cardTitle}>Quick Actions</Text>
            </View>
            <TouchableOpacity style={styles.goldButton}>
              <MaterialIcons name="report" size={20} color="#6d4c41" />
              <Text style={styles.goldButtonText}>Report Issue</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.brownButton}
              onPress={() => router.push('/location')}
            >
              <MaterialIcons name="map" size={20} color="#FFD700" />
              <Text style={styles.brownButtonText}>Update Map</Text>
            </TouchableOpacity>
          </View>

          {/* Card 3 - Updates */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="new-releases" size={24} color="#6d4c41" />
              <Text style={styles.cardTitle}>Recent Updates</Text>
            </View>
            <Text style={styles.updateText}>
              Latest community news and updates will appear here. Check back regularly for important information.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f5',
  },
  header: {
    backgroundColor: '#6d4c41',
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
    color: '#FFD700',
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
    color: '#6d4c41',
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
    color: '#5d4037',
    marginLeft: 10,
  },
  goldButton: {
    backgroundColor: '#FFD700',
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
    color: '#6d4c41',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  brownButton: {
    backgroundColor: '#8d6e63',
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
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  updateText: {
    color: '#8d6e63',
    fontSize: 16,
    lineHeight: 24,
  },
});
