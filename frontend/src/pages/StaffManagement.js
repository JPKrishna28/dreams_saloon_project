import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  UserPlus as UserPlusIcon,
  Edit as EditIcon,
  Trash2 as TrashIcon,
  Shield as ShieldIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Crown as CrownIcon,
  User as UserIcon
} from 'lucide-react';
import { staffAPI } from '../services/api';
import toast from 'react-hot-toast';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const [staffData, setStaffData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'Junior Barber',
    accessLevel: 'staff',
    specializations: [],
    workingDays: [],
    salary: '',
    commission: 10,
    isLoginEnabled: false,
    username: '',
    password: '',
    permissions: {
      canManageAppointments: false,
      canManageCustomers: false,
      canManageEmployees: false,
      canManageServices: false,
      canViewReports: false,
      canManageBilling: false,
      canManageFeedback: false,
      canAccessSettings: false
    }
  });

  const roles = ['Admin', 'Manager', 'Senior Barber', 'Junior Barber', 'Hair Stylist', 'Trainee', 'Receptionist'];
  const accessLevels = ['admin', 'manager', 'staff'];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await staffAPI.getAll();
      if (response.data.success) {
        setStaff(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Error loading staff data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Log the data being sent for debugging
      console.log('Sending staff data:', staffData);
      
      let response;
      if (editingStaff) {
        response = await staffAPI.update(editingStaff._id, staffData);
      } else {
        response = await staffAPI.create(staffData);
      }

      if (response.data.success) {
        toast.success(editingStaff ? 'Staff updated successfully' : 'Staff added successfully');
        setShowModal(false);
        resetForm();
        fetchStaff();
      }
    } catch (error) {
      console.error('Error saving staff:', error);
      console.error('Error response:', error.response?.data);
      
      // Show more specific error message
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Error saving staff data';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await staffAPI.delete(id);
        toast.success('Staff deleted successfully');
        fetchStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
        toast.error('Error deleting staff');
      }
    }
  };

  const resetForm = () => {
    setStaffData({
      name: '',
      phone: '',
      email: '',
      role: 'Junior Barber',
      accessLevel: 'staff',
      specializations: [],
      workingDays: [],
      salary: '',
      commission: 10,
      isLoginEnabled: false,
      username: '',
      password: '',
      permissions: {
        canManageAppointments: false,
        canManageCustomers: false,
        canManageEmployees: false,
        canManageServices: false,
        canViewReports: false,
        canManageBilling: false,
        canManageFeedback: false,
        canAccessSettings: false
      }
    });
    setEditingStaff(null);
  };

  const handleEdit = (staffMember) => {
    setStaffData({
      ...staffMember,
      password: '', // Don't show existing password
      permissions: staffMember.permissions || {}
    });
    setEditingStaff(staffMember);
    setShowModal(true);
  };

  const handleRoleChange = (role) => {
    let newAccessLevel = 'staff';
    let newPermissions = {
      canManageAppointments: false,
      canManageCustomers: false,
      canManageEmployees: false,
      canManageServices: false,
      canViewReports: false,
      canManageBilling: false,
      canManageFeedback: false,
      canAccessSettings: false
    };

    // Set default permissions based on role
    if (role === 'Admin') {
      newAccessLevel = 'admin';
      newPermissions = {
        canManageAppointments: true,
        canManageCustomers: true,
        canManageEmployees: true,
        canManageServices: true,
        canViewReports: true,
        canManageBilling: true,
        canManageFeedback: true,
        canAccessSettings: true
      };
    } else if (role === 'Manager') {
      newAccessLevel = 'manager';
      newPermissions = {
        canManageAppointments: true,
        canManageCustomers: true,
        canManageEmployees: false,
        canManageServices: true,
        canViewReports: true,
        canManageBilling: true,
        canManageFeedback: true,
        canAccessSettings: false
      };
    } else if (role === 'Receptionist') {
      newAccessLevel = 'staff';
      newPermissions = {
        canManageAppointments: true,
        canManageCustomers: true,
        canManageEmployees: false,
        canManageServices: false,
        canViewReports: false,
        canManageBilling: true,
        canManageFeedback: false,
        canAccessSettings: false
      };
    }

    setStaffData(prev => ({
      ...prev,
      role,
      accessLevel: newAccessLevel,
      permissions: newPermissions,
      isLoginEnabled: ['Admin', 'Manager', 'Receptionist'].includes(role)
    }));
  };

  const getAccessLevelBadge = (accessLevel) => {
    const badges = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      staff: 'bg-green-100 text-green-800'
    };
    return badges[accessLevel] || badges.staff;
  };

  const getAccessLevelIcon = (accessLevel) => {
    if (accessLevel === 'admin') return <CrownIcon className="h-4 w-4" />;
    if (accessLevel === 'manager') return <ShieldIcon className="h-4 w-4" />;
    return <UserIcon className="h-4 w-4" />;
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.includes(searchTerm) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === '' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Staff Management</h1>
        <p className="text-gray-600">Manage salon staff, roles, and permissions</p>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <UserPlusIcon className="h-4 w-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Access
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Login Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <UsersIcon className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">
                          {member.specializations?.join(', ') || 'No specializations'}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {member.role}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getAccessLevelBadge(member.accessLevel)}`}>
                        {getAccessLevelIcon(member.accessLevel)}
                        <span className="ml-1 capitalize">{member.accessLevel}</span>
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{member.phone}</div>
                    <div className="text-gray-500">{member.email || 'No email'}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.loginCredentials?.isLoginEnabled ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        <XCircleIcon className="h-3 w-3 mr-1" />
                        Disabled
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(member)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Basic Information</h4>
                  
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={staffData.name}
                    onChange={(e) => setStaffData({...staffData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={staffData.phone}
                    onChange={(e) => setStaffData({...staffData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={staffData.email}
                    onChange={(e) => setStaffData({...staffData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  
                  <select
                    value={staffData.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* Role & Permissions */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Role & Access</h4>
                  
                  <select
                    value={staffData.accessLevel}
                    onChange={(e) => setStaffData({...staffData, accessLevel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {accessLevels.map(level => (
                      <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                    ))}
                  </select>

                  {/* Login Credentials */}
                  {staffData.accessLevel !== 'staff' && (
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={staffData.isLoginEnabled}
                          onChange={(e) => setStaffData({...staffData, isLoginEnabled: e.target.checked})}
                          className="mr-2"
                        />
                        Enable Login Access
                      </label>
                      
                      {staffData.isLoginEnabled && (
                        <>
                          <input
                            type="text"
                            placeholder="Username"
                            value={staffData.username}
                            onChange={(e) => setStaffData({...staffData, username: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <input
                            type="password"
                            placeholder="Password"
                            value={staffData.password}
                            onChange={(e) => setStaffData({...staffData, password: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Permissions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(staffData.permissions).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setStaffData({
                          ...staffData,
                          permissions: {
                            ...staffData.permissions,
                            [key]: e.target.checked
                          }
                        })}
                        className="text-purple-600"
                      />
                      <span className="text-sm text-gray-600">
                        {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editingStaff ? 'Update Staff' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;