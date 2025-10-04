import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingApprovals: 0,
    totalUsers: 0,
    monthlyTotal: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [expensesResponse, pendingResponse] = await Promise.all([
        axios.get('http://localhost:5000/expenses'),
        axios.get('http://localhost:5000/approvals/pending')
      ]);
      
      const expenses = expensesResponse.data;
      const pending = pendingResponse.data;
      
      setStats({
        totalExpenses: expenses.length,
        pendingApprovals: pending.length,
        totalUsers: new Set(expenses.map((e: any) => e.employeeId)).size,
        monthlyTotal: expenses.reduce((sum: number, e: any) => sum + e.convertedAmount, 0)
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Expenses"
            value={stats.totalExpenses}
            subtitle="All company expenses"
            icon="📊"
            color="bg-blue-100"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            subtitle="Awaiting review"
            icon="⏳"
            color="bg-yellow-100"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            subtitle="Active employees"
            icon="👥"
            color="bg-green-100"
          />
          <StatCard
            title="Monthly Total"
            value={`$${stats.monthlyTotal.toFixed(2)}`}
            subtitle="This month's expenses"
            icon="💰"
            color="bg-purple-100"
          />
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;