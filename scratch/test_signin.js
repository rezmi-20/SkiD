require('dotenv').config({ path: '.env.local' });

async function testSignIn() {
  const url = process.env.NEON_AUTH_BASE_URL + '/sign-in/email';
  console.log('Posting to', url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({
        email: 'admin@dire-skill.com',
        password: 'admin123'
      })
    });
    
    const data = await res.json().catch(() => null);
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

testSignIn();
