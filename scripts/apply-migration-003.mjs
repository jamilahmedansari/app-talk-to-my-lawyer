/**
 * Apply Migration 003 to Supabase Database
 * Run with: node scripts/apply-migration-003.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local manually
const envPath = resolve(__dirname, '../.env.local')
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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  console.log('🚀 Starting Migration 003 Application...\n')

  // Read migration file
  const migrationPath = resolve(__dirname, '../supabase/migrations/003_enhanced_schema.sql')
  console.log(`📄 Reading migration from: ${migrationPath}`)

  let migrationSQL
  try {
    migrationSQL = readFileSync(migrationPath, 'utf-8')
    console.log(`✅ Migration file loaded (${migrationSQL.length} characters)\n`)
  } catch (error) {
    console.error('❌ Failed to read migration file:', error.message)
    process.exit(1)
  }

  // Verify connection
  console.log('🔌 Testing Supabase connection...')
  const { data: testData, error: testError } = await supabase.from('profiles').select('id').limit(1)

  if (testError) {
    console.error('❌ Connection failed:', testError.message)
    process.exit(1)
  }

  console.log('✅ Connected to Supabase successfully\n')

  // Apply migration by executing raw SQL
  console.log('⚙️  Applying migration to database...')
  console.log('⚠️  Note: This will execute the entire migration file\n')

  try {
    // Use the REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: migrationSQL })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    console.log('✅ Migration executed!\n')

    // Verify tables were created
    console.log('🔍 Verifying new tables...')
    await verifyTables()

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.log('\n⚠️  Manual application required via Supabase Dashboard SQL Editor')
    console.log('   1. Go to https://supabase.com/dashboard/project/liepvjfiezgjrchbdwnb/sql/new')
    console.log('   2. Copy contents of supabase/migrations/003_enhanced_schema.sql')
    console.log('   3. Execute the SQL directly\n')
    console.log('   Alternatively, I can show you the SQL to run manually.')
    process.exit(1)
  }
}

async function verifyTables() {
  const tablesToCheck = [
    'user_roles',
    'employee_coupons',
    'commissions'
  ]

  let allTablesExist = true

  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select('id').limit(1)

    if (error) {
      console.log(`   ❌ ${table}: NOT FOUND (${error.message})`)
      allTablesExist = false
    } else {
      console.log(`   ✅ ${table}: EXISTS`)
    }
  }

  if (allTablesExist) {
    console.log('\n🎉 All migration tables verified successfully!')
  } else {
    console.log('\n⚠️  Some tables missing - manual verification needed')
  }
}

// Run migration
applyMigration()
  .then(() => {
    console.log('\n✨ All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error.message)
    process.exit(1)
  })
