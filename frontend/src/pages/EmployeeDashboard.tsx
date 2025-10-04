import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { expenseAPI } from '../api';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const EmployeeDashboard: React.FC = () => {
  const { user, company } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    monthlyTotal: 0
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [showSuccess, setShowSuccess] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentExpenses();
    
    // Hide success message after 5 seconds
    const timer = setTimeout(() => setShowSuccess(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await expenseAPI.getMyExpenses();
      const expenses = response.data;
      
      const currentMonth = new Date().getMonth();
      const monthlyExpenses = expenses.filter((e: any) => 
        new Date(e.createdAt).getMonth() === currentMonth
      );
      
      setStats({
        total: expenses.length,
        pending: expenses.filter((e: any) => e.status === 'Pending').length,
        approved: expenses.filter((e: any) => e.status === 'Approved').length,
        rejected: expenses.filter((e: any) => e.status === 'Rejected').length,
        monthlyTotal: monthlyExpenses.reduce((sum: number, e: any) => sum + (e.convertedAmount || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentExpenses = async () => {
    try {
      const response = await expenseAPI.getMyExpenses();
      setRecentExpenses(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching recent expenses:', error);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, onClick }: any) => (
    <div 
      className={`bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}!</p>
          </div>
          <Link
            to="/submit-expense"
            className="mt-4 sm:mt-0 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            📝 Submit New Expense
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Expenses"
            value={stats.total}
            subtitle="All submissions"
            icon="📊"
            color="bg-blue-100"
            onClick={() => window.location.href = '/my-expenses'}
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

        {/* Monthly Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {company?.currency || '$'} {stats.monthlyTotal.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Total Submitted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-500">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </div>
        </div>

        {/* Recent Expenses & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
              <Link to="/my-expenses" className="text-primary hover:text-blue-600 text-sm">
                View All
              </Link>
            </div>
            
            {recentExpenses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl text-gray-300 mb-2">📋</div>
                <p className="text-gray-500 mb-4">No expenses submitted yet</p>
                <Link
                  to="/submit-expense"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Submit Your First Expense
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map((expense: any) => (
                  <div key={expense._id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{expense.category}</p>
                      <p className="text-sm text-gray-600">{expense.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{expense.originalCurrency} {expense.originalAmount}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                        {expense.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/submit-expense"
                className="block w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors text-center"
              >
                📝 Submit New Expense
              </Link>
              <Link
                to="/my-expenses"
                className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                📋 View My Expenses
              </Link>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Tips</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Upload receipts for faster processing</li>
                  <li>• Add detailed descriptions</li>
                  <li>• Submit expenses within 30 days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg max-w-sm">
              <div className="flex items-center space-x-2">
                <span>✅</span>
                <span className="text-sm font-medium">Successfully logged in!</span>
                <button 
                  onClick={() => setShowSuccess(false)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;