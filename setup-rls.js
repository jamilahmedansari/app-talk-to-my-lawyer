const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = 'https://tjrchjehzdqyahswoptu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqcmNoamVoemRxeWFoc3dvcHR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMzU2OCwiZXhwIjoyMDY5Mzk5NTY4fQ.FA1NK1DEqcjHOPYorh-OBBgOg6FaUQPxMlbgnCDkVEk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupRLS() {
  try {
    console.log('Setting up Row Level Security policies...')
    
    // Read the RLS SQL file
    const sqlContent = fs.readFileSync('/app/setup-rls-policies.sql', 'utf8')
    
    // Split by semicolons and filter empty statements
    const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim() + ';'
      console.log(`Executing RLS statement ${i + 1}/${statements.length}`)
      
      try {
        // Use rpc to execute raw SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.error(`Error executing RLS statement ${i + 1}:`, error.message)
          // Continue with other statements
        } else {
          console.log(`✅ RLS Statement ${i + 1} executed successfully`)
        }
      } catch (err) {
        console.error(`Error executing RLS statement ${i + 1}:`, err.message)
      }
    }
    
    console.log('✅ RLS policies setup completed!')
    
  } catch (error) {
    console.error('RLS setup failed:', error.message)
  }
}

setupRLS()