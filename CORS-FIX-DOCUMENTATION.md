# CORS Configuration Fix for Dreams Saloon

## Issue
CORS (Cross-Origin Resource Sharing) error when accessing the feedback page:
```
Access to XMLHttpRequest at 'https://dreams-saloon-project.onrender.com/api/appointments/...' 
from origin 'https://dreams-saloon-project.vercel.app' has been blocked by CORS policy
```

## Root Cause
The backend server on Render needs to explicitly allow requests from the frontend domain on Vercel.

## Solution Applied

### 1. Updated CORS Configuration in `backend/src/server.js`

**Temporary Fix (for immediate resolution):**
```javascript
app.use(cors({
    origin: true, // Allow all origins temporarily
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
}));
```

**Production Fix (to be implemented after testing):**
```javascript
const allowedOrigins = [
    'http://localhost:3000',
    'https://dreams-saloon-project.vercel.app',
    'https://dreams-saloon-project-git-main-jpkrishna28s-projects.vercel.app',
    'https://dreams-saloon-project-jpkrishna28s-projects.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin) || 
            (origin.includes('dreams-saloon-project') && origin.includes('vercel.app'))) {
            return callback(null, true);
        }
        
        return callback(new Error('CORS policy violation'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
}));
```

### 2. Added Explicit Preflight Handler
```javascript
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});
```

### 3. Enhanced Debugging
Added console logging to track CORS requests and identify exact origin URLs.

## Deployment Steps

1. **Deploy Backend Changes:**
   - Push the updated `server.js` to your repository
   - Render will automatically redeploy the backend

2. **Test the Fix:**
   - Open the feedback page with the problematic URL
   - Check browser console for any remaining CORS errors
   - Verify that the appointment data loads correctly

3. **Security Hardening:**
   - After confirming the fix works, replace the temporary `origin: true` 
   - Use the production CORS configuration with specific allowed origins

## Environment Variables
Ensure these are set in your Render backend deployment:
```
FRONTEND_URL=https://dreams-saloon-project.vercel.app
MONGODB_URI=your_mongodb_connection_string
```

## Testing URLs
- Frontend: https://dreams-saloon-project.vercel.app/feedback?appointment=6909ad0fa482961c6b72d25d&phone=9666762442
- Backend API: https://dreams-saloon-project.onrender.com/api/appointments/6909ad0fa482961c6b72d25d

## Common Vercel Domain Patterns
Vercel creates multiple domain variations:
- `https://dreams-saloon-project.vercel.app` (main)
- `https://dreams-saloon-project-git-main-jpkrishna28s-projects.vercel.app` (git branch)
- `https://dreams-saloon-project-jpkrishna28s-projects.vercel.app` (user-specific)

The updated CORS configuration handles all these patterns automatically.