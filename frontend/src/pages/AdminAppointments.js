import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Users as UsersIcon, 
  Clock as ClockIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  Eye as EyeIcon,
  Edit as EditIcon,
  Trash2 as TrashIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Filter as FilterIcon
} from 'lucide-react';
import { appointmentAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (selectedDate) {
        params.date = selectedDate;
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await appointmentAPI.getAll(params);
      
      if (response.data.success) {
        setAppointments(response.data.data.appointments || []);
      } else {
        toast.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Error loading appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, statusFilter]);

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const response = await appointmentAPI.update(appointmentId, { status: newStatus });
      
      if (response.data.success) {
        toast.success(`Appointment ${newStatus} successfully`);
        fetchAppointments(); // Refresh the list
      } else {
        toast.error('Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Error updating appointment status');
    }
  };

  // Delete appointment
  const deleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        const response = await appointmentAPI.delete(appointmentId);
        
        if (response.data.success) {
          toast.success('Appointment deleted successfully');
          fetchAppointments(); // Refresh the list
        } else {
          toast.error('Failed to delete appointment');
        }
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast.error('Error deleting appointment');
      }
    }
  };

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.customerInfo?.name?.toLowerCase().includes(searchLower) ||
      appointment.customerInfo?.phone?.includes(searchLower) ||
      appointment.services?.some(service => 
        service.name?.toLowerCase().includes(searchLower)
      )
    );
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date and time
  const formatDateTime = (date, time) => {
    const appointmentDate = new Date(date);
    return `${appointmentDate.toLocaleDateString()} at ${time}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-gray-600">Manage and track all salon appointments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone..."
              className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-red-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-red-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div>
            <button
              onClick={() => {
                setSelectedDate('');
                setStatusFilter('all');
                setSearchTerm('');
              }}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedDate || statusFilter !== 'all' 
                ? 'No appointments match your current filters.'
                : 'No appointments have been booked yet.'
              }
            </p>
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
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.customerInfo?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <PhoneIcon className="h-3 w-3 mr-1" />
                          {appointment.customerInfo?.phone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {appointment.services?.map((service, index) => (
                          <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                            {service.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{appointment.totalAmount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {appointment.status === 'pending' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                            className="text-green-600 hover:text-green-900"
                            title="Confirm"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment._id, 'in-progress')}
                            className="text-blue-600 hover:text-blue-900"
                            title="Start Service"
                          >
                            <ClockIcon className="h-4 w-4" />
                          </button>
                        )}
                        {appointment.status === 'in-progress' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                            className="text-green-600 hover:text-green-900"
                            title="Complete"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteAppointment(appointment._id)}
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
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                {appointments.filter(apt => {
                  const today = new Date().toISOString().split('T')[0];
                  const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
                  return aptDate === today;
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {appointments.filter(apt => apt.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {appointments.filter(apt => apt.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{appointments
                  .filter(apt => apt.status === 'completed')
                  .reduce((sum, apt) => sum + (apt.totalAmount || 0), 0)
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointments;