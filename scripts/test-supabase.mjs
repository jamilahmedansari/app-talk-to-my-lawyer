// Test Supabase Connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  console.log('URL:', supabaseUrl)
  console.log('Key:', supabaseKey.substring(0, 20) + '...')
  
  try {
    // Test connection by querying auth
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Connection error:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('Session data:', data)
    
    // Test if tables exist
    const { data: tables, error: tableError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (tableError) {
      console.warn('⚠️  Tables may not exist yet:', tableError.message)
      console.log('Run the migration: npx supabase db push')
    } else {
      console.log('✅ Database tables accessible')
    }
    
    return true
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    return false
  }
}

testConnection()
