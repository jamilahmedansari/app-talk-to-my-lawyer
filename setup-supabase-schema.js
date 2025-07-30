const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = 'https://tjrchjehzdqyahswoptu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqcmNoamVoemRxeWFoc3dvcHR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMzU2OCwiZXhwIjoyMDY5Mzk5NTY4fQ.FA1NK1DEqcjHOPYorh-OBBgOg6FaUQPxMlbgnCDkVEk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupSchema() {
  try {
    console.log('Setting up Supabase schema...')
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('/app/supabase-schema.sql', 'utf8')
    
    // Split by semicolons and filter empty statements
    const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim() + ';'
      console.log(`Executing statement ${i + 1}/${statements.length}`)
      
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error.message)
        // Continue with other statements
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`)
      }
    }
    
    console.log('Schema setup completed!')
    
    // Test the setup by querying one table
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      
    if (queryError) {
      console.error('Query test error:', queryError.message)
    } else {
      console.log('✅ Schema verification successful')
    }
    
  } catch (error) {
    console.error('Schema setup failed:', error.message)
  }
}

setupSchema()