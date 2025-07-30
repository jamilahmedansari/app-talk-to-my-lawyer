const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://tjrchjehzdqyahswoptu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqcmNoamVoemRxeWFoc3dvcHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjM1NjgsImV4cCI6MjA2OTM5OTU2OH0.2l8mjpY9Ku9dn447KJCeMI5RrdqSWbci2Y8HqF2dzcI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection with actual tables...')
    
    // Test users table
    const { data: users, error: usersError } = await supabase.from('users').select('count').limit(1)
    
    if (usersError) {
      console.error('Users table error:', usersError.message)
      return false
    }
    
    console.log('✅ Users table accessible')
    
    // Test contractors table
    const { data: contractors, error: contractorsError } = await supabase.from('contractors').select('count').limit(1)
    
    if (contractorsError) {
      console.error('Contractors table error:', contractorsError.message)
      return false
    }
    
    console.log('✅ Contractors table accessible')
    
    // Test letters table
    const { data: letters, error: lettersError } = await supabase.from('letters').select('count').limit(1)
    
    if (lettersError) {
      console.error('Letters table error:', lettersError.message)
      return false
    }
    
    console.log('✅ Letters table accessible')
    
    console.log('✅ All core tables are accessible - schema setup successful!')
    return true
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    return false
  }
}

testSupabaseConnection()