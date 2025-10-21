# Dreams Saloon Management System

A comprehensive salon management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring appointment booking, customer management, employee scheduling, billing, and analytics.

![Dreams Saloon](https://via.placeholder.com/800x400/DC2626/FFFFFF?text=Dreams+Saloon+Management+System)

## 🚀 Features

### Frontend (Customer)
- **Responsive Homepage** - Professional landing page with salon information
- **Online Appointment Booking** - Easy-to-use booking system with service selection
- **Mobile-Friendly Design** - Optimized for all device sizes
- **Real-time Availability** - Check employee availability and time slots

### Admin Panel
- **Secure Authentication** - JWT-based login system
- **Dashboard Analytics** - Revenue tracking, appointment statistics, popular services
- **Customer Management** - Complete customer database with loyalty tracking
- **Employee Management** - Staff profiles, schedules, and specializations
- **Appointment Management** - View, edit, and manage all bookings
- **Billing System** - Generate invoices with automated calculations
- **Reports & Analytics** - Daily income tracking and business insights

## �️ Tech Stack

### Frontend
- **React.js 18.2.0** - Modern UI library
- **Tailwind CSS 3.3.3** - Utility-first CSS framework
- **React Router 6.15.0** - Client-side routing
- **Axios** - HTTP client for API calls
- **React DatePicker** - Date and time selection
- **React Hot Toast** - Notification system
- **Recharts** - Charts and analytics visualization
- **Lucide React** - Modern icon library

### Backend
- **Node.js & Express.js** - Server-side framework
- **MongoDB & Mongoose** - Database and ODM
- **JWT & bcryptjs** - Authentication and password hashing
- **Express Validator** - Input validation and sanitization
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
dreams-saloon/
├── frontend/                 # React.js frontend
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   ├── services/        # API services
│   │   └── App.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── netlify.toml         # Netlify deployment config
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   └── server.js
│   ├── package.json
│   ├── app.json            # Heroku/Render deployment config
│   └── render.yaml         # Render-specific config
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dreams-saloon.git
   cd dreams-saloon
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Create backend environment file (.env)**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/dreams_saloon
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Create frontend environment file (.env)**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:5000`

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   Application will open on `http://localhost:3000`

4. **Seed Database (Optional)**
   ```bash
   cd backend
   npm run seed
   ```
   This creates default admin account: `admin / admin123`

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Admin registration (protected)

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Billing
- `GET /api/billing` - Get all bills
- `POST /api/billing` - Create new bill
- `GET /api/billing/:id` - Get bill by ID
- `PUT /api/billing/:id` - Update bill

## 🎨 Theme & Branding

### Dreams Saloon Color Palette
- **Primary Red**: `#DC2626` - Main brand color
- **Dark Gray**: `#1F2937` - Text and accents
- **White**: `#FFFFFF` - Background and contrast
- **Success Green**: `#10B981` - Success states
- **Warning Yellow**: `#F59E0B` - Warning states

### Typography
- **Font Family**: Inter (modern, clean, professional)
- **Headers**: Bold weights for impact
- **Body**: Regular weight for readability

## 🌐 Deployment

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variable: `REACT_APP_API_URL`

### Backend (Render/Heroku)
1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `node src/server.js`
4. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CORS_ORIGIN`
   - `NODE_ENV=production`

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Get connection string
3. Update `MONGODB_URI` in backend environment

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Secure HTTP headers
- MongoDB injection protection

## 📊 Database Schema

### Models
1. **Admin** - System administrators
2. **Customer** - Client information and loyalty points
3. **Employee** - Staff details and schedules
4. **Appointment** - Booking information
5. **Billing** - Invoice and payment records
6. **DailyIncome** - Revenue tracking

## 📞 Contact Details
- **Ramesh**: 9963388556
- **Rambabu**: 9666699201

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 👨‍💻 Author

**Dreams Saloon Development Team**
- Website: [www.dreamssaloon.com](https://www.dreamssaloon.com)
- Email: info@dreamssaloon.com

## 🙏 Acknowledgments

- React.js community for excellent documentation
- Tailwind CSS for the utility-first CSS framework
- MongoDB team for the robust database solution
- Express.js for the minimal and flexible Node.js framework

---

**Dreams Saloon** - Transforming salon management with modern technology 💇‍♂️✨"# dreams_saloon_project" 
