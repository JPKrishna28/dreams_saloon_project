import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Calendar as CalendarIcon,
  Users as UsersIcon,
  CreditCard as CreditCardIcon,
  Settings as SettingsIcon,
  BarChart3 as BarChart3Icon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  TrendingUp as TrendingUpIcon,
  User as UserIcon,
  Shield as ShieldIcon,
  Crown as CrownIcon,
  Star as StarIcon
} from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    todayAppointments: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    pendingTasks: 0,
    recentActivity: [],
    performanceStats: {}
  });
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data based on user role
        const mockData = getMockDataForRole(user?.role);
        setDashboardData(mockData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const getMockDataForRole = (role) => {
    const baseData = {
      todayAppointments: 8,
      totalCustomers: 156,
      monthlyRevenue: 45000,
      pendingTasks: 3,
      recentActivity: [
        { id: 1, action: 'Appointment completed', time: '10 minutes ago', type: 'success' },
        { id: 2, action: 'New customer registered', time: '1 hour ago', type: 'info' },
        { id: 3, action: 'Payment received', time: '2 hours ago', type: 'success' },
        { id: 4, action: 'Appointment scheduled', time: '3 hours ago', type: 'info' }
      ]
    };

    switch (role?.toLowerCase()) {
      case 'admin':
        return {
          ...baseData,
          todayAppointments: 25,
          totalCustomers: 890,
          monthlyRevenue: 185000,
          pendingTasks: 8,
          performanceStats: {
            totalStaff: 12,
            activeServices: 15,
            customerSatisfaction: 4.8,
            monthlyGrowth: 12.5
          }
        };
      case 'manager':
        return {
          ...baseData,
          todayAppointments: 18,
          totalCustomers: 450,
          monthlyRevenue: 85000,
          pendingTasks: 5,
          performanceStats: {
            teamMembers: 6,
            completedAppointments: 124,
            customerRating: 4.6,
            efficiency: 92
          }
        };
      default:
        return {
          ...baseData,
          performanceStats: {
            appointmentsToday: 8,
            customerRating: 4.7,
            earnings: 2800,
            efficiency: 88
          }
        };
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return <CrownIcon className="h-5 w-5 text-red-500" />;
      case 'manager': return <ShieldIcon className="h-5 w-5 text-blue-500" />;
      default: return <UserIcon className="h-5 w-5 text-green-500" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getQuickActions = (role, permissions = {}) => {
    const actions = [];

    // Common actions for all roles
    if (permissions.canManageAppointments) {
      actions.push({
        title: 'View Appointments',
        icon: CalendarIcon,
        href: '/admin/appointments',
        color: 'bg-blue-500 hover:bg-blue-600'
      });
    }

    if (permissions.canManageCustomers) {
      actions.push({
        title: 'Customer Management',
        icon: UsersIcon,
        href: '/admin/customers',
        color: 'bg-green-500 hover:bg-green-600'
      });
    }

    if (permissions.canManageBilling) {
      actions.push({
        title: 'Billing & Payments',
        icon: CreditCardIcon,
        href: '/admin/billing',
        color: 'bg-purple-500 hover:bg-purple-600'
      });
    }

    // Admin specific actions
    if (role === 'admin') {
      actions.push({
        title: 'Staff Management',
        icon: ShieldIcon,
        href: '/admin/staff',
        color: 'bg-red-500 hover:bg-red-600'
      });
      
      if (permissions.canViewReports) {
        actions.push({
          title: 'Reports & Analytics',
          icon: BarChart3Icon,
          href: '/admin/reports',
          color: 'bg-indigo-500 hover:bg-indigo-600'
        });
      }
    }

    if (permissions.canAccessSettings) {
      actions.push({
        title: 'Settings',
        icon: SettingsIcon,
        href: '/admin/settings',
        color: 'bg-gray-500 hover:bg-gray-600'
      });
    }

    return actions;
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const userPermissions = user?.permissions || {};
  const quickActions = getQuickActions(user?.role, userPermissions);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Staff Member'}!
            </h1>
            <p className="text-gray-600 mt-1">Here's what's happening at Dreams Saloon today</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`flex items-center px-3 py-2 rounded-full border ${getRoleBadgeColor(user?.role)}`}>
              {getRoleIcon(user?.role)}
              <span className="ml-2 font-medium capitalize">{user?.role || 'Staff'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Appointments"
          value={dashboardData.todayAppointments}
          icon={CalendarIcon}
          color="bg-blue-500"
          subtitle="Scheduled for today"
        />
        <StatCard
          title="Total Customers"
          value={dashboardData.totalCustomers}
          icon={UsersIcon}
          color="bg-green-500"
          subtitle="Active customers"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${dashboardData.monthlyRevenue.toLocaleString()}`}
          icon={TrendingUpIcon}
          color="bg-purple-500"
          subtitle="This month"
        />
        <StatCard
          title="Pending Tasks"
          value={dashboardData.pendingTasks}
          icon={AlertCircleIcon}
          color="bg-orange-500"
          subtitle="Need attention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className={`flex items-center p-4 rounded-lg text-white transition-colors ${action.color}`}
                >
                  <action.icon className="h-6 w-6 mr-3" />
                  <span className="font-medium">{action.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Performance Stats */}
          {dashboardData.performanceStats && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(dashboardData.performanceStats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-2xl font-bold text-gray-800">
                      {typeof value === 'number' ? 
                        (value % 1 === 0 ? value : value.toFixed(1)) : 
                        value
                      }
                      {key.includes('Rating') || key.includes('Satisfaction') ? (
                        <StarIcon className="inline h-5 w-5 text-yellow-500 ml-1" />
                      ) : null}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {dashboardData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-100' :
                  activity.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  <CheckCircleIcon className={`h-4 w-4 ${
                    activity.type === 'success' ? 'text-green-600' :
                    activity.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
        <div className="space-y-3">
          {[
            { time: '09:00 AM', customer: 'John Doe', service: 'Hair Cut' },
            { time: '10:30 AM', customer: 'Mike Smith', service: 'Beard Trim' },
            { time: '02:00 PM', customer: 'David Wilson', service: 'Hair Styling' },
            { time: '04:30 PM', customer: 'Robert Brown', service: 'Full Service' }
          ].map((appointment, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {appointment.time}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{appointment.customer}</p>
                  <p className="text-sm text-gray-600">{appointment.service}</p>
                </div>
              </div>
              <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;