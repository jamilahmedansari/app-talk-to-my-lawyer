#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

/**
 * Deploy Database Schema to Supabase
 * This script reads DEPLOY_ALL.sql and executes it via Supabase API
 */

const SUPABASE_URL = 'https://liepvjfiezgjrchbdwnb.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZXB2amZpZXpnanJjaGJkd25iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4MzI2NiwiZXhwIjoyMDcyODU5MjY2fQ.CmZYGIuQR96c7Lhp-GBFCy8kzXaTLsBXCeTCKU1aA6k';
const DB_PASSWORD = 'DAXO2cICBbWdMIeI';

async function deployDatabase() {
  console.log('🚀 Starting database deployment...\n');

  // Read the SQL file
  const sqlContent = await Deno.readTextFile('./supabase/DEPLOY_ALL.sql');
  
  console.log('📄 Loaded DEPLOY_ALL.sql');
  console.log(`📝 SQL file size: ${sqlContent.length} characters\n`);

  // Execute SQL via Supabase REST API using the postgres REST endpoint
  const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  
  console.log('⚡ Executing SQL via Supabase API...');
  console.log(`🔗 Endpoint: ${url}\n`);

  try {
    // Try using PostgREST to execute raw SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sqlContent }),
    });

    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      
      console.log('\n⚠️  Direct API execution not available.');
      console.log('\n📋 MANUAL DEPLOYMENT REQUIRED:');
      console.log('════════════════════════════════════════════════════════════════');
      console.log('1. Open: https://supabase.com/dashboard/project/liepvjfiezgjrchbdwnb/sql/new');
      console.log('2. Copy the entire contents of: supabase/DEPLOY_ALL.sql');
      console.log('3. Paste into the SQL Editor');
      console.log('4. Click "Run" button');
      console.log('════════════════════════════════════════════════════════════════\n');
      Deno.exit(1);
    }

    const result = await response.json();
    console.log('✅ Database deployed successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    
    console.log('\n⚠️  Automated deployment not possible from this environment.');
    console.log('\n📋 MANUAL DEPLOYMENT INSTRUCTIONS:');
    console.log('════════════════════════════════════════════════════════════════');
    console.log('1. Open Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/liepvjfiezgjrchbdwnb/sql/new');
    console.log('');
    console.log('2. Copy ALL contents from: supabase/DEPLOY_ALL.sql');
    console.log('');
    console.log('3. Paste into SQL Editor and click RUN');
    console.log('');
    console.log('4. You should see: "Database deployed successfully!"');
    console.log('════════════════════════════════════════════════════════════════');
    console.log('\n✨ After deployment, run: npm run dev');
    console.log('🌐 Then visit: http://localhost:3000/auth to create your account\n');
    Deno.exit(1);
  }
}

// Run deployment
deployDatabase();
