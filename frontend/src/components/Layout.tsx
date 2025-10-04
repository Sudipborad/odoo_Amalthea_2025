import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (user?.role === 'Employee') {
      return [
        { name: 'Dashboard', path: '/employee', icon: '📊' },
        { name: 'Submit Expense', path: '/submit-expense', icon: '📝' },
        { name: 'My Expenses', path: '/my-expenses', icon: '📋' },
      ];
    }
    if (user?.role === 'Manager') {
      return [
        { name: 'Dashboard', path: '/manager', icon: '📊' },
        { name: 'Approvals', path: '/approvals', icon: '✅' },
        { name: 'Team Expenses', path: '/team-expenses', icon: '👥' },
      ];
    }
    if (user?.role === 'Admin') {
      return [
        { name: 'Dashboard', path: '/admin', icon: '📊' },
        { name: 'Approvals', path: '/approvals', icon: '✅' },
        { name: 'Team Expenses', path: '/team-expenses', icon: '👥' },
      ];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-secondary text-white px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 md:space-x-8">
            <h1 className="text-xl font-bold">ExpenseFlow</h1>
            <div className="hidden md:flex space-x-1">
              {getNavItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden md:block">
              {user?.email} ({user?.role.toLowerCase()})
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 hover:bg-gray-700 px-3 py-2 rounded"
            >
              <span>🚪</span>
              <span className="hidden md:block">Logout</span>
            </button>
          </div>
        </div>
        <div className="md:hidden mt-3 flex space-x-1 overflow-x-auto">
          {getNavItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-700'
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
};

export default Layout;