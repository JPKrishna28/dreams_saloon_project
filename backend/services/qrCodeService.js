// QR Code Service for generating feedback link QR codes
class QRCodeService {
  constructor() {
    this.qrCodeLib = null;
    this.init();
  }

  async init() {
    try {
      // Dynamically import QR code library
      // Note: You'll need to install 'qrcode' package: npm install qrcode
      // For now, this is a mock implementation
      console.log('QR Code service initialized');
    } catch (error) {
      console.error('Failed to initialize QR code library:', error);
    }
  }

  // Generate QR code for feedback link
  async generateFeedbackQR(appointmentId, customerPhone, customerName) {
    try {
      const feedbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/feedback?appointment=${appointmentId}&phone=${customerPhone}`;
      
      // Mock QR code generation (replace with actual qrcode library)
      // const QRCode = require('qrcode');
      // const qrCodeDataURL = await QRCode.toDataURL(feedbackUrl, {
      //   width: 300,
      //   margin: 2,
      //   color: {
      //     dark: '#000000',
      //     light: '#FFFFFF'
      //   }
      // });

      // For demo purposes, return a mock data URL
      const mockQRCode = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmZiIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkZlZWRiYWNrIFFSPC90ZXh0PgogIDx0ZXh0IHg9IjE1MCIgeT0iMTcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiPiR7Y3VzdG9tZXJOYW1lfTwvdGV4dD4KPC9zdmc+`;

      return {
        success: true,
        qrCodeDataURL: mockQRCode,
        feedbackUrl: feedbackUrl,
        message: 'QR code generated successfully'
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      return {
        success: false,
        message: 'Failed to generate QR code'
      };
    }
  }

  // Generate printable QR code with salon branding
  async generatePrintableQR(appointmentId, customerPhone, customerName, salonInfo = {}) {
    try {
      const result = await this.generateFeedbackQR(appointmentId, customerPhone, customerName);
      
      if (!result.success) {
        return result;
      }

      // Create a printable version with branding
      const printableHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Dreams Saloon - Feedback QR Code</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
            }
            .header { 
              margin-bottom: 20px; 
              color: #8B5CF6;
            }
            .qr-container { 
              border: 2px dashed #8B5CF6; 
              padding: 20px; 
              margin: 20px 0;
              border-radius: 10px;
            }
            .footer { 
              margin-top: 20px; 
              font-size: 12px; 
              color: #666;
            }
            .customer-info {
              background: #F3F4F6;
              padding: 10px;
              border-radius: 5px;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Dreams Saloon</h1>
            <p>Thank you for your visit!</p>
          </div>
          
          <div class="customer-info">
            <strong>Customer:</strong> ${customerName}<br>
            <strong>Phone:</strong> ${customerPhone}
          </div>
          
          <div class="qr-container">
            <img src="${result.qrCodeDataURL}" alt="Feedback QR Code" style="max-width: 200px;">
            <p><strong>Scan to share your feedback</strong></p>
          </div>
          
          <div class="footer">
            <p>Or visit: ${result.feedbackUrl}</p>
            <p>Dreams Saloon - Where Beauty Dreams Come True</p>
          </div>
        </body>
        </html>
      `;

      return {
        success: true,
        qrCodeDataURL: result.qrCodeDataURL,
        printableHTML: printableHTML,
        feedbackUrl: result.feedbackUrl,
        message: 'Printable QR code generated successfully'
      };
    } catch (error) {
      console.error('Error generating printable QR code:', error);
      return {
        success: false,
        message: 'Failed to generate printable QR code'
      };
    }
  }
}

module.exports = new QRCodeService();