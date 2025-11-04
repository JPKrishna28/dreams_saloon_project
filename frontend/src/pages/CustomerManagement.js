import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Users as UsersIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Plus as PlusIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Calendar as CalendarIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  X as XIcon,
  Loader as LoaderIcon,
  MapPin as MapPinIcon
} from 'lucide-react';
import { customerAPI } from '../services/api';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showWithAppointments, setShowWithAppointments] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [pagination, setPagination] = useState({});

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    address: ''
  });

  const [errors, setErrors] = useState({});

  // Fetch customers
  const fetchCustomers = async (page = 1, search = searchTerm, status = filterStatus, withAppointments = showWithAppointments) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(search && { search }),
        ...(status !== 'all' && { isActive: status === 'active' }),
        ...(withAppointments && { withAppointments: true })
      };

      console.log('Fetching customers with params:', params);
      const response = await customerAPI.getAll(params);
      console.log('Customer API response:', response.data);
      
      if (response.data.success) {
        setCustomers(response.data.data.customers);
        setPagination(response.data.data.pagination);
        console.log('Customers fetched:', response.data.data.customers.length);
      } else {
        toast.error('Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Error loading customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle search and filter
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setTimeout(() => fetchCustomers(1, value, filterStatus, showWithAppointments), 300);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    fetchCustomers(1, searchTerm, status, showWithAppointments);
  };

  // Handle appointments filter change
  const handleAppointmentsFilterChange = (showOnly) => {
    setShowWithAppointments(showOnly);
    fetchCustomers(1, searchTerm, filterStatus, showOnly);
  };

  // Helper function for pagination
  const handlePageChange = (page) => {
    fetchCustomers(page, searchTerm, filterStatus, showWithAppointments);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Trim all string fields
    const trimmedData = {
      name: formData.name.trim(),
      phone: formData.phone.replace(/\s+/g, ''), // Remove all spaces
      email: formData.email.trim(),
      address: formData.address.trim()
    };
    
    if (!trimmedData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!trimmedData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(trimmedData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number starting with 6-9';
    }
    
    if (trimmedData.email && !/^\S+@\S+\.\S+$/.test(trimmedData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    
    // Update form data with trimmed values
    if (Object.keys(newErrors).length === 0) {
      setFormData(prev => ({
        ...prev,
        name: trimmedData.name,
        phone: trimmedData.phone,
        email: trimmedData.email,
        address: trimmedData.address
      }));
    }
    
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      if (showEditModal && selectedCustomer) {
        // Update customer
        const response = await customerAPI.update(selectedCustomer._id, formData);
        if (response.data.success) {
          toast.success('Customer updated successfully!');
          setShowEditModal(false);
          fetchCustomers();
        }
      } else {
        // Create new customer
        const response = await customerAPI.create(formData);
        if (response.data.success) {
          toast.success('Customer added successfully!');
          setShowAddModal(false);
          fetchCustomers();
        }
      }
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        dateOfBirth: '',
        address: ''
      });
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Error saving customer:', error);
      console.error('Error response:', error.response?.data);
      console.error('Form data:', formData);
      
      let message = 'Failed to save customer';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors) {
        message = Array.isArray(error.response.data.errors) 
          ? error.response.data.errors.join(', ')
          : error.response.data.errors;
      } else if (error.response?.status === 400) {
        message = 'Invalid customer data. Please check all fields.';
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit customer
  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split('T')[0] : '',
      address: customer.address || ''
    });
    setShowEditModal(true);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString('en-IN');
  };

  // Calculate customer tier based on visits
  const getCustomerTier = (totalVisits = 0) => {
    if (totalVisits >= 20) return { name: 'VIP', color: 'bg-purple-100 text-purple-800' };
    if (totalVisits >= 10) return { name: 'Gold', color: 'bg-yellow-100 text-yellow-800' };
    if (totalVisits >= 5) return { name: 'Silver', color: 'bg-gray-100 text-gray-800' };
    return { name: 'Bronze', color: 'bg-orange-100 text-orange-800' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UsersIcon className="h-8 w-8 text-primary-red" />
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search customers by name or phone..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <FilterIcon className="h-5 w-5 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-red focus:border-transparent"
            >
              <option value="all">All Customers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Appointments Filter */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={showWithAppointments}
                onChange={(e) => handleAppointmentsFilterChange(e.target.checked)}
                className="rounded border-gray-300 text-primary-red focus:ring-primary-red"
              />
              <span>Only customers with appointments</span>
            </label>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoaderIcon className="h-8 w-8 animate-spin text-primary-red" />
            <span className="ml-2 text-gray-600">Loading customers...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first customer.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Add Customer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visits & Spending
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => {
                  const tier = getCustomerTier(customer.totalVisits);
                  return (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-red flex items-center justify-center text-white font-medium">
                              {customer.name ? customer.name.charAt(0).toUpperCase() : '?'}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">
                              {customer.loyaltyPoints || 0} loyalty points
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                            <span>{customer.phone || 'No phone'}</span>
                          </div>
                          {customer.email && (
                            <div className="flex items-center space-x-1 mt-1">
                              <MailIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-500">{customer.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <TrendingUpIcon className="h-4 w-4 text-green-500" />
                            <span>{customer.totalVisits || 0} visits</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            ₹{(customer.totalSpent || 0).toLocaleString()} total
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${tier.color}`}>
                          {tier.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.lastVisit ? formatDate(customer.lastVisit) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="text-primary-red hover:text-red-700 flex items-center space-x-1"
                          >
                            <EditIcon className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span> ({pagination.totalCustomers} total customers)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => fetchCustomers(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.currentPage === index + 1
                          ? 'z-10 bg-primary-red border-primary-red text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Customer</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter customer name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="10-digit mobile number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="customer@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  rows="3"
                  placeholder="Customer address"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-red text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Customer</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  rows="3"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-red text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;