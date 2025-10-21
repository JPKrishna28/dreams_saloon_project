import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors as ScissorsIcon, Eye as EyeIcon, EyeOff as EyeOffIcon, Loader as LoaderIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      toast.error('Please enter username');
      return;
    }
    
    if (!formData.password.trim()) {
      toast.error('Please enter password');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login({
        username: formData.username.trim(),
        password: formData.password
      });

      if (result.success) {
        const from = location.state?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      }
    } catch (error) {
      // Error is already handled in the auth context
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setFormData({
      username: 'admin',
      password: 'admin123'
    });
    
    setLoading(true);
    
    try {
      const result = await login({
        username: 'admin',
        password: 'admin123'
      });

      if (result.success) {
        const from = location.state?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Demo login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-red rounded-full p-4">
              <ScissorsIcon className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary-black mb-2">
            Dreams Saloon
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Admin Panel Login
          </p>
          <p className="text-sm text-gray-500">
            Manage your barbershop business
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter your username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex justify-center items-center space-x-2 py-3"
              >
                {loading ? (
                  <>
                    <LoaderIcon className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </div>

            {/* Demo Login Button */}
            <div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full btn-outline flex justify-center items-center space-x-2 py-3"
              >
                {loading ? (
                  <>
                    <LoaderIcon className="h-5 w-5 animate-spin" />
                    <span>Loading Demo...</span>
                  </>
                ) : (
                  <span>Demo Login (admin/admin123)</span>
                )}
              </button>
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Need help?</span>
              </div>
            </div>

            <div className="mt-4 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Contact system administrator for login credentials
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
                <a 
                  href="tel:9963388556" 
                  className="text-primary-red hover:underline"
                >
                  Ramesh: 9963388556
                </a>
                <a 
                  href="tel:9666699201" 
                  className="text-primary-red hover:underline"
                >
                  Rambabu: 9666699201
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-primary-red transition-colors duration-200"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Features Info */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-primary-black mb-4 text-center">
            Admin Panel Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-red rounded-full"></div>
                <span>Customer Management</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-red rounded-full"></div>
                <span>Appointment Scheduling</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-red rounded-full"></div>
                <span>Employee Management</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-red rounded-full"></div>
                <span>Billing & Invoicing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-red rounded-full"></div>
                <span>Daily Income Reports</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-red rounded-full"></div>
                <span>Performance Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;