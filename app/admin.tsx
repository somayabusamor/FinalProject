import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/addVillage')}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Village</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Users</Text>
            <Text style={styles.statValue}>521</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Reports</Text>
            <Text style={styles.statValue}>42</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending Actions</Text>
            <Text style={styles.statValue}>15</Text>
          </View>
          <View style={[styles.statCard, { borderBottomColor: '#4CAF50' }]}>
            <Text style={styles.statLabel}>System Health</Text>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>100%</Text>
          </View>
        </View>

        {/* Admin Tools */}
        <View style={styles.toolsContainer}>
          {/* User Management */}
          <View style={styles.toolCard}>
            <Text style={styles.toolTitle}>User Management</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#2196F3' }]}>
                <Text style={styles.buttonText}>View All Users</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.buttonText}>Create New User</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#FFC107' }]}>
                <Text style={styles.buttonText}>Manage Roles</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* System Controls */}
          <View style={styles.toolCard}>
            <Text style={styles.toolTitle}>System Controls</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#F44336' }]}>
                <Text style={styles.buttonText}>Emergency Broadcast</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#9C27B0' }]}>
                <Text style={styles.buttonText}>Database Backup</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#607D8B' }]}>
                <Text style={styles.buttonText}>System Logs</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#7B1FA2',
    paddingTop: 50,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderBottomWidth: 3,
    borderBottomColor: '#2196F3',
  },
  statLabel: {
    color: '#757575',
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  toolsContainer: {
    marginBottom: 20,
  },
  toolCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#212121',
  },
  buttonGroup: {
    marginTop: 10,
  },
  button: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});