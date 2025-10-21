import React from 'react';
import { Users as UsersIcon } from 'lucide-react';

const CustomerManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <UsersIcon className="h-8 w-8 text-primary-red" />
        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Customer Management</h2>
          <p className="text-gray-600 mb-6">
            This page will contain customer management features including:
          </p>
          <div className="text-left max-w-md mx-auto space-y-2 text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>View all customers with search and filters</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>Add new customers</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>Edit customer information</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>View customer history and statistics</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>Loyalty program tracking</span>
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

export default CustomerManagement;