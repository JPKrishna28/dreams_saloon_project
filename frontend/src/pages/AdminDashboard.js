import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Users as UsersIcon, 
  CreditCard as CreditCardIcon, 
  TrendingUp as TrendingUpIcon,
  DollarSign as DollarSignIcon,
  Clock as ClockIcon,
  UserCheck as UserCheckIcon,
  AlertCircle as AlertCircleIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { appointmentAPI, billingAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    today: {
      appointments: [],
      totalAppointments: 0
    },
    thisWeek: {
      stats: { totalAppointments: 0, totalRevenue: 0 }
    },
    popularServices: []
  });
  const [billingStats, setBillingStats] = useState({
    overview: { totalRevenue: 0, totalBills: 0, avgBillAmount: 0 },
    paymentBreakdown: [],
    dailyRevenue: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch appointment stats
      const appointmentStatsResponse = await appointmentAPI.getDashboardStats();
      if (appointmentStatsResponse.data.success) {
        setDashboardStats(appointmentStatsResponse.data.data);
      }

      // Fetch billing stats
      const billingStatsResponse = await billingAPI.getStats();
      if (billingStatsResponse.data.success) {
        setBillingStats(billingStatsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate today's stats
  const todaysStats = dashboardStats.today.appointments.reduce(
    (acc, appointment) => {
      acc.total += appointment.count;
      acc.revenue += appointment.totalRevenue || 0;
      if (appointment._id === 'completed') {
        acc.completed += appointment.count;
      } else if (appointment._id === 'pending') {
        acc.pending += appointment.count;
      }
      return acc;
    },
    { total: 0, completed: 0, pending: 0, revenue: 0 }
  );

  // Prepare chart data
  const serviceChartData = dashboardStats.popularServices.map(service => ({
    name: service._id,
    appointments: service.count,
    revenue: service.revenue
  }));

  const paymentChartData = billingStats.paymentBreakdown.map(payment => ({
    name: payment._id.toUpperCase(),
    value: payment.totalAmount,
    count: payment.count
  }));

  const dailyRevenueData = billingStats.dailyRevenue.map(day => ({
    date: new Date(day._id).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: day.revenue,
    bills: day.bills
  }));

  const COLORS = ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FEE2E2'];

  const StatCard = ({ title, value, icon: Icon, change, changeType, color = 'primary-red', link }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'positive' ? '↗' : '↘'} {change}
            </p>
          )}
        </div>
        <div className={`bg-${color} bg-opacity-10 rounded-full p-3`}>
          <Icon className={`h-8 w-8 text-${color}`} />
        </div>
      </div>
      {link && (
        <div className="mt-4">
          <Link to={link} className="text-sm text-primary-red hover:underline">
            View details →
          </Link>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-red to-red-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Dreams Saloon Dashboard</h1>
        <p className="text-red-100">
          Today is {new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Today's Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Appointments"
          value={todaysStats.total}
          icon={CalendarIcon}
          link="/admin/appointments"
        />
        <StatCard
          title="Completed Today"
          value={todaysStats.completed}
          icon={UserCheckIcon}
          color="green-500"
        />
        <StatCard
          title="Pending Today"
          value={todaysStats.pending}
          icon={ClockIcon}
          color="yellow-500"
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${todaysStats.revenue.toLocaleString('en-IN')}`}
          icon={DollarSignIcon}
          color="primary-red"
        />
      </div>

      {/* This Week's Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="This Week's Appointments"
          value={dashboardStats.thisWeek.stats.totalAppointments}
          icon={CalendarIcon}
        />
        <StatCard
          title="This Week's Revenue"
          value={`₹${dashboardStats.thisWeek.stats.totalRevenue.toLocaleString('en-IN')}`}
          icon={TrendingUpIcon}
        />
        <StatCard
          title="Average Bill Amount"
          value={`₹${Math.round(billingStats.overview.avgBillAmount || 0)}`}
          icon={CreditCardIcon}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Services Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Popular Services</h3>
            <Link to="/admin/appointments" className="text-sm text-primary-red hover:underline">
              View all →
            </Link>
          </div>
          
          {serviceChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="appointments" fill="#DC2626" name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <AlertCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No service data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
            <Link to="/admin/billing" className="text-sm text-primary-red hover:underline">
              View billing →
            </Link>
          </div>

          {paymentChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ₹${value.toLocaleString('en-IN')}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <AlertCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No payment data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Revenue Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Daily Revenue Trend</h3>
          <Link to="/admin/billing" className="text-sm text-primary-red hover:underline">
            View detailed reports →
          </Link>
        </div>

        {dailyRevenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `₹${value.toLocaleString('en-IN')}` : value,
                  name === 'revenue' ? 'Revenue' : 'Bills'
                ]}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#DC2626" name="Revenue (₹)" />
              <Bar dataKey="bills" fill="#EF4444" name="Bills Count" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <AlertCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No revenue data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/appointments"
            className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
          >
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Manage Appointments</p>
              <p className="text-sm text-blue-700">View and update appointments</p>
            </div>
          </Link>

          <Link
            to="/admin/customers"
            className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
          >
            <UsersIcon className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Customer Management</p>
              <p className="text-sm text-green-700">Add and manage customers</p>
            </div>
          </Link>

          <Link
            to="/admin/employees"
            className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
          >
            <UserCheckIcon className="h-8 w-8 text-purple-600" />
            <div>
              <p className="font-medium text-purple-900">Employee Management</p>
              <p className="text-sm text-purple-700">Manage staff and schedules</p>
            </div>
          </Link>

          <Link
            to="/admin/billing"
            className="flex items-center space-x-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
          >
            <CreditCardIcon className="h-8 w-8 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Billing & Reports</p>
              <p className="text-sm text-red-700">Generate bills and reports</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity or Alerts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-green-700">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">All systems operational</span>
          </div>
          <div className="flex items-center space-x-3 text-blue-700">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm">Database connected successfully</span>
          </div>
          <div className="flex items-center space-x-3 text-green-700">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Backup completed today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;