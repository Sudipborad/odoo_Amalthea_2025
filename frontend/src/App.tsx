import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SubmitExpense from './pages/SubmitExpense';
import MyExpenses from './pages/MyExpenses';
import Approvals from './pages/Approvals';
import TeamExpenses from './pages/TeamExpenses';
import UserManagement from './pages/UserManagement';
import ApprovalRules from './pages/ApprovalRules';
import Analytics from './pages/Analytics';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Employee Routes */}
            <Route path="/employee" element={
              <ProtectedRoute role="Employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/submit-expense" element={
              <ProtectedRoute role="Employee">
                <SubmitExpense />
              </ProtectedRoute>
            } />
            <Route path="/my-expenses" element={
              <ProtectedRoute role="Employee">
                <MyExpenses />
              </ProtectedRoute>
            } />
            
            {/* Manager Routes */}
            <Route path="/manager" element={
              <ProtectedRoute role="Manager">
                <ManagerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/approvals" element={
              <ProtectedRoute role={["Manager", "Admin"]}>
                <Approvals />
              </ProtectedRoute>
            } />
            <Route path="/team-expenses" element={
              <ProtectedRoute role={["Manager", "Admin"]}>
                <TeamExpenses />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute role="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/cfo" element={
              <ProtectedRoute role="CFO">
                <ManagerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute role="Admin">
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/approval-rules" element={
              <ProtectedRoute role="Admin">
                <ApprovalRules />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute role={["Manager", "Admin"]}>
                <Analytics />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;