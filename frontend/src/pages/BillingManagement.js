import React from 'react';
import { CreditCard as CreditCardIcon } from 'lucide-react';

const BillingManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <CreditCardIcon className="h-8 w-8 text-primary-red" />
        <h1 className="text-2xl font-bold text-gray-900">Billing Management</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <CreditCardIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Billing Management</h2>
          <p className="text-gray-600 mb-6">
            This page will contain billing management features including:
          </p>
          <div className="text-left max-w-md mx-auto space-y-2 text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>Generate bills for appointments</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>View all billing history</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>Track daily income and expenses</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>Generate financial reports</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>Manage payment methods</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Feature coming soon in the complete implementation
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillingManagement;