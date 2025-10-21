# Dreams Saloon - Deployment Guide

This guide will help you deploy the Dreams Saloon Management System to production.

## 📋 Pre-deployment Checklist

### Backend Preparation
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] JWT secret generated
- [ ] CORS origins updated
- [ ] Health check endpoint working

### Frontend Preparation
- [ ] API URL updated for production
- [ ] Build process tested locally
- [ ] Environment variables set
- [ ] Static assets optimized

## 🚀 Deployment Steps

### 1. Database Setup (MongoDB Atlas)

1. **Create Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account

2. **Create Cluster**
   - Choose AWS/Google Cloud/Azure
   - Select free tier (M0)
   - Choose region closest to your users

3. **Setup Database User**
   - Go to Database Access
   - Add new database user
   - Choose password authentication
   - Save username and password

4. **Configure Network Access**
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allow from anywhere)
   - Or add specific IPs for better security

5. **Get Connection String**
   - Go to Clusters > Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### 2. Backend Deployment (Render)

1. **Create Render Account**
   - Go to [Render](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - New > Web Service
   - Connect your GitHub repository
   - Select the backend folder if needed

3. **Configure Service**
   ```
   Name: dreams-saloon-api
   Environment: Node
   Build Command: npm install
   Start Command: node src/server.js
   ```

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-atlas-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   CORS_ORIGIN=https://your-frontend-url.netlify.app
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Test health endpoint: `https://your-api.onrender.com/api/health`

### 3. Frontend Deployment (Netlify)

1. **Create Netlify Account**
   - Go to [Netlify](https://netlify.com)
   - Sign up with GitHub

2. **Deploy from GitHub**
   - New site from Git
   - Choose GitHub
   - Select your repository
   - Select frontend folder if needed

3. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: build
   ```

4. **Set Environment Variables**
   - Go to Site Settings > Environment Variables
   - Add: `REACT_APP_API_URL=https://your-api.onrender.com/api`

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

### 4. Custom Domain (Optional)

1. **Backend (Render)**
   - Go to Settings > Custom Domains
   - Add your API subdomain: `api.yourdomain.com`
   - Update DNS records as instructed

2. **Frontend (Netlify)**
   - Go to Domain Settings
   - Add custom domain: `yourdomain.com`
   - Update DNS records as instructed
   - Enable HTTPS (automatic with Netlify)

## 🔧 Post-deployment Configuration

### 1. Update Environment Variables
After deployment, update these URLs in your environment variables:

**Backend (.env)**
```env
CORS_ORIGIN=https://yourdomain.com
```

**Frontend (.env)**
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

### 2. Seed Database
Run the seed script to create initial data:
```bash
# If you have access to the server
npm run seed

# Or manually create admin user via API
POST /api/auth/register
{
  "username": "admin",
  "password": "admin123",
  "email": "admin@dreamssaloon.com",
  "firstName": "Admin",
  "lastName": "User"
}
```

### 3. Test Deployment
1. Visit your frontend URL
2. Test appointment booking
3. Login to admin panel
4. Check all features work
5. Test API endpoints

## 🔒 Security Considerations

### Production Security
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS on both frontend and backend
- [ ] Restrict CORS to specific domains
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting (add middleware)
- [ ] Regular security updates

### Database Security
- [ ] Use strong database passwords
- [ ] Restrict network access to known IPs
- [ ] Enable database backup
- [ ] Monitor database access logs

## 📊 Monitoring & Maintenance

### Health Monitoring
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor API response times
- Check database performance
- Set up alerts for downtime

### Backup Strategy
- Enable automatic database backups
- Export critical data regularly
- Test restoration process
- Document recovery procedures

### Updates & Maintenance
- Regular dependency updates
- Security patch installation
- Performance monitoring
- User feedback collection

## 🆘 Troubleshooting

### Common Issues

**Build Failures**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for syntax errors in code

**Database Connection Issues**
- Verify MongoDB URI format
- Check network access whitelist
- Confirm database user credentials

**CORS Errors**
- Update CORS_ORIGIN in backend
- Check frontend API URL
- Ensure HTTPS/HTTP consistency

**Authentication Issues**
- Verify JWT secret is same across deploys
- Check token expiration settings
- Confirm user credentials

### Getting Help
- Check application logs in deployment platforms
- Use browser developer tools for frontend issues
- Test API endpoints with Postman/curl
- Refer to platform-specific documentation

---

## 📞 Support
For deployment support, contact:
- **Ramesh**: 9963388556
- **Rambabu**: 9666699201

**Dreams Saloon** - Successfully deployed! 🎉