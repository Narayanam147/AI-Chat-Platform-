// Test script to verify database connectivity and user creation
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testDatabase() {
  const { supabase } = await import('../lib/supabase');
  console.log('🔍 Testing Supabase connection...\n');

  // Test 1: Check connection
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('count');
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    console.log('✅ Connected to Supabase successfully');
    console.log(`📊 Users table has ${users?.length || 0} entries\n`);
  } catch (err) {
    console.error('❌ Connection error:', err);
    return;
  }

  // Test 2: List all tables
  try {
    console.log('📋 Checking tables...');
    const tables = ['users', 'conversations', 'messages', 'chat_history', 'feedback'];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: ${count} rows`);
      }
    }
  } catch (err) {
    console.error('Error checking tables:', err);
  }

  console.log('\n💡 To add test data, register a user through the app at /chat');
}

testDatabase();
