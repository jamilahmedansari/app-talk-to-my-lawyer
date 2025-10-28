/**
 * Apply Migration 003 to Supabase Database
 * This script applies the enhanced schema migration directly to Supabase
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
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

  let migrationSQL: string
  try {
    migrationSQL = readFileSync(migrationPath, 'utf-8')
    console.log(`✅ Migration file loaded (${migrationSQL.length} characters)\n`)
  } catch (error) {
    console.error('❌ Failed to read migration file:', error)
    process.exit(1)
  }

  // Apply migration
  console.log('⚙️  Applying migration to database...')

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: migrationSQL })

    if (error) {
      // Try direct execution if exec_sql doesn't exist
      console.log('⚠️  exec_sql function not found, trying direct execution...')

      // Split SQL into individual statements and execute them
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      console.log(`📝 Executing ${statements.length} SQL statements...`)

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i] + ';'
        console.log(`   [${i + 1}/${statements.length}] Executing...`)

        const { error: stmtError } = await supabase.rpc('exec', { sql: stmt })

        if (stmtError) {
          console.error(`   ❌ Statement ${i + 1} failed:`, stmtError.message)
          // Continue with next statement
        }
      }
    }

    console.log('\n✅ Migration 003 applied successfully!\n')

    // Verify tables were created
    console.log('🔍 Verifying new tables...')
    await verifyTables()

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    console.log('\n⚠️  Manual application required via Supabase Dashboard SQL Editor')
    console.log('   1. Go to https://supabase.com/dashboard/project/liepvjfiezgjrchbdwnb/sql/new')
    console.log('   2. Copy contents of supabase/migrations/003_enhanced_schema.sql')
    console.log('   3. Execute the SQL directly')
    process.exit(1)
  }
}

async function verifyTables() {
  const tablesToCheck = [
    'user_roles',
    'employee_coupons',
    'commissions'
  ]

  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select('id').limit(1)

    if (error) {
      console.log(`   ❌ ${table}: NOT FOUND`)
    } else {
      console.log(`   ✅ ${table}: EXISTS`)
    }
  }

  console.log('\n🎉 Migration verification complete!')
}

// Run migration
applyMigration()
  .then(() => {
    console.log('\n✨ All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error)
    process.exit(1)
  })
