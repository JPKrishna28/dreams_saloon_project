import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Star as StarIcon,
  ArrowLeft,
  Send as SendIcon,
  MessageCircle as MessageIcon
} from 'lucide-react';
import { appointmentAPI } from '../services/api';

const FeedbackForm = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    rating: 0,
    feedback: '',
    customerPhone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast.error('Please provide a rating');
      return;
    }
    
    if (!formData.customerPhone) {
      toast.error('Please enter your phone number');
      return;
    }

    try {
      setLoading(true);
      const response = await appointmentAPI.submitFeedback(appointmentId, formData);
      
      if (response.data.success) {
        toast.success('Thank you for your feedback!');
        navigate('/');
      } else {
        toast.error(response.data.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const message = error.response?.data?.message || 'Failed to submit feedback';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Rate your experience';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-primary-red hover:text-red-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Share Your Experience
          </h1>
          <p className="text-gray-600">
            Your feedback helps us improve our services
          </p>
        </div>

        {/* Feedback Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number */}
            <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Your Phone Number *
              </label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This helps us verify your appointment
              </p>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                How would you rate your experience? *
              </label>
              
              <div className="flex flex-col items-center space-y-4">
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <StarIcon
                        className={`h-10 w-10 ${
                          star <= (hoveredRating || formData.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                
                <p className={`text-lg font-medium ${
                  formData.rating > 0 ? 'text-primary-red' : 'text-gray-500'
                }`}>
                  {getRatingText(hoveredRating || formData.rating)}
                </p>
              </div>
            </div>

            {/* Feedback Text */}
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                Tell us more about your experience (Optional)
              </label>
              <textarea
                id="feedback"
                name="feedback"
                value={formData.feedback}
                onChange={handleInputChange}
                rows={4}
                maxLength={500}
                placeholder="Share your thoughts about the service, staff, or anything else..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent resize-none"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Your feedback is valuable to us</span>
                <span>{formData.feedback.length}/500</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || formData.rating === 0}
                className="w-full flex items-center justify-center px-6 py-3 bg-primary-red text-white font-medium rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <SendIcon className="h-5 w-5 mr-2" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <MessageIcon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Thank You for Choosing Dreams Saloon!
          </h3>
          <p className="text-blue-700">
            Your feedback helps us maintain the highest quality of service for all our customers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;