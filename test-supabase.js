const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://tjrchjehzdqyahswoptu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqcmNoamVoemRxeWFoc3dvcHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjM1NjgsImV4cCI6MjA2OTM5OTU2OH0.2l8mjpY9Ku9dn447KJCeMI5RrdqSWbci2Y8HqF2dzcI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test simple query
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('Supabase error:', error.message)
      // If table doesn't exist yet, that's expected
      if (error.message.includes('does not exist')) {
        console.log('✅ Supabase connection successful (table not created yet)')
        return true
      }
      return false
    }
    
    console.log('✅ Supabase connection successful')
    console.log('Sample data:', data)
    return true
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    return false
  }
}

testSupabaseConnection()