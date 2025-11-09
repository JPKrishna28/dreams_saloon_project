import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home as HomeIcon,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  UserPlus as UserPlusIcon,
  CreditCard as CreditCardIcon,
  Settings as SettingsIcon,
  MessageSquare as MessageSquareIcon,
  BarChart3 as BarChart3Icon,
  Shield as ShieldIcon,
  User as UserIcon,
  Crown as CrownIcon
} from 'lucide-react';

const AdminNavigation = ({ userRole = 'admin', userPermissions = {} }) => {
  const location = useLocation();

  // Define menu items with their required permissions
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: HomeIcon,
      permission: null, // Always visible
      accessLevels: ['admin', 'manager', 'staff']
    },
    {
      name: 'Appointments',
      path: '/admin/appointments',
      icon: CalendarIcon,
      permission: 'canManageAppointments',
      accessLevels: ['admin', 'manager', 'staff']
    },
    {
      name: 'Customers',
      path: '/admin/customers',
      icon: UsersIcon,
      permission: 'canManageCustomers',
      accessLevels: ['admin', 'manager', 'staff']
    },
    {
      name: 'Staff Management',
      path: '/admin/staff',
      icon: ShieldIcon,
      permission: 'canManageEmployees',
      accessLevels: ['admin']
    },
    {
      name: 'Services',
      path: '/admin/services',
      icon: SettingsIcon,
      permission: 'canManageServices',
      accessLevels: ['admin', 'manager']
    },
    {
      name: 'Feedback',
      path: '/admin/feedback',
      icon: MessageSquareIcon,
      permission: 'canManageFeedback',
      accessLevels: ['admin', 'manager']
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: BarChart3Icon,
      permission: 'canViewReports',
      accessLevels: ['admin', 'manager']
    }
  ];

  // Filter menu items based on user role and permissions
  const filteredMenuItems = menuItems.filter(item => {
    // Check if user's access level is allowed for this item
    if (!item.accessLevels.includes(userRole)) {
      return false;
    }

    // If no specific permission required, show item
    if (!item.permission) {
      return true;
    }

    // Check if user has the required permission
    return userPermissions[item.permission] === true;
  });

  const isActivePath = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <CrownIcon className="h-4 w-4" />;
      case 'manager': return <ShieldIcon className="h-4 w-4" />;
      default: return <UserIcon className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      staff: 'bg-green-100 text-green-800'
    };
    return badges[role] || badges.staff;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo/Brand */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/admin" className="text-xl font-bold text-purple-600">
                Dreams Saloon Admin
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                      isActivePath(item.path)
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Role Badge */}
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(userRole)}`}>
              {getRoleIcon(userRole)}
              <span className="ml-1 capitalize">{userRole}</span>
            </span>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                    isActivePath(item.path)
                      ? 'text-purple-600 bg-purple-50 border-r-2 border-purple-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavigation;