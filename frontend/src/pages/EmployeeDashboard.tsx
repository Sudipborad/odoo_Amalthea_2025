import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const EmployeeDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/expenses/me');
      const expenses = response.data;
      setStats({
        total: expenses.length,
        pending: expenses.filter((e: any) => e.status === 'Pending').length,
        approved: expenses.filter((e: any) => e.status === 'Approved').length,
        rejected: expenses.filter((e: any) => e.status === 'Rejected').length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color }: any) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Expenses"
            value={stats.total}
            subtitle="All submissions"
            icon="📊"
            color="bg-blue-100"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            subtitle="Awaiting approval"
            icon="⏳"
            color="bg-yellow-100"
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            subtitle="Successfully processed"
            icon="✅"
            color="bg-green-100"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            subtitle="Declined submissions"
            icon="❌"
            color="bg-red-100"
          />
        </div>

        <div className="fixed bottom-6 right-6">
          <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span className="text-sm font-medium">Successfully logged in!</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;