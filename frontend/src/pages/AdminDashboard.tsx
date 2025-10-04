import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { expenseAPI, approvalAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { company } = useAuth();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingApprovals: 0,
    totalUsers: 0,
    monthlyTotal: 0,
    approvedCount: 0,
    rejectedCount: 0
  });
  const [recentExpenses, setRecentExpenses] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentExpenses();
  }, []);

  const fetchStats = async () => {
    try {
      const [expensesResponse, pendingResponse] = await Promise.all([
        expenseAPI.getAllExpenses(),
        approvalAPI.getPendingApprovals()
      ]);
      
      const expenses = expensesResponse.data;
      const pending = pendingResponse.data;
      
      const currentMonth = new Date().getMonth();
      const monthlyExpenses = expenses.filter((e: any) => 
        new Date(e.createdAt).getMonth() === currentMonth
      );
      
      setStats({
        totalExpenses: expenses.length,
        pendingApprovals: pending.length,
        totalUsers: new Set(expenses.map((e: any) => e.employeeId?._id)).size,
        monthlyTotal: monthlyExpenses.reduce((sum: number, e: any) => sum + (e.convertedAmount || 0), 0),
        approvedCount: expenses.filter((e: any) => e.status === 'Approved').length,
        rejectedCount: expenses.filter((e: any) => e.status === 'Rejected').length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentExpenses = async () => {
    try {
      const response = await expenseAPI.getAllExpenses();
      setRecentExpenses(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent expenses:', error);
    }
  };

  const handleOverrideApproval = async (expenseId: string, status: 'Approved' | 'Rejected') => {
    try {
      await approvalAPI.overrideApproval(expenseId, status);
      fetchStats();
      fetchRecentExpenses();
    } catch (error) {
      console.error('Error overriding approval:', error);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }: any) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% from last month
            </p>
          )}
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">{company?.name} • {company?.currency}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Expenses"
            value={stats.totalExpenses}
            subtitle="All company expenses"
            icon="📊"
            color="bg-blue-100"
            trend={12}
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            subtitle="Awaiting review"
            icon="⏳"
            color="bg-yellow-100"
          />
          <StatCard
            title="Active Users"
            value={stats.totalUsers}
            subtitle="Employees with expenses"
            icon="👥"
            color="bg-green-100"
          />
          <StatCard
            title="Monthly Total"
            value={`${company?.currency || '$'} ${stats.monthlyTotal.toFixed(2)}`}
            subtitle="This month's expenses"
            icon="💰"
            color="bg-purple-100"
            trend={-5}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Approved</span>
                <span className="text-sm font-medium text-green-600">{stats.approvedCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-medium text-yellow-600">{stats.pendingApprovals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rejected</span>
                <span className="text-sm font-medium text-red-600">{stats.rejectedCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
            <div className="space-y-3">
              {recentExpenses.map((expense: any) => (
                <div key={expense._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{expense.category}</p>
                    <p className="text-xs text-gray-500">{expense.employeeId?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{expense.originalCurrency} {expense.originalAmount}</p>
                    <div className="flex space-x-1 mt-1">
                      {expense.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleOverrideApproval(expense._id, 'Approved')}
                            className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOverrideApproval(expense._id, 'Rejected')}
                            className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {expense.status !== 'Pending' && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          expense.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {expense.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;