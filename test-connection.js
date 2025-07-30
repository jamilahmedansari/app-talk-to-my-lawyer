const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: "postgresql://postgres:rM8mtB0dHPNAnG9z@db.tjrchjehzdqyahswoptu.supabase.co:5432/postgres",
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('Attempting to connect to Supabase PostgreSQL...');
    
    // Add timeout to prevent hanging
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 15000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    console.log('Successfully connected!');
    
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0]);
    
    await client.end();
  } catch (error) {
    console.error('Connection error:', error.message);
    console.error('Error code:', error.code);
  }
}

testConnection();