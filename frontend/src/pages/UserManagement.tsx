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
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [backendUser, setBackendUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState('All');
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
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
      setFilteredUsers(response.data);
      setError('');
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.error || 'Failed to fetch users');
    }
  };

  const filterUsers = (role: string) => {
    setRoleFilter(role);
    if (role === 'All') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter((u: any) => u.role === role));
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

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        await userAPI.deleteUser(userId);
        fetchUsers();
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <div className="flex gap-2 mt-2">
              {['All', 'Employee', 'Manager', 'Finance', 'Director', 'CFO', 'Admin'].map(role => (
                <button
                  key={role}
                  onClick={() => filterUsers(role)}
                  className={`px-3 py-1 text-sm rounded ${roleFilter === role ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {role}
                </button>
              ))}
            </div>
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
                <option value="Finance">Finance</option>
                <option value="Director">Director</option>
                <option value="CFO">CFO</option>
                <option value="Admin">Admin</option>
              </select>
              {formData.role === 'Employee' && (
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Manager (Optional)</option>
                  {users.filter((u: any) => ['Manager', 'Finance', 'Director', 'CFO'].includes(u.role)).map((manager: any) => (
                    <option key={manager._id} value={manager._id}>{manager.name} ({manager.role})</option>
                  ))}
                </select>
              )}
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
                {filteredUsers.map((user: any) => (
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
                        <option value="Finance">Finance</option>
                        <option value="Director">Director</option>
                        <option value="CFO">CFO</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    {user.role === 'Employee' ? (
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={user.managerId?._id || user.managerId || ''}
                          onChange={(e) => handleManagerChange(user._id, e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="">No Manager</option>
                          {users.filter((u: any) => ['Manager', 'Finance', 'Director', 'CFO'].includes(u.role) && u._id !== user._id).map((manager: any) => (
                            <option key={manager._id} value={manager._id}>{manager.name} ({manager.role})</option>
                          ))}
                        </select>
                      </td>
                    ) : (
                      <td className="px-6 py-4 text-sm text-gray-500">-</td>
                    )}
                    <td className="px-6 py-4 text-sm">
                      <button 
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
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