import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home as HomeIcon, 
  Users as UsersIcon, 
  Calendar as CalendarIcon, 
  CreditCard as CreditCardIcon, 
  Users as UserGroupIcon, 
  LogOut as LogOutIcon, 
  Menu as MenuIcon, 
  X as XIcon,
  Scissors as ScissorsIcon,
  MessageSquare as MessageSquareIcon
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon, roles: ['admin', 'manager', 'staff'] },
    { name: 'Appointments', href: '/admin/appointments', icon: CalendarIcon, roles: ['admin', 'manager', 'staff'] },
    { name: 'Services', href: '/admin/services', icon: ScissorsIcon, roles: ['admin', 'manager'] },
    { name: 'Customers', href: '/admin/customers', icon: UsersIcon, roles: ['admin', 'manager', 'staff'] },
    { name: 'Staff Management', href: '/admin/staff', icon: UserGroupIcon, roles: ['admin'] },
    { name: 'Employees', href: '/admin/employees', icon: UsersIcon, roles: ['admin', 'manager'] },
    { name: 'Billing', href: '/admin/billing', icon: CreditCardIcon, roles: ['admin', 'manager', 'staff'] },
    { name: 'Feedback', href: '/admin/feedback', icon: MessageSquareIcon, roles: ['admin', 'manager'] },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role?.toLowerCase() || 'admin')
  );

  const isActivePage = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-black transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:inset-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-primary-red">
          <div className="flex items-center space-x-3">
            <ScissorsIcon className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Dreams Saloon</h1>
              <p className="text-xs text-red-100">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white hover:text-red-200"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary-red rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.role || 'Administrator'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActivePage(item.href)
                      ? 'bg-primary-red text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200"
          >
            <LogOutIcon className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <MenuIcon className="h-6 w-6" />
            </button>

            {/* Page Title */}
            <div className="flex-1 md:ml-0 ml-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredNavigation.find(item => isActivePage(item.href))?.name || 'Admin Panel'}
              </h2>
            </div>

            {/* Top Navigation Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;