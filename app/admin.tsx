import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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
              <MaterialIcons name="add" size={20} color="#FFD700" />
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
            <Text style={styles.statValue}>11</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Reports</Text>
            <Text style={styles.statValue}>4</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending Actions</Text>
            <Text style={styles.statValue}>1</Text>
          </View>
          <View style={[styles.statCard, { borderBottomColor: '#8d6e63' }]}>
            <Text style={styles.statLabel}>System Health</Text>
            <Text style={[styles.statValue, { color: '#8d6e63' }]}>100%</Text>
          </View>
        </View>

        {/* Admin Tools */}
        <View style={styles.toolsContainer}>
          {/* User Management */}
          <View style={styles.toolCard}>
            <Text style={styles.toolTitle}>User Management</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#6d4c41' }]}>
                <Text style={styles.buttonText}>View All Users</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#8d6e63' }]}>
                <Text style={styles.buttonText}>Create New User</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#5d4037' }]}>
                <Text style={styles.buttonText}>Manage Roles</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#6d4c41',
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
    color: '#FFD700',
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
    backgroundColor: '#8d6e63',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  addButtonText: {
    color: '#FFD700',
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
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderBottomWidth: 3,
    borderBottomColor: '#6d4c41',
    borderWidth: 1,
    borderColor: '#f0e6e2',
  },
  statLabel: {
    color: '#8d6e63',
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5d4037',
  },
  toolsContainer: {
    marginBottom: 20,
  },
  toolCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0e6e2',
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#6d4c41',
  },
  buttonGroup: {
    marginTop: 10,
  },
  button: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
});