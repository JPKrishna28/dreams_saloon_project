import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { 
  MessageSquare as MessageIcon,
  Star as StarIcon,
  User as UserIcon,
  Phone as PhoneIcon,
  DollarSign as DollarSignIcon,
  TrendingUp as TrendingUpIcon,
  Filter as FilterIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { appointmentAPI } from '../services/api';

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [ratingFilter, setRatingFilter] = useState('all');

  // Fetch feedback
  const fetchFeedback = useCallback(async (page = 1, rating = ratingFilter) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      
      const response = await appointmentAPI.getAllFeedback(params);
      
      if (response.data.success) {
        let filteredFeedback = response.data.data.feedback;
        
        // Apply rating filter on frontend for now
        if (rating !== 'all') {
          const ratingValue = parseInt(rating);
          filteredFeedback = filteredFeedback.filter(item => item.rating === ratingValue);
        }
        
        setFeedback(filteredFeedback);
        setPagination(response.data.data.pagination);
      } else {
        toast.error('Failed to fetch feedback');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Error loading feedback');
    } finally {
      setLoading(false);
    }
  }, [ratingFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Handle filter change
  const handleFilterChange = (rating) => {
    setRatingFilter(rating);
    fetchFeedback(1, rating);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render star rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`h-4 w-4 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Get rating color
  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 bg-green-50';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    if (feedback.length === 0) return 0;
    const sum = feedback.reduce((acc, item) => acc + item.rating, 0);
    return (sum / feedback.length).toFixed(1);
  };

  // Calculate rating distribution
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedback.forEach(item => {
      distribution[item.rating]++;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Feedback</h1>
          <p className="text-gray-600 mt-1">Monitor customer satisfaction and reviews</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <MessageIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">{feedback.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <StarIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Rating</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-gray-900">{calculateAverageRating()}</p>
                <div className="flex ml-2">
                  {renderStars(Math.round(calculateAverageRating()))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <TrendingUpIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">5-Star Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">{ratingDistribution[5]}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">With Comments</p>
              <p className="text-2xl font-semibold text-gray-900">
                {feedback.filter(item => item.feedback && item.feedback.trim()).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = ratingDistribution[rating];
            const percentage = feedback.length > 0 ? (count / feedback.length) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center">
                <div className="flex items-center w-20">
                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current ml-1" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Feedback List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Filter Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
            
            {/* Rating Filter */}
            <div className="flex items-center space-x-2">
              <FilterIcon className="h-5 w-5 text-gray-500" />
              <select
                value={ratingFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-red focus:border-transparent"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading feedback...</p>
            </div>
          ) : feedback.length === 0 ? (
            <div className="p-12 text-center">
              <MessageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
              <p className="text-gray-600">Customer reviews will appear here once submitted.</p>
            </div>
          ) : (
            feedback.map((item) => (
              <div key={item._id} className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Customer Avatar */}
                  <div className="h-10 w-10 rounded-full bg-primary-red flex items-center justify-center text-white font-medium">
                    {item.customer?.name ? item.customer.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  
                  {/* Feedback Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {item.customer?.name || 'Anonymous'}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <PhoneIcon className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{item.customer?.phone}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          {renderStars(item.rating)}
                          <span className={`text-sm font-medium px-2 py-1 rounded-full ${getRatingColor(item.rating)}`}>
                            {item.rating}/5
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(item.appointmentDate)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Services */}
                    <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <span>Services:</span>
                        <span className="font-medium">
                          {item.services?.map(s => s.name).join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSignIcon className="h-3 w-3" />
                        <span>₹{item.totalAmount}</span>
                      </div>
                    </div>
                    
                    {/* Feedback Text */}
                    {item.feedback && item.feedback.trim() && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">{item.feedback}</p>
                      </div>
                    )}
                    
                    {/* Employee */}
                    {item.employee && (
                      <div className="mt-2 text-xs text-gray-500">
                        Served by: {item.employee.name} ({item.employee.role})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => fetchFeedback(pagination.currentPage - 1, ratingFilter)}
                disabled={!pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchFeedback(pagination.currentPage + 1, ratingFilter)}
                disabled={!pagination.hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.currentPage - 1) * 10) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * 10, pagination.totalFeedback)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.totalFeedback}</span> reviews
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => fetchFeedback(pagination.currentPage - 1, ratingFilter)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchFeedback(pagination.currentPage + 1, ratingFilter)}
                    disabled={!pagination.hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackManagement;