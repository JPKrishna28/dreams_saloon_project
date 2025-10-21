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
  Loader as LoaderIcon
} from 'lucide-react';
import { appointmentAPI } from '../services/api';

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
    employee: '',
    notes: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Customer Info, 2: Services, 3: Date/Time, 4: Confirmation
  const [availableSlots, setAvailableSlots] = useState([]);

  const servicesList = [
    {
      name: 'Hair Cut',
      price: 150,
      duration: 30,
      description: 'Professional hair cutting with modern styles',
      icon: '✂️'
    },
    {
      name: 'Beard Trim',
      price: 80,
      duration: 20,
      description: 'Expert beard trimming and shaping',
      icon: '🧔'
    },
    {
      name: 'Shave',
      price: 100,
      duration: 25,
      description: 'Traditional wet shave with premium products',
      icon: '🪒'
    },
    {
      name: 'Hair Styling',
      price: 200,
      duration: 45,
      description: 'Professional styling for special occasions',
      icon: '💇‍♂️'
    },
    {
      name: 'Hair Wash',
      price: 50,
      duration: 15,
      description: 'Refreshing hair wash with quality shampoo',
      icon: '🚿'
    },
    {
      name: 'Facial',
      price: 300,
      duration: 60,
      description: 'Deep cleansing facial treatment',
      icon: '🧴'
    },
    {
      name: 'Massage',
      price: 250,
      duration: 45,
      description: 'Relaxing head and shoulder massage',
      icon: '💆‍♂️'
    },
    {
      name: 'Complete Grooming',
      price: 500,
      duration: 90,
      description: 'Full grooming package with multiple services',
      icon: '⭐'
    }
  ];

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
        services: formData.services.map(serviceName => ({ name: serviceName })),
        appointmentDate: formData.appointmentDate.toISOString().split('T')[0],
        appointmentTime: formData.appointmentTime,
        employee: formData.employee || null,
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
          employee: '',
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
                ? 'bg-primary-red border-primary-red text-white'
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
                step > stepNumber ? 'bg-primary-red' : 'bg-gray-300'
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
        <h2 className="text-2xl font-bold text-primary-black mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600">Tell us about yourself</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="customerInfo.name"
              value={formData.customerInfo.name}
              onChange={handleInputChange}
              className="input-field pl-10"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              name="customerInfo.phone"
              value={formData.customerInfo.phone}
              onChange={handleInputChange}
              className="input-field pl-10"
              placeholder="Enter your phone number"
              maxLength={10}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email (Optional)
          </label>
          <input
            type="email"
            name="customerInfo.email"
            value={formData.customerInfo.email}
            onChange={handleInputChange}
            className="input-field"
            placeholder="Enter your email address"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary-black mb-2">
          Select Services
        </h2>
        <p className="text-gray-600">Choose the services you want</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {servicesList.map((service) => (
          <div
            key={service.name}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              formData.services.includes(service.name)
                ? 'border-primary-red bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleServiceToggle(service.name)}
          >
            <div className="flex items-start space-x-4">
              <div className="text-2xl">{service.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-primary-black">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-red">
                    ₹{service.price}
                  </span>
                  <span className="text-sm text-gray-500">
                    {service.duration} min
                  </span>
                </div>
              </div>
              {formData.services.includes(service.name) && (
                <CheckCircleIcon className="h-6 w-6 text-primary-red" />
              )}
            </div>
          </div>
        ))}
      </div>

      {formData.services.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-primary-black mb-2">
            Selected Services Summary
          </h3>
          <div className="space-y-2">
            {formData.services.map(serviceName => {
              const service = servicesList.find(s => s.name === serviceName);
              return (
                <div key={serviceName} className="flex justify-between text-sm">
                  <span>{serviceName}</span>
                  <span>₹{service?.price}</span>
                </div>
              );
            })}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total: {calculateTotalDuration()} minutes</span>
              <span className="text-primary-red">₹{calculateTotalPrice()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary-black mb-2">
          Select Date & Time
        </h2>
        <p className="text-gray-600">Choose your preferred appointment slot</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select Date
          </label>
          <div className="flex justify-center">
            <DatePicker
              selected={formData.appointmentDate}
              onChange={(date) => setFormData(prev => ({ ...prev, appointmentDate: date }))}
              minDate={new Date()}
              maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
              inline
              calendarClassName="border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Available Time Slots
          </label>
          
          {availableSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No available slots for selected date</p>
              <p className="text-sm">Please choose another date</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => setFormData(prev => ({ ...prev, appointmentTime: slot.time }))}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors duration-200 ${
                    formData.appointmentTime === slot.time
                      ? 'border-primary-red bg-primary-red text-white'
                      : 'border-gray-200 text-gray-700 hover:border-primary-red hover:text-primary-red'
                  }`}
                >
                  {slot.time}
                  <div className="text-xs opacity-75 mt-1">
                    {slot.availableEmployees.length} staff available
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Employee Selection (Optional) */}
      {formData.appointmentTime && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Staff (Optional)
          </label>
          <select
            name="employee"
            value={formData.employee}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value="">Any available staff</option>
            {availableSlots
              .find(slot => slot.time === formData.appointmentTime)
              ?.availableEmployees.map(emp => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.employeeName} ({emp.employeeRole})
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Special Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Special Notes (Optional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          className="input-field resize-none"
          placeholder="Any special requests or preferences..."
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-primary-black mb-2">
          Confirm Your Appointment
        </h2>
        <p className="text-gray-600">Please review your appointment details</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        {/* Customer Info */}
        <div>
          <h3 className="font-semibold text-primary-black mb-2">Customer Information</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Name:</span> {formData.customerInfo.name}</p>
            <p><span className="font-medium">Phone:</span> {formData.customerInfo.phone}</p>
            {formData.customerInfo.email && (
              <p><span className="font-medium">Email:</span> {formData.customerInfo.email}</p>
            )}
          </div>
        </div>

        {/* Services */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-primary-black mb-2">Selected Services</h3>
          <div className="space-y-2">
            {formData.services.map(serviceName => {
              const service = servicesList.find(s => s.name === serviceName);
              return (
                <div key={serviceName} className="flex justify-between text-sm">
                  <span>{serviceName} ({service?.duration} min)</span>
                  <span className="font-medium">₹{service?.price}</span>
                </div>
              );
            })}
            <div className="border-t pt-2 flex justify-between font-semibold text-primary-red">
              <span>Total ({calculateTotalDuration()} minutes)</span>
              <span>₹{calculateTotalPrice()}</span>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-primary-black mb-2">Appointment Details</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Date:</span> {formData.appointmentDate.toLocaleDateString('en-IN')}</p>
            <p><span className="font-medium">Time:</span> {formData.appointmentTime}</p>
            {formData.employee && (
              <p><span className="font-medium">Staff:</span> {
                availableSlots
                  .find(slot => slot.time === formData.appointmentTime)
                  ?.availableEmployees.find(emp => emp.employeeId === formData.employee)
                  ?.employeeName
              }</p>
            )}
            {formData.notes && (
              <p><span className="font-medium">Notes:</span> {formData.notes}</p>
            )}
          </div>
        </div>

        {/* Loyalty Message */}
        <div className="border-t pt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-700">
              <AlertCircleIcon className="h-5 w-5" />
              <span className="font-medium">Loyalty Program</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Remember: Every 5th visit is FREE! Keep coming back for great savings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <ScissorsIcon className="h-8 w-8 text-primary-red" />
            <h1 className="text-3xl font-bold text-primary-black">Book Your Appointment</h1>
          </div>
          <p className="text-lg text-gray-600">
            Easy online booking • Professional service • Great prices
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={step === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                step === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="btn-primary px-6 py-2"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary px-8 py-2 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <LoaderIcon className="h-5 w-5 animate-spin" />
                    <span>Booking...</span>
                  </>
                ) : (
                  <span>Confirm Booking</span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center text-gray-600">
          <p className="mb-2">Need help? Call us directly:</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:9963388556" className="text-primary-red hover:underline">
              Ramesh: 9963388556
            </a>
            <a href="tel:9666699201" className="text-primary-red hover:underline">
              Rambabu: 9666699201
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;