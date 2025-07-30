const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: "postgresql://postgres:rM8mtB0dHPNAnG9z@db.tjrchjehzdqyahswoptu.supabase.co:5432/postgres"
  });

  try {
    console.log('Attempting to connect to Supabase PostgreSQL...');
    await client.connect();
    console.log('Successfully connected!');
    
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0]);
    
    await client.end();
  } catch (error) {
    console.error('Connection error:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();