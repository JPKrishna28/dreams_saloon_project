// QR Code Service for generating feedback link QR codes
const QRCode = require('qrcode');

class QRCodeService {
  constructor() {
    console.log('QR Code service initialized with real QR library');
  }

  // Generate QR code for feedback link
  async generateFeedbackQR(appointmentId, customerPhone, customerName) {
    try {
      const feedbackUrl = `${process.env.FRONTEND_URL || 'https://dreams-saloon-project.vercel.app'}/feedback?appointment=${appointmentId}&phone=${customerPhone}`;
      
      console.log('Generating QR code for URL:', feedbackUrl);
      
      // Generate actual QR code
      const qrCodeDataURL = await QRCode.toDataURL(feedbackUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#8B5CF6',  // Purple color for Dreams Saloon branding
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      console.log('QR code generated successfully');

      return {
        success: true,
        qrCodeDataURL: qrCodeDataURL,
        feedbackUrl: feedbackUrl,
        message: 'QR code generated successfully'
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      return {
        success: false,
        message: 'Failed to generate QR code: ' + error.message
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
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              text-align: center; 
              padding: 30px;
              max-width: 500px;
              margin: 0 auto;
              background: #f9fafb;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 15px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header { 
              margin-bottom: 30px; 
              color: #8B5CF6;
              border-bottom: 3px solid #8B5CF6;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 2.5em;
              font-weight: bold;
            }
            .header p {
              margin: 10px 0 0 0;
              font-size: 1.2em;
              color: #666;
            }
            .qr-container { 
              border: 3px dashed #8B5CF6; 
              padding: 30px; 
              margin: 30px 0;
              border-radius: 15px;
              background: #faf5ff;
            }
            .qr-container img {
              max-width: 250px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .qr-container p {
              margin: 20px 0 0 0;
              font-size: 1.3em;
              font-weight: bold;
              color: #8B5CF6;
            }
            .customer-info {
              background: #f3f4f6;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
              border-left: 5px solid #8B5CF6;
            }
            .customer-info h3 {
              margin: 0 0 10px 0;
              color: #374151;
            }
            .footer { 
              margin-top: 30px; 
              font-size: 14px; 
              color: #666;
              border-top: 2px solid #e5e7eb;
              padding-top: 20px;
            }
            .url-box {
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
              word-break: break-all;
              font-family: monospace;
              font-size: 12px;
              border: 1px solid #d1d5db;
            }
            .instructions {
              background: #ecfdf5;
              border: 1px solid #10b981;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
              color: #065f46;
            }
            @media print {
              body { background: white; }
              .container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Dreams Saloon ✨</h1>
              <p>Where Beauty Dreams Come True</p>
            </div>
            
            <div class="customer-info">
              <h3>Customer Details</h3>
              <strong>Name:</strong> ${customerName}<br>
              <strong>Phone:</strong> ${customerPhone}
            </div>
            
            <div class="qr-container">
              <img src="${result.qrCodeDataURL}" alt="Feedback QR Code">
              <p>📱 Scan to Share Your Experience</p>
            </div>
            
            <div class="instructions">
              <strong>How to use:</strong><br>
              1. Open your phone's camera<br>
              2. Point it at the QR code<br>
              3. Tap the notification that appears<br>
              4. Fill out your feedback form
            </div>
            
            <div class="footer">
              <p><strong>Direct Link:</strong></p>
              <div class="url-box">${result.feedbackUrl}</div>
              <p style="margin-top: 20px;">
                <strong>Dreams Saloon</strong><br>
                Thank you for choosing us for your beauty needs!<br>
                Your feedback helps us serve you better.
              </p>
            </div>
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
        message: 'Failed to generate printable QR code: ' + error.message
      };
    }
  }
}

module.exports = new QRCodeService();