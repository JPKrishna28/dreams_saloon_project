// SMS Service for sending feedback links
class SMSService {
  constructor() {
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    this.isEnabled = process.env.SMS_ENABLED === 'true';
  }

  // Send feedback link via SMS
  async sendFeedbackLink(customerPhone, appointmentId, customerName) {
    if (!this.isEnabled) {
      console.log('SMS service is disabled');
      return { success: false, message: 'SMS service is disabled' };
    }

    if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioPhoneNumber) {
      console.error('Twilio credentials not configured');
      return { success: false, message: 'SMS service not configured' };
    }

    try {
      // For demo purposes, we'll just log the message that would be sent
      // In production, you would use actual Twilio SDK here
      const feedbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/feedback?appointment=${appointmentId}&phone=${customerPhone}`;
      
      const message = `Hi ${customerName}! Thank you for visiting Dreams Saloon. Please share your feedback: ${feedbackUrl}`;
      
      console.log('SMS would be sent to:', customerPhone);
      console.log('Message:', message);
      
      // Simulated SMS sending (replace with actual Twilio implementation)
      // const client = require('twilio')(this.twilioAccountSid, this.twilioAuthToken);
      // const result = await client.messages.create({
      //   body: message,
      //   from: this.twilioPhoneNumber,
      //   to: customerPhone
      // });
      
      return { 
        success: true, 
        message: 'Feedback link sent via SMS',
        mockData: { phone: customerPhone, message, url: feedbackUrl }
      };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return { success: false, message: 'Failed to send SMS' };
    }
  }

  // Send WhatsApp message (using Twilio WhatsApp API)
  async sendWhatsAppFeedbackLink(customerPhone, appointmentId, customerName) {
    if (!this.isEnabled) {
      console.log('WhatsApp service is disabled');
      return { success: false, message: 'WhatsApp service is disabled' };
    }

    try {
      const feedbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/feedback?appointment=${appointmentId}&phone=${customerPhone}`;
      
      const message = `Hi ${customerName}! ✨ Thank you for visiting Dreams Saloon. We'd love to hear about your experience! Please share your feedback: ${feedbackUrl}`;
      
      console.log('WhatsApp message would be sent to:', customerPhone);
      console.log('Message:', message);
      
      // Simulated WhatsApp sending (replace with actual Twilio WhatsApp implementation)
      // const client = require('twilio')(this.twilioAccountSid, this.twilioAuthToken);
      // const result = await client.messages.create({
      //   body: message,
      //   from: `whatsapp:${this.twilioPhoneNumber}`,
      //   to: `whatsapp:${customerPhone}`
      // });
      
      return { 
        success: true, 
        message: 'Feedback link sent via WhatsApp',
        mockData: { phone: customerPhone, message, url: feedbackUrl }
      };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return { success: false, message: 'Failed to send WhatsApp message' };
    }
  }
}

module.exports = new SMSService();