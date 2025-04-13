// frontend/pages/admin-dashboard.tsx
import { useRouter } from 'expo-router';


export default function AdminDashboard() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-purple-700 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex space-x-4">
           
          
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold">1,248</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500">Active Reports</h3>
            <p className="text-3xl font-bold">42</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500">Pending Actions</h3>
            <p className="text-3xl font-bold">15</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500">System Health</h3>
            <p className="text-3xl font-bold text-green-500">100%</p>
          </div>
        </div>

        {/* Admin Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Management */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                View All Users
              </button>
              <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
                Create New User
              </button>
              <button className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600">
                Manage Roles
              </button>
            </div>
          </div>

          {/* System Controls */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">System Controls</h2>
            <div className="space-y-3">
              <button className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600">
                Emergency Broadcast
              </button>
              <button className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600">
                Database Backup
              </button>
              <button className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600">
                System Logs
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
