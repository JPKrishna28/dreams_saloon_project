import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Import components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Appointments from './pages/Appointments';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminAppointments from './pages/AdminAppointments';
import CustomerManagement from './pages/CustomerManagement';
import ServiceManagement from './pages/ServiceManagement';
import FeedbackForm from './pages/FeedbackForm';
import FeedbackManagement from './pages/FeedbackManagement';
import FeedbackPage from './pages/feedback/FeedbackPage';
import StaffManagement from './pages/StaffManagement';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><Navbar /><Home /></>} />
            <Route path="/appointments" element={<><Navbar /><Appointments /></>} />
            <Route path="/feedback/:appointmentId" element={<FeedbackForm />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/appointments" element={
              <ProtectedRoute>
                <AdminAppointments />
              </ProtectedRoute>
            } />
            <Route path="/admin/customers" element={
              <ProtectedRoute>
                <CustomerManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/services" element={
              <ProtectedRoute>
                <ServiceManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/feedback" element={
              <ProtectedRoute>
                <FeedbackManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/staff" element={
              <ProtectedRoute>
                <StaffManagement />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;