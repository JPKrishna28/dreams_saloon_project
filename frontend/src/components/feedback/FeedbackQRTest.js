import React from 'react';
import { QrCode as QrCodeIcon, ExternalLink as ExternalLinkIcon } from 'lucide-react';

const FeedbackQRTest = () => {
  // Sample appointment data for testing
  const sampleAppointment = {
    _id: '507f1f77bcf86cd799439011',
    customerInfo: {
      name: 'John Doe',
      phone: '+1234567890'
    }
  };

  const feedbackUrl = `${window.location.origin}/feedback?appointment=${sampleAppointment._id}&phone=${encodeURIComponent(sampleAppointment.customerInfo.phone)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(feedbackUrl);
      alert('Feedback URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const openFeedbackPage = () => {
    window.open(feedbackUrl, '_blank');
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">QR Code Test</h2>
        <p className="text-gray-600">Test the feedback page flow</p>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-purple-300 p-4 rounded-lg text-center">
          <QrCodeIcon className="h-24 w-24 mx-auto text-purple-600 mb-3" />
          <p className="text-sm text-gray-600 mb-3">
            QR Code would appear here pointing to:
          </p>
          <div className="bg-gray-100 p-2 rounded text-xs break-all">
            {feedbackUrl}
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={copyToClipboard}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Copy Feedback URL
          </button>
          
          <button
            onClick={openFeedbackPage}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            <span>Test Feedback Page</span>
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Test Flow:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Click "Test Feedback Page" button</li>
            <li>2. Customer feedback form will open</li>
            <li>3. Fill out the feedback form</li>
            <li>4. Submit feedback</li>
            <li>5. Check admin dashboard for feedback</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default FeedbackQRTest;