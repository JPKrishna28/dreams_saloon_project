# 🚀 CORS Fix - Deployment Update Guide

## Issue: 
CORS blocking requests from Vercel (`https://dreams-saloon-project.vercel.app`) to Render backend (`https://dreams-saloon-project.onrender.com`)

## ✅ Fixed in Code:
1. ✅ Updated CORS configuration in `backend/src/server.js`
2. ✅ Updated `FRONTEND_URL` in `backend/.env`

## 🔧 Required Action - Update Render Environment Variables:

### Step 1: Go to Render Dashboard
1. Visit [render.com](https://render.com)
2. Login to your account
3. Find your "dreams-saloon-project" service

### Step 2: Update Environment Variables
Go to your service → Settings → Environment Variables

**Update/Add these variables:**

```env
FRONTEND_URL=https://dreams-saloon-project.vercel.app
NODE_ENV=production
MONGODB_URI=mongodb+srv://pj:123@cluster0.inynlg4.mongodb.net/
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
PORT=5000
```

### Step 3: Redeploy Backend
1. After updating environment variables
2. Go to "Manual Deploy" → "Deploy Latest Commit"
3. Wait for deployment to complete

## 🧪 Test After Update:

### Test 1: Health Check
```bash
curl https://dreams-saloon-project.onrender.com/api/health
```

### Test 2: CORS Test
Open browser console on https://dreams-saloon-project.vercel.app and run:

```javascript
fetch('https://dreams-saloon-project.onrender.com/api/health', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => console.log('✅ CORS working:', data))
.catch(err => console.error('❌ CORS issue:', err));
```

### Test 3: Admin Login
Try logging in with `admin/admin123` on your Vercel deployment.

## 🔄 Alternative: Quick Fix (If you can't access Render right now)

If you can't update Render environment variables immediately, you can temporarily disable credentials in CORS:

**In `backend/src/server.js`, change:**
```javascript
app.use(cors({
    origin: '*',
    credentials: false,  // ← Change this temporarily
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

⚠️ **Note:** This is less secure but will work for testing. Revert back to the proper configuration once you update Render.

## 🎯 Expected Result:
After fixing, your Vercel frontend should successfully connect to Render backend without CORS errors.

## 📞 Need Help?
If you still see CORS errors after updating Render:
1. Check Render logs for any error messages
2. Verify environment variables are saved correctly
3. Ensure the deployment completed successfully
4. Test the health endpoint directly first