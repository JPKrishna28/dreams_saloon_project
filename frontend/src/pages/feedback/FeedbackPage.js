import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Star as StarIcon, 
  Send as SendIcon,
  Heart as HeartIcon,
  Scissors as ScissorsIcon,
  Sparkles as SparklesIcon,
  CheckCircle as CheckCircleIcon,
  ArrowLeft as ArrowLeftIcon
} from 'lucide-react';
import { appointmentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const FeedbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    comment: '',
    serviceQuality: 5,
    staffBehavior: 5,
    ambiance: 5,
    valueForMoney: 5,
    wouldRecommend: true
  });

  const appointmentId = searchParams.get('appointment');
  const customerPhone = searchParams.get('phone');

  const fetchAppointmentDetails = useCallback(async () => {
    try {
      const response = await appointmentAPI.getById(appointmentId);
      
      if (response.data.success) {
        const apt = response.data.data;
        
        // Verify phone number matches
        if (customerPhone && apt.customerInfo.phone !== customerPhone) {
          toast.error('Invalid feedback link');
          setLoading(false);
          return;
        }
        
        setAppointment(apt);
      } else {
        toast.error('Appointment not found');
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Error loading appointment details');
    } finally {
      setLoading(false);
    }
  }, [appointmentId, customerPhone]);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails();
    } else {
      setLoading(false);
      toast.error('Invalid feedback link');
    }
  }, [appointmentId, fetchAppointmentDetails]);

  const handleRatingClick = (rating) => {
    setFeedbackData(prev => ({ ...prev, rating }));
  };

  const handleSpecificRating = (field, rating) => {
    setFeedbackData(prev => ({ ...prev, [field]: rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (feedbackData.rating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    setSubmitting(true);

    try {
      const response = await appointmentAPI.submitFeedback(appointmentId, feedbackData);
      
      if (response.data.success) {
        setSubmitted(true);
        toast.success('Thank you for your feedback!');
      } else {
        toast.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Error submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, onStarClick, size = 'h-6 w-6') => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onStarClick && onStarClick(star)}
            className={`${size} ${
              star <= rating
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-gray-400'
            } transition-colors cursor-pointer`}
          >
            <StarIcon fill="currentColor" />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 mb-4">
            <CheckCircleIcon className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Feedback Link</h2>
          <p className="text-gray-600 mb-6">The feedback link you used is invalid or has expired.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-green-500 mb-6">
            <CheckCircleIcon className="h-20 w-20 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. We truly appreciate your time and insights!
          </p>
          <div className="flex items-center justify-center space-x-2 text-purple-600 mb-6">
            <HeartIcon className="h-5 w-5" />
            <span className="font-medium">Dreams Saloon Team</span>
            <HeartIcon className="h-5 w-5" />
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Visit Our Website
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <ScissorsIcon className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Dreams Saloon</h1>
            <SparklesIcon className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-gray-600 text-lg">Share Your Experience</p>
        </div>

        {/* Appointment Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-medium">{appointment.customerInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">
                {new Date(appointment.appointmentDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">{appointment.appointmentTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Services</p>
              <p className="font-medium">
                {appointment.services.map(s => s.name).join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3">
                Overall Experience
              </label>
              <div className="flex items-center space-x-4">
                {renderStars(feedbackData.rating, handleRatingClick, 'h-8 w-8')}
                <span className="text-gray-600">
                  {feedbackData.rating > 0 && (
                    <>
                      {feedbackData.rating === 1 && 'Poor'}
                      {feedbackData.rating === 2 && 'Fair'}
                      {feedbackData.rating === 3 && 'Good'}
                      {feedbackData.rating === 4 && 'Very Good'}
                      {feedbackData.rating === 5 && 'Excellent'}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Detailed Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Quality
                </label>
                {renderStars(
                  feedbackData.serviceQuality,
                  (rating) => handleSpecificRating('serviceQuality', rating)
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Staff Behavior
                </label>
                {renderStars(
                  feedbackData.staffBehavior,
                  (rating) => handleSpecificRating('staffBehavior', rating)
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ambiance
                </label>
                {renderStars(
                  feedbackData.ambiance,
                  (rating) => handleSpecificRating('ambiance', rating)
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value for Money
                </label>
                {renderStars(
                  feedbackData.valueForMoney,
                  (rating) => handleSpecificRating('valueForMoney', rating)
                )}
              </div>
            </div>

            {/* Would Recommend */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Would you recommend us to others?
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFeedbackData(prev => ({ ...prev, wouldRecommend: true }))}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    feedbackData.wouldRecommend
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackData(prev => ({ ...prev, wouldRecommend: false }))}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !feedbackData.wouldRecommend
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments (Optional)
              </label>
              <textarea
                value={feedbackData.comment}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Share any additional thoughts about your experience..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting || feedbackData.rating === 0}
                className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <SendIcon className="h-5 w-5" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to Home</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Thank you for choosing Dreams Saloon - Where Beauty Dreams Come True
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;