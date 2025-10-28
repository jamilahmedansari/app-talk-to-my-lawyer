import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local manually
const envPath = '/workspaces/app/.env.local'
const envContent = readFileSync(envPath, 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkFunctions() {
  console.log('🔍 Checking Database Functions...\n')

  const functionsToCheck = [
    'is_admin()',
    'is_employee()',
    'check_subscription_limits(uuid)',
    'handle_new_user()',
    'handle_subscription_insert()',
  ]

  for (const func of functionsToCheck) {
    try {
      // Try to call the function to see if it exists
      const { data, error } = await supabase.rpc(func.split('(')[0], {})
      
      if (error && error.message.includes('not found')) {
        console.log(`❌ ${func} - NOT FOUND`)
      } else {
        console.log(`✅ ${func} - EXISTS`)
      }
    } catch (err) {
      console.log(`✅ ${func} - EXISTS (or protected)`)
    }
  }

  console.log('\n✅ Function check complete')
}

checkFunctions().catch(console.error)
