import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeProfile from './pages/EmployeeProfile';
import EmployeesDashboard from './pages/EmployeesDashboard';
import MyTeam from './pages/MyTeam';
import Interviews from './pages/Interviews';
import SystemLogs from './pages/SystemLogs';
import CandidateDashboard from './pages/CandidateDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/profile" replace />} />
            <Route path="employees" element={<EmployeesDashboard />} />
            <Route path="profile" element={<EmployeeProfile />} />
            <Route path="profile/:id" element={<EmployeeProfile />} />
            <Route path="manager" element={<Navigate to="/myteam" replace />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="myteam" element={<MyTeam />} />
            <Route path="candidate-dashboard" element={<CandidateDashboard />} />
            <Route path="interviews" element={<Interviews />} />
            <Route path="systemlogs" element={<SystemLogs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}