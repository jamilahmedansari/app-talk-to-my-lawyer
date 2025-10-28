/**
 * Check Migration 003 Status
 * Verifies if migration tables exist in Supabase
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
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkStatus() {
  console.log('🔍 Checking Migration 003 Status...\n')
  console.log(`🌐 Supabase URL: ${supabaseUrl}\n`)

  const checks = [
    { table: 'profiles', description: 'User profiles (should already exist)' },
    { table: 'letters', description: 'Legal letters (should already exist)' },
    { table: 'subscriptions', description: 'Subscriptions (should already exist)' },
    { table: 'user_roles', description: 'User roles (Migration 003)' },
    { table: 'employee_coupons', description: 'Employee coupons (Migration 003)' },
    { table: 'commissions', description: 'Commissions (Migration 003)' },
    { table: 'audit_logs', description: 'Audit logs (Migration 002)' }
  ]

  let existingTables = 0
  let missingTables = []

  for (const check of checks) {
    const { data, error } = await supabase.from(check.table).select('id').limit(1)

    if (error) {
      console.log(`❌ ${check.table.padEnd(20)} - ${check.description}`)
      console.log(`   Error: ${error.message}`)
      missingTables.push(check.table)
    } else {
      console.log(`✅ ${check.table.padEnd(20)} - ${check.description}`)
      existingTables++
    }
  }

  console.log(`\n📊 Summary: ${existingTables}/${checks.length} tables exist\n`)

  if (missingTables.length > 0) {
    console.log('⚠️  Missing tables:', missingTables.join(', '))
    console.log('\n🔧 Action required: Apply Migration 003')
    console.log('   Run: node scripts/apply-migration-003.mjs')
  } else {
    console.log('✅ All migration tables exist!')
  }
}

checkStatus().catch(console.error)
