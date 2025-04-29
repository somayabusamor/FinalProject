import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export default function LocalDashboard() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#2563eb', padding: 16 }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Local Resident Dashboard</Text>
      </View>

      {/* Main Content */}
      <View style={{ padding: 16 }}>
        {/* Card 1 */}
        <View style={{ backgroundColor: 'white', padding: 16, marginBottom: 16, borderRadius: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Community Alerts</Text>
          <Text>• New road construction</Text>
          <Text>• Upcoming town meeting</Text>
          <Text>• Water maintenance notice</Text>
        </View>

        {/* Card 2 */}
        <View style={{ backgroundColor: 'white', padding: 16, marginBottom: 16, borderRadius: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Quick Actions</Text>
          <TouchableOpacity style={{ backgroundColor: '#22c55e', padding: 12, borderRadius: 8, marginBottom: 8 }}>
            <Text style={{ color: 'white', textAlign: 'center' }}>Report Issue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: '#3b82f6', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: 'white', textAlign: 'center' }}>Contact Authorities</Text>
          </TouchableOpacity>
        </View>

        {/* Card 3 */}
        <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Recent Updates</Text>
          <Text style={{ color: '#6b7280' }}>Latest community news and updates will appear here.</Text>
        </View>
      </View>
    </ScrollView>
  );
}
