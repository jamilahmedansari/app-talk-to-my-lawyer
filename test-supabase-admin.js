const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://tjrchjehzdqyahswoptu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqcmNoamVoemRxeWFoc3dvcHR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMzU2OCwiZXhwIjoyMDY5Mzk5NTY4fQ.FA1NK1DEqcjHOPYorh-OBBgOg6FaUQPxMlbgnCDkVEk'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testSupabaseAdmin() {
  try {
    console.log('Testing Supabase with admin/service key...')
    
    // Test users table
    const { data: users, error: usersError } = await supabase.from('users').select('*').limit(1)
    
    if (usersError) {
      console.error('Users table error:', usersError.message)
    } else {
      console.log('✅ Users table accessible with service key')
      console.log('Users data:', users)
    }
    
    // Test contractors table
    const { data: contractors, error: contractorsError } = await supabase.from('contractors').select('*').limit(1)
    
    if (contractorsError) {
      console.error('Contractors table error:', contractorsError.message)
    } else {
      console.log('✅ Contractors table accessible with service key')
      console.log('Contractors data:', contractors)
    }
    
    // Test letters table
    const { data: letters, error: lettersError } = await supabase.from('letters').select('*').limit(1)
    
    if (lettersError) {
      console.error('Letters table error:', lettersError.message)
    } else {
      console.log('✅ Letters table accessible with service key')
      console.log('Letters data:', letters)
    }
    
    console.log('✅ Schema verification with service key completed!')
    return true
  } catch (error) {
    console.error('❌ Admin connection failed:', error.message)
    return false
  }
}

testSupabaseAdmin()