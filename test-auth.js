async function testAuth() {
  const baseURL = 'http://localhost:3001'
  
  try {
    console.log('Testing Supabase Auth signup...')
    
    // Test signup
    const signupResponse = await fetch(`${baseURL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user'
      })
    })
    
    const signupData = await signupResponse.json()
    
    if (signupResponse.ok) {
      console.log('✅ Signup successful:', signupData.message)
      console.log('User:', signupData.user)
    } else {
      console.error('❌ Signup failed:', signupData.error)
    }
    
    // Test signin
    console.log('\nTesting Supabase Auth signin...')
    const signinResponse = await fetch(`${baseURL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'password123'
      })
    })
    
    const signinData = await signinResponse.json()
    
    if (signinResponse.ok) {
      console.log('✅ Signin successful:', signinData.message)
      console.log('User:', signinData.user)
    } else {
      console.error('❌ Signin failed:', signinData.error)
    }
    
  } catch (error) {
    console.error('Test error:', error.message)
  }
}

testAuth()