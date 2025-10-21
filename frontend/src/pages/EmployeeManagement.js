import React from 'react';
import { Users as UserGroupIcon } from 'lucide-react';

const EmployeeManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <UserGroupIcon className="h-8 w-8 text-primary-red" />
        <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Employee Management</h2>
          <p className="text-gray-600 mb-6">
            This page will contain employee management features including:
          </p>
          <div className="text-left max-w-md mx-auto space-y-2 text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>View all employees with their details</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>Add new employees</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>Manage employee specializations</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>Set working hours and schedules</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <span>Track performance and commissions</span>
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

export default EmployeeManagement;