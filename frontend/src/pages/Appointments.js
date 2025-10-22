import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { toast } from 'react-hot-toast';
import { 
  Clock as ClockIcon, 
  User as UserIcon, 
  Phone as PhoneIcon, 
  Scissors as ScissorsIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  Loader as LoaderIcon,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { appointmentAPI, serviceAPI } from '../services/api';

import "react-datepicker/dist/react-datepicker.css";

const Appointments = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    customerInfo: {
      name: '',
      phone: '',
      email: ''
    },
    services: [],
    appointmentDate: new Date(),
    appointmentTime: '',
    notes: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Customer Info, 2: Services, 3: Date/Time, 4: Confirmation
  const [availableSlots, setAvailableSlots] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Fetch services function
  const fetchServices = useCallback(async () => {
    try {
      setLoadingServices(true);
      const response = await serviceAPI.getAll({ isActive: true });
      const services = response.services.map(service => ({
        name: service.name,
        price: service.price,
        duration: service.duration,
        description: service.description,
        category: service.category,
        icon: getCategoryIcon(service.category)
      }));
      setServicesList(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
      // Fallback to basic services if API fails
      setServicesList([
        { name: 'Hair Cut', price: 150, duration: 30, description: 'Professional hair cutting', category: 'Hair Care', icon: '✂️' },
        { name: 'Beard Trim', price: 80, duration: 20, description: 'Expert beard trimming', category: 'Beard Care', icon: '🧔' },
        { name: 'Shave', price: 100, duration: 25, description: 'Traditional wet shave', category: 'Beard Care', icon: '🪒' }
      ]);
    } finally {
      setLoadingServices(false);
    }
  }, []);

  // Helper function to get category icons
  const getCategoryIcon = (category) => {
    const iconMap = {
      'Hair Care': '✂️',
      'Beard Care': '🧔',
      'Skin Care': '🧴',
      'Styling': '💇‍♂️',
      'Complete Package': '⭐'
    };
    return iconMap[category] || '💫';
  };

  // Fetch services when component mounts
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Fetch available slots function
  const fetchAvailableSlots = useCallback(async () => {
    try {
      // Generate time slots from 9 AM to 6 PM
      const slots = [];
      for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(time);
        }
      }
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to load available time slots');
    }
  }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    if (formData.appointmentDate && step >= 3) {
      fetchAvailableSlots();
    }
  }, [formData.appointmentDate, step, fetchAvailableSlots]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('customerInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        customerInfo: {
          ...prev.customerInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleServiceToggle = (serviceName) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceName)
        ? prev.services.filter(s => s !== serviceName)
        : [...prev.services, serviceName]
    }));
  };

  const calculateTotalPrice = () => {
    return formData.services.reduce((total, serviceName) => {
      const service = servicesList.find(s => s.name === serviceName);
      return total + (service ? service.price : 0);
    }, 0);
  };

  const calculateTotalDuration = () => {
    return formData.services.reduce((total, serviceName) => {
      const service = servicesList.find(s => s.name === serviceName);
      return total + (service ? service.duration : 0);
    }, 0);
  };

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        if (!formData.customerInfo.name.trim()) {
          toast.error('Please enter your name');
          return false;
        }
        if (!formData.customerInfo.phone.trim()) {
          toast.error('Please enter your phone number');
          return false;
        }
        if (!/^[6-9]\d{9}$/.test(formData.customerInfo.phone)) {
          toast.error('Please enter a valid Indian mobile number');
          return false;
        }
        return true;
      case 2:
        if (formData.services.length === 0) {
          toast.error('Please select at least one service');
          return false;
        }
        return true;
      case 3:
        if (!formData.appointmentDate) {
          toast.error('Please select an appointment date');
          return false;
        }
        if (!formData.appointmentTime) {
          toast.error('Please select an appointment time');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setLoading(true);
    try {
      const appointmentData = {
        customerInfo: formData.customerInfo,
        services: formData.services, // Send array of service names directly
        appointmentDate: formData.appointmentDate.toISOString().split('T')[0],
        appointmentTime: formData.appointmentTime,
        notes: {
          customerNotes: formData.notes
        }
      };

      const response = await appointmentAPI.create(appointmentData);
      
      if (response.data.success) {
        toast.success('Appointment booked successfully!');
        
        // Show discount message if applicable
        if (response.data.data.discountApplied) {
          toast.success('🎉 Congratulations! You got a loyalty discount!', {
            duration: 6000
          });
        }
        
        // Reset form
        setFormData({
          customerInfo: { name: '', phone: '', email: '' },
          services: [],
          appointmentDate: new Date(),
          appointmentTime: '',
          notes: ''
        });
        setStep(1);
        
        // Optionally redirect to home page
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      const message = error.response?.data?.message || 'Failed to book appointment';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((stepNumber) => (
        <React.Fragment key={stepNumber}>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step >= stepNumber
                ? 'bg-red-600 border-red-600 text-white'
                : 'border-gray-300 text-gray-400'
            }`}
          >
            {step > stepNumber ? (
              <CheckCircleIcon className="h-6 w-6" />
            ) : (
              stepNumber
            )}
          </div>
          {stepNumber < 4 && (
            <div
              className={`w-16 h-1 mx-2 ${
                step > stepNumber ? 'bg-red-600' : 'bg-gray-300'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Information</h2>
        <p className="text-gray-600">Please provide your contact details</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="customerInfo.name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="customerInfo.name"
              name="customerInfo.name"
              value={formData.customerInfo.name}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="customerInfo.phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              id="customerInfo.phone"
              name="customerInfo.phone"
              value={formData.customerInfo.phone}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="customerInfo.email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address (Optional)
          </label>
          <input
            type="email"
            id="customerInfo.email"
            name="customerInfo.email"
            value={formData.customerInfo.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Enter your email address"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Services</h2>
        <p className="text-gray-600">Choose the services you'd like to book</p>
      </div>

      {loadingServices ? (
        <div className="flex justify-center items-center py-8">
          <LoaderIcon className="h-8 w-8 animate-spin text-red-500" />
          <span className="ml-2 text-gray-600">Loading services...</span>
        </div>
      ) : servicesList.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No services available at the moment.</p>
          <button 
            onClick={fetchServices}
            className="mt-2 text-red-600 hover:text-red-700 font-medium"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {servicesList.map((service) => (
            <div
              key={service.name}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                formData.services.includes(service.name)
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-red-300'
              }`}
              onClick={() => handleServiceToggle(service.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{service.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <div className="flex items-center mt-1 space-x-4">
                      <span className="text-red-600 font-semibold">₹{service.price}</span>
                      <span className="text-gray-500 text-sm">{service.duration} min</span>
                      {service.category && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {service.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {formData.services.includes(service.name) && (
                  <CheckCircleIcon className="h-6 w-6 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {formData.services.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Amount:</span>
            <span className="text-xl font-bold text-red-600">₹{calculateTotalPrice()}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Estimated Duration:</span>
            <span className="text-sm text-gray-600">{calculateTotalDuration()} minutes</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Date & Time</h2>
        <p className="text-gray-600">Choose your preferred appointment slot</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Date
          </label>
          <DatePicker
            selected={formData.appointmentDate}
            onChange={(date) => setFormData(prev => ({ ...prev, appointmentDate: date }))}
            minDate={new Date()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            dateFormat="dd/MM/yyyy"
            placeholderText="Select date"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Time
          </label>
          <select
            name="appointmentTime"
            value={formData.appointmentTime}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Select time</option>
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Special Requests (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          placeholder="Any special requests or notes..."
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Booking</h2>
        <p className="text-gray-600">Please review your appointment details</p>
      </div>

      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Summary</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700">Customer Information</h4>
            <p className="text-gray-600">{formData.customerInfo.name}</p>
            <p className="text-gray-600">{formData.customerInfo.phone}</p>
            {formData.customerInfo.email && (
              <p className="text-gray-600">{formData.customerInfo.email}</p>
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-700">Services</h4>
            <div className="space-y-2">
              {formData.services.map((serviceName) => {
                const service = servicesList.find(s => s.name === serviceName);
                return (
                  <div key={serviceName} className="flex justify-between">
                    <span>{service?.name}</span>
                    <span>₹{service?.price}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700">Date & Time</h4>
            <p className="text-gray-600">
              {formData.appointmentDate.toLocaleDateString('en-IN')} at {formData.appointmentTime}
            </p>
          </div>

          {formData.notes && (
            <div>
              <h4 className="font-medium text-gray-700">Special Requests</h4>
              <p className="text-gray-600">{formData.notes}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount:</span>
              <span className="text-red-600">₹{calculateTotalPrice()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Payment Information:</p>
            <p>Payment will be collected at the salon after your service is completed.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ScissorsIcon className="h-8 w-8 text-red-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Dreams Saloon</h1>
          </div>
          <p className="text-gray-600">Book Your Appointment</p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
          {renderCurrentStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={step === 1}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              step === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Previous
          </button>

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Next
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoaderIcon className="h-5 w-5 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Confirm Booking
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;