/**
 * Apply Migration 002 (Audit Logs) to Supabase Database
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

async function applyMigration() {
  console.log('🚀 Applying Migration 002 (Audit Logs)...\n')

  const migrationPath = resolve(__dirname, '../supabase/migrations/002_audit_logs.sql')
  const migrationSQL = readFileSync(migrationPath, 'utf-8')

  console.log(`✅ Loaded migration (${migrationSQL.length} characters)`)

  // Note: profiles table in migration 002 references old schema with 'role' column
  // We need to update the RLS policy to work with new user_roles table

  const updatedSQL = migrationSQL.replace(
    `EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )`,
    `EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'admin'
    )`
  ).replace(
    `WHEN (OLD.role IS DISTINCT FROM NEW.role)`,
    `WHEN (FALSE)` // Disable old trigger since role moved to user_roles table
  ).replace(
    `IF OLD.role IS DISTINCT FROM NEW.role THEN`,
    `IF FALSE THEN` // Disable trigger logic
  )

  console.log('⚙️  Executing migration...\n')

  try {
    // Execute via Supabase SQL
    const { error } = await supabase.rpc('exec', { sql: updatedSQL })

    if (error) {
      console.error('❌ Migration failed:', error.message)
      console.log('\n⚠️  Try manual application:')
      console.log('   1. Go to Supabase Dashboard SQL Editor')
      console.log('   2. Paste migration 002 SQL')
      console.log('   3. Update the RLS policy to use user_roles table')
      process.exit(1)
    }

    console.log('✅ Migration 002 applied successfully!\n')

    // Verify
    const { data, error: checkError } = await supabase.from('audit_logs').select('id').limit(1)

    if (checkError) {
      console.log('⚠️  Audit logs table verification failed')
    } else {
      console.log('✅ Audit logs table verified')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

applyMigration().catch(console.error)
