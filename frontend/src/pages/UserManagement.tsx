import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { userAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [backendUser, setBackendUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    managerId: ''
  });

  useEffect(() => {
    testBackendUser();
    fetchUsers();
  }, []);

  const testBackendUser = async () => {
    try {
      const response = await fetch('http://localhost:5000/users/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBackendUser(data.user);
      }
    } catch (error) {
      console.error('Error testing backend user:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await userAPI.createUser(formData);
      setShowForm(false);
      setFormData({ name: '', email: '', password: '', role: 'Employee', managerId: '' });
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      setError(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await userAPI.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      setError(error.response?.data?.error || 'Failed to update role');
    }
  };

  const handleManagerChange = async (userId: string, managerId: string) => {
    try {
      await userAPI.assignManager(userId, managerId);
      fetchUsers();
    } catch (error: any) {
      console.error('Error assigning manager:', error);
      setError(error.response?.data?.error || 'Failed to assign manager');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-600">Frontend user role: {user?.role}</p>
            <p className="text-sm text-gray-600">Backend user role: {backendUser?.role || 'Loading...'}</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add User
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Add New User</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
              <select
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Manager (Optional)</option>
                {users.filter((u: any) => u.role === 'Manager').map((manager: any) => (
                  <option key={manager._id} value={manager._id}>{manager.name}</option>
                ))}
              </select>
              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">All Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user: any) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={user.managerId || ''}
                        onChange={(e) => handleManagerChange(user._id, e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                        disabled={user.role !== 'Employee'}
                      >
                        <option value="">No Manager</option>
                        {users.filter((u: any) => u.role === 'Manager' && u._id !== user._id).map((manager: any) => (
                          <option key={manager._id} value={manager._id}>{manager.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-primary hover:text-blue-600">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserManagement;