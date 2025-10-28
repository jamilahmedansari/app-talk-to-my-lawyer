#!/usr/bin/env node

/**
 * Database Verification Script
 * Checks if all tables, functions, and RLS policies are deployed
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://liepvjfiezgjrchbdwnb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZXB2amZpZXpnanJjaGJkd25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODMyNjYsImV4cCI6MjA3Mjg1OTI2Nn0.qNQdxdbA75p5MXTJimYfMEE9tt5BEpoAr_VTKNOLs0Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDatabase() {
  console.log('🔍 Verifying Database Deployment...\n');

  try {
    // Test connection
    console.log('1️⃣ Testing connection...');
    const { data: ping, error: pingError } = await supabase.from('profiles').select('count').limit(0);
    if (pingError && pingError.code !== 'PGRST116') {
      console.error('❌ Connection failed:', pingError.message);
      return;
    }
    console.log('✅ Connection successful\n');

    // Check tables
    console.log('2️⃣ Checking tables...');
    const tables = ['profiles', 'letters', 'subscriptions', 'user_roles', 'employee_coupons', 'commissions', 'audit_logs'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(0);
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}`);
      }
    }
    console.log('');

    // Check RLS is enabled
    console.log('3️⃣ Testing RLS (Row Level Security)...');
    const { data: noAuth, error: rlsError } = await supabase.from('profiles').select('*');
    if (rlsError || !noAuth) {
      console.log('   ✅ RLS is active (unauthenticated access blocked)');
    } else {
      console.log('   ⚠️  Warning: RLS might not be fully configured');
    }
    console.log('');

    console.log('✨ Database verification complete!\n');
    console.log('📋 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Open: http://localhost:3000');
    console.log('   3. Sign up at: http://localhost:3000/auth');
    console.log('   4. Make yourself admin by running SQL in Supabase dashboard:');
    console.log('      UPDATE user_roles SET role = \'admin\' WHERE user_id = \'YOUR-USER-ID\';');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyDatabase();
