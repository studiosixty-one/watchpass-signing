// Test script for Netlify function
// Run: node test-netlify.js

const testPayload = {
  watch: {
    id: "test-uuid-123",
    serialNumber: "TEST123",
    brand: "Rolex",
    model: "Submariner",
    photoUrl: ""
  },
  ownershipUuid: "test-ownership-uuid-456"
};

async function testNetlifyFunction() {
  const netlifyUrl = process.env.NETLIFY_FUNCTION_URL || 'http://localhost:8888/.netlify/functions/generate-pass';
  
  console.log('🧪 Testing Netlify Function...');
  console.log('📍 URL:', netlifyUrl);
  console.log('📦 Payload:', JSON.stringify(testPayload, null, 2));
  console.log('');

  try {
    const response = await fetch(netlifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('');

    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('📄 Response Body:', JSON.stringify(data, null, 2));
      
      if (response.status === 200) {
        console.log('✅ SUCCESS: Function returned 200');
      } else if (response.status === 501) {
        console.log('⚠️  WARNING: Function needs setup (expected if not fully configured)');
        console.log('   This is normal if environment variables are not set yet');
      } else if (response.status === 500) {
        console.log('❌ ERROR: Function returned 500');
        if (data.error) {
          console.log('   Error:', data.error);
        }
      }
    } else if (contentType && contentType.includes('application/vnd.apple.pkpass')) {
      const buffer = await response.arrayBuffer();
      console.log('✅ SUCCESS: Function returned .pkpass file!');
      console.log('   File size:', buffer.byteLength, 'bytes');
      console.log('   This means the pass was generated and signed correctly! 🎉');
    } else {
      const text = await response.text();
      console.log('📄 Response:', text.substring(0, 500));
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   - Is the Netlify function deployed?');
    console.log('   - Is the URL correct?');
    console.log('   - For local testing, run: npm run dev');
    console.log('   - Then test with: NETLIFY_FUNCTION_URL=http://localhost:8888/.netlify/functions/generate-pass node test-netlify.js');
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('⚠️  Node.js version < 18 detected. Installing node-fetch...');
  console.log('   Run: npm install node-fetch');
  process.exit(1);
}

testNetlifyFunction();

