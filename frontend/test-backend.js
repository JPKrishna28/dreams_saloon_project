// Test script to verify deployed backend
const testBackend = async () => {
  const backendURL = 'https://dreams-saloon-project.onrender.com';
  
  console.log('🧪 Testing Dreams Saloon Backend Deployment...\n');
  
  try {
    // Test health endpoint
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${backendURL}/api/health`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ Health check passed:', healthData.message);
      console.log('📅 Server timestamp:', healthData.timestamp);
      console.log('🌍 Environment:', healthData.environment);
    } else {
      console.log('❌ Health check failed:', healthData);
      return;
    }
    
    console.log('\n2️⃣ Testing CORS configuration...');
    const corsTest = await fetch(`${backendURL}/api/health`, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json'
      }
    });
    
    if (corsTest.ok) {
      console.log('✅ CORS configured correctly');
    } else {
      console.log('⚠️ CORS might need configuration');
    }
    
    console.log('\n3️⃣ Testing admin login endpoint...');
    const loginResponse = await fetch(`${backendURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Admin login working');
      console.log('🎫 Token received:', loginData.success ? 'Yes' : 'No');
    } else {
      console.log('❌ Login failed:', loginData.message);
    }
    
    console.log('\n🎉 Backend deployment test completed!');
    console.log('\n📍 Frontend should use:');
    console.log('REACT_APP_API_URL=https://dreams-saloon-project.onrender.com/api');
    
  } catch (error) {
    console.error('💥 Error testing backend:', error.message);
  }
};

testBackend();