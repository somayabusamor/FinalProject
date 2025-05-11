import { useRouter } from 'expo-router';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  FlatList, 
  ActivityIndicator, 
  Alert,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUsers, setShowUsers] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Declare baseUrl only once at the component level
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8082";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching from: ${baseUrl}/api/users`);
      
      const response = await axios.get(`${baseUrl}/api/users`, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.data?.success) {
        setUsers(response.data.data || []);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      let errorMessage = 'Failed to fetch users';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || 
                     error.message || 
                     'Network error occurred';
      }
      setError(errorMessage);
      console.error('Fetch error:', error);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  useEffect(() => {
    if (showUsers) {
      fetchUsers();
    }
  }, [showUsers]);

  const handleRoleManagement = (userId: string) => {
    // Implement role management logic here
    Alert.alert('Role Management', `Change role for user ${userId}`);
  };

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
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8b5e3c']}
            tintColor="#8b5e3c"
          />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Users</Text>
            <Text style={styles.statValue}>{users.length}</Text>
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
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: '#6d4c41' }]}
                onPress={() => setShowUsers(!showUsers)}
              >
                <Text style={styles.buttonText}>
                  {showUsers ? 'Hide Users' : 'View All Users'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: '#8d6e63' }]}
                onPress={() => router.push('/signup')}
              >
                <Text style={styles.buttonText}>Create New User</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: '#5d4037' }]}
                onPress={() => Alert.alert('Feature Coming Soon', 'Role management will be available in the next update')}
              >
                <Text style={styles.buttonText}>Manage Roles</Text>
              </TouchableOpacity>
            </View>

            {showUsers && (
              <View style={styles.usersTable}>
                {loading && !refreshing ? (
                  <ActivityIndicator size="large" color="#8b5e3c" />
                ) : error ? (
                  <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={40} color="#d9534f" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity 
                      style={styles.refreshButton}
                      onPress={fetchUsers}
                    >
                      <MaterialIcons name="refresh" size={20} color="#FFD700" />
                      <Text style={styles.refreshText}>Try Again</Text>
                    </TouchableOpacity>
                  </View>
                ) : users.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MaterialIcons name="people-outline" size={50} color="#8d6e63" />
                    <Text style={styles.emptyText}>No users found</Text>
                    <TouchableOpacity 
                      style={styles.refreshButton}
                      onPress={fetchUsers}
                    >
                      <MaterialIcons name="refresh" size={20} color="#FFD700" />
                      <Text style={styles.refreshText}>Refresh</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <FlatList
                    data={users}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                      <View style={styles.userRow}>
                        <Text style={styles.userCell}>{item.name}</Text>
                        <Text style={styles.userCell}>{item.email}</Text>
                        <Text style={[styles.userCell, 
                          item.role === 'admin' ? styles.adminRole : 
                          item.role === 'emergency' ? styles.emergencyRole : 
                          styles.localRole]}>
                          {item.role}
                        </Text>
                        <Text style={styles.userCell}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleRoleManagement(item._id)}
                        >
                          <MaterialIcons name="edit" size={18} color="#8b5e3c" />
                        </TouchableOpacity>
                      </View>
                    )}
                    ListHeaderComponent={() => (
                      <View style={[styles.userRow, styles.headerRow]}>
                        <Text style={styles.headerCell}>Name</Text>
                        <Text style={styles.headerCell}>Email</Text>
                        <Text style={styles.headerCell}>Role</Text>
                        <Text style={styles.headerCell}>Joined</Text>
                        <Text style={styles.headerCell}>Actions</Text>
                      </View>
                    )}
                  />
                )}
              </View>
            )}
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
  usersTable: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerRow: {
    backgroundColor: '#6d4c41',
  },
  headerCell: {
    color: '#FFD700',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  userCell: {
    flex: 1,
    textAlign: 'center',
    color: '#5d4037',
  },
  // Add these new styles:
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#d9534f',
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6d4c41',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  refreshText: {
    color: '#FFD700',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#8d6e63',
    fontSize: 16,
    marginVertical: 10,
  },
  actionButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#f0e6e2',
  },
  adminRole: {
    color: '#d9534f',
    fontWeight: 'bold',
  },
  emergencyRole: {
    color: '#f0ad4e',
    fontWeight: 'bold',
  },
  localRole: {
    color: '#5cb85c',
    fontWeight: 'bold',
  },

});