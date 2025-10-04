import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { approvalAPI, expenseAPI } from '../api';
import { Link } from 'react-router-dom';

const ManagerDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    approved: 0,
    rejected: 0,
    teamMembers: 0
  });
  const [pendingExpenses, setPendingExpenses] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchPendingExpenses();
  }, []);

  const fetchStats = async () => {
    try {
      const [pendingResponse, teamResponse] = await Promise.all([
        approvalAPI.getPendingApprovals(),
        expenseAPI.getAllExpenses()
      ]);
      
      const pending = pendingResponse.data;
      const teamExpenses = teamResponse.data;
      
      const currentMonth = new Date().getMonth();
      const monthlyExpenses = teamExpenses.filter((e: any) => 
        new Date(e.createdAt).getMonth() === currentMonth
      );
      
      setStats({
        pendingApprovals: pending.length,
        approved: monthlyExpenses.filter((e: any) => e.status === 'Approved').length,
        rejected: monthlyExpenses.filter((e: any) => e.status === 'Rejected').length,
        teamMembers: new Set(teamExpenses.map((e: any) => e.employeeId?._id)).size
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPendingExpenses = async () => {
    try {
      const response = await approvalAPI.getPendingApprovals();
      setPendingExpenses(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching pending expenses:', error);
    }
  };

  const handleQuickApproval = async (expenseId: string, decision: 'Approved' | 'Rejected') => {
    try {
      await approvalAPI.processApproval(expenseId, decision, `Quick ${decision.toLowerCase()} from dashboard`);
      fetchStats();
      fetchPendingExpenses();
    } catch (error) {
      console.error('Error processing approval:', error);
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
          <Link
            to="/approvals"
            className="mt-4 sm:mt-0 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            View All Approvals
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            subtitle="Awaiting your review"
            icon="⏳"
            color="bg-yellow-100"
            onClick={() => window.location.href = '/approvals'}
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            subtitle="This month"
            icon="✅"
            color="bg-green-100"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            subtitle="This month"
            icon="❌"
            color="bg-red-100"
          />
          <StatCard
            title="Team Members"
            value={stats.teamMembers}
            subtitle="Reporting to you"
            icon="👥"
            color="bg-blue-100"
            onClick={() => window.location.href = '/team-expenses'}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Pending Approvals</h3>
              <Link to="/approvals" className="text-primary hover:text-blue-600 text-sm">
                View All
              </Link>
            </div>
            
            {pendingExpenses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl text-gray-300 mb-2">✅</div>
                <p className="text-gray-500">No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingExpenses.map((expense: any) => (
                  <div key={expense._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{expense.category}</h4>
                        <p className="text-sm text-gray-600">
                          {expense.employeeId?.name} • {expense.originalCurrency} {expense.originalAmount}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{expense.description}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleQuickApproval(expense._id, 'Approved')}
                        className="flex-1 bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleQuickApproval(expense._id, 'Rejected')}
                        className="flex-1 bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        ❌ Reject
                      </button>
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
                to="/approvals"
                className="block w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors text-center"
              >
                📋 Review Pending Approvals
              </Link>
              <Link
                to="/team-expenses"
                className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                👥 View Team Expenses
              </Link>
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">This Month Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                    <div className="text-xs text-gray-500">Approved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                    <div className="text-xs text-gray-500">Rejected</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;