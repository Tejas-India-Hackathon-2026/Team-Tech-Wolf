import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DiseaseDetectionPage from './pages/DiseaseDetectionPage';
import WeatherIntelligencePage from './pages/WeatherIntelligencePage';
import MachineryRentalPage from './pages/MachineryRentalPage';
import MarketIntelligencePage from './pages/MarketIntelligencePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotificationsPage from './pages/NotificationsPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Application Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/disease-detection" element={<DiseaseDetectionPage />} />
              <Route path="/weather-intelligence" element={<WeatherIntelligencePage />} />
              <Route path="/machinery-rental" element={<MachineryRentalPage />} />
              <Route path="/market-intelligence" element={<MarketIntelligencePage />} />
              
              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Notifications Center */}
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                } 
              />

              {/* Role-Protected Dashboards */}
              {/* 1. Farmer Dashboard */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />

              {/* 2. Machinery Owner Dashboard */}
              <Route 
                path="/owner/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['machine_owner']}>
                    <OwnerDashboardPage />
                  </ProtectedRoute>
                } 
              />

              {/* 3. Admin Dashboard */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Alias for /admin -> /admin/dashboard */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
