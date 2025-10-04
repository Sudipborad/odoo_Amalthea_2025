import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const ManagerDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    approved: 0,
    rejected: 0,
    teamMembers: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [pendingResponse, teamResponse] = await Promise.all([
        axios.get('http://localhost:5000/approvals/pending'),
        axios.get('http://localhost:5000/team-expenses')
      ]);
      
      const pending = pendingResponse.data;
      const teamExpenses = teamResponse.data;
      
      setStats({
        pendingApprovals: pending.length,
        approved: teamExpenses.filter((e: any) => e.status === 'Approved').length,
        rejected: teamExpenses.filter((e: any) => e.status === 'Rejected').length,
        teamMembers: new Set(teamExpenses.map((e: any) => e.employeeId)).size
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
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            subtitle="Awaiting your review"
            icon="⏳"
            color="bg-yellow-100"
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
          />
        </div>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;