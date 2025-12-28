// Sync chats table to chat_history table (legacy support)
import { supabaseAdmin } from './supabase';

export async function syncChatToHistory(chatId: string, messages: any[]) {
  if (!supabaseAdmin) return;

  // Extract user messages paired with AI responses
  const pairs: { prompt: string; response: string; timestamp: string }[] = [];
  
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].sender === 'user' && messages[i + 1].sender === 'ai') {
      pairs.push({
        prompt: messages[i].text,
        response: messages[i + 1].text,
        timestamp: messages[i].timestamp,
      });
    }
  }

  // Get chat details
  const { data: chat } = await supabaseAdmin
    .from('chats')
    .select('user_id, guest_session_id, title')
    .eq('id', chatId)
    .single();

  if (!chat) return;

  // Insert into chat_history
  for (const pair of pairs) {
    await supabaseAdmin
      .from('chat_history')
      .insert({
        user_id: chat.user_id,
        guest_session_id: chat.guest_session_id,
        prompt: pair.prompt,
        response: pair.response,
        title: chat.title,
        created_at: pair.timestamp,
        updated_at: pair.timestamp,
      });
  }
}
