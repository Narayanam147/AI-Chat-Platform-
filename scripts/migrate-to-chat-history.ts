/**
 * Migration Script: Migrate data from chats table to chat_history table
 * This converts JSONB messages array into separate prompt/response rows
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

interface Message {
  text: string;
  sender: string;
  timestamp: string;
}

interface Chat {
  id: string;
  user_id: string;
  messages: Message[];
  title: string;
  pinned: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

async function migrate() {
  console.log('🚀 Starting migration from chats to chat_history...\n');

  try {
    // 1. Fetch all data from chats table
    const { data: chats, error: fetchError } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching chats:', fetchError);
      return;
    }

    console.log(`📊 Found ${chats?.length || 0} chats to migrate\n`);

    if (!chats || chats.length === 0) {
      console.log('✅ No data to migrate');
      return;
    }

    // 2. Convert each chat to chat_history format
    const chatHistoryRecords = [];

    for (const chat of chats as Chat[]) {
      const messages = chat.messages || [];
      
      // Extract first user message as prompt and first AI message as response
      const userMsg = messages.find(m => m.sender === 'user');
      const aiMsg = messages.find(m => m.sender === 'ai');

      if (userMsg && aiMsg) {
        chatHistoryRecords.push({
          id: chat.id, // Keep same ID
          user_id: chat.user_id,
          prompt: userMsg.text,
          response: aiMsg.text,
          title: chat.title,
          pinned: chat.pinned,
          is_deleted: chat.is_deleted,
          deleted_at: chat.deleted_at,
          created_at: chat.created_at,
          updated_at: chat.updated_at,
        });
      }
    }

    console.log(`📝 Prepared ${chatHistoryRecords.length} records for migration\n`);

    // 3. Insert into chat_history table
    for (const record of chatHistoryRecords) {
      const { error: insertError } = await supabase
        .from('chat_history')
        .upsert(record, { onConflict: 'id' });

      if (insertError) {
        console.error(`❌ Error inserting record ${record.id}:`, insertError.message);
      } else {
        console.log(`✅ Migrated: ${record.title}`);
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Total chats: ${chats.length}`);
    console.log(`   - Migrated to chat_history: ${chatHistoryRecords.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run migration
migrate();
