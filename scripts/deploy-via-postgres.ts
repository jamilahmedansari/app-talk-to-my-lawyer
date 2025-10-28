#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

/**
 * Deploy Database via PostgreSQL Connection
 */

import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const client = new Client({
  hostname: "db.liepvjfiezgjrchbdwnb.supabase.co",
  port: 5432,
  user: "postgres",
  password: "DAXO2cICBbWdMIeI",
  database: "postgres",
  tls: {
    enabled: true,
    enforce: false,
    caCertificates: [],
  },
});

async function deployDatabase() {
  console.log('🚀 Connecting to Supabase...\n');

  try {
    await client.connect();
    console.log('✅ Connected!\n');

    // Read the SQL file
    const sqlContent = await Deno.readTextFile('./supabase/DEPLOY_ALL.sql');
    console.log('📄 Loaded DEPLOY_ALL.sql\n');
    console.log('⚡ Executing SQL...\n');

    // Execute the SQL
    await client.queryArray(sqlContent);

    console.log('✅ Database deployed successfully!\n');
    console.log('🎉 All tables, functions, triggers, and RLS policies are in place!\n');
    console.log('📋 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Visit: http://localhost:3000/auth');
    console.log('   3. Sign up to create your account');
    console.log('   4. Make yourself admin (see QUICKSTART_REBUILD.md)\n');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await client.end();
  }
}

deployDatabase();
