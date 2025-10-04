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
      className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
        <div className={`p-4 rounded-2xl ${color} shadow-lg`}>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Dashboard</h1>
            <p className="text-gray-600 text-lg">Welcome back, <span className="font-semibold text-blue-600">{user?.name}</span>!</p>
          </div>
          <Link
            to="/submit-expense"
            className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Submit New Expense</span>
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-100 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            This Month Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {company?.currency || '$'} {stats.monthlyTotal.toFixed(2)}
              </div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Submitted</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl font-bold text-green-600 mb-2">{stats.approved}</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Approved</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl font-bold text-yellow-600 mb-2">{stats.pending}</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Pending</div>
            </div>
          </div>
        </div>

        {/* Recent Expenses & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
                Recent Expenses
              </h3>
              <Link to="/my-expenses" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                View All →
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

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
              </svg>
              Quick Actions
            </h3>
            <div className="space-y-4">
              <Link
                to="/submit-expense"
                className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-center font-medium shadow-lg flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
                <span>Submit New Expense</span>
              </Link>
              <Link
                to="/my-expenses"
                className="block w-full bg-gray-50 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-100 transition-all duration-200 text-center font-medium border border-gray-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
                <span>View My Expenses</span>
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