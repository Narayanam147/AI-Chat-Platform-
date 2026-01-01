# Guest Chat History Fix

## Problem
When using the application in incognito mode (without logging in), chat history was not being saved or loaded properly. Guest users could chat with the AI, but their conversations would disappear after refreshing the page.

## Root Cause
There were **two conflicting history loading implementations** in [app/chat/ChatClientPage.tsx](app/chat/ChatClientPage.tsx):

1. **First implementation (Lines 234-257)**: Properly supported both authenticated and guest users
   - Used `guestToken` parameter for guest sessions
   - Formatted data correctly for the UI

2. **Second implementation (Lines 827-858)**: Only loaded history for authenticated users
   - Checked `if (!session?.user?.email) return;`
   - Ignored guest tokens completely
   - This was overriding the proper guest-aware implementation

## Solution Implemented

### 1. Removed Duplicate History Loading Code
Deleted the second useEffect (lines 827-858) that only supported authenticated users.

### 2. Enhanced the Guest-Aware Implementation
Updated the `loadChatHistory` function (lines 234-262) to:
- Check for both `session?.user?.email` OR `guestToken`
- Properly format the response data (map to ChatHistory shape)
- Add console logging for debugging
- Handle both array and `{data: array}` response formats

### Key Changes in [app/chat/ChatClientPage.tsx](app/chat/ChatClientPage.tsx#L234-L262)

```typescript
// Load chat history
const loadChatHistory = async () => {
  try {
    const url = session?.user?.email 
      ? '/api/history'
      : `/api/history?guestToken=${encodeURIComponent(guestToken || '')}`;
    
    if (!session && !guestToken) {
      return; // No session or guest token yet
    }

    const response = await fetch(url);
    if (response.ok) {
      const json = await response.json();
      // Handle both array response and {data: array} response
      const data = Array.isArray(json) ? json : json?.data;
      if (data && data.length > 0) {
        // Map API shape to ChatHistory expected shape
        const mapped = data.map((c: any) => ({
          id: String(c.id),
          title: c.title,
          timestamp: new Date(c.lastMessageAt),
          preview: c.snippet,
          messages: c.messages || [],
          pinned: c.pinned || false,
        }));
        setChatHistory(mapped);
        console.log(`✅ Loaded ${mapped.length} chats for ${session?.user?.email ? 'user' : 'guest'}`);
      }
    }
  } catch (error) {
    console.error('Failed to load chat history:', error);
  }
};
```

## How Guest Sessions Work

### 1. Guest Session Creation
- When a non-authenticated user visits the chat page, a guest session is automatically created
- A unique token is generated and stored in `localStorage`
- The token is registered in the `guest_sessions` database table

### 2. Chat Saving (for guests)
- When a guest sends a message, the `guestToken` is included in the API request
- Backend saves the chat with `guest_session_id` instead of `user_id`
- Chats are stored in the same `chats` table

### 3. Chat Loading (for guests)
- When loading history, the `guestToken` is sent as a query parameter
- Backend looks up the guest session and fetches associated chats
- Chats are returned in the same format as for authenticated users

### 4. Migration on Login
- If a guest user signs in, their chats can be migrated to their user account
- The migration is handled automatically via the `/api/guest/migrate` endpoint

## Database Tables Involved

- **`guest_sessions`**: Stores guest session tokens and metadata
- **`chats`**: Stores all chats with either `user_id` (authenticated) or `guest_session_id` (guest)
- **`chat_history`** (legacy): Also updated for backward compatibility

## Related Files

- [app/chat/ChatClientPage.tsx](app/chat/ChatClientPage.tsx#L234-L262) - Main chat component with fixed history loading
- [app/api/history/route.ts](app/api/history/route.ts#L8-L67) - API endpoint that handles both user and guest history
- [lib/guestSession.ts](lib/guestSession.ts) - Guest session utilities and management
- [models/Chat.ts](models/Chat.ts) - Chat model with methods for fetching by user or guest

## Testing

### Test as Guest User
1. Open the application in incognito/private mode
2. Start a new conversation
3. Send several messages
4. Refresh the page
5. ✅ Chat history should appear in the sidebar
6. Click on the chat
7. ✅ Previous conversation should load

### Test Guest to User Migration
1. Start a chat as a guest (incognito mode)
2. Sign in with your account
3. ✅ Guest chats should be migrated to your user account
4. ✅ All previous guest conversations should be visible

## Additional Improvements Made

- Added clear console logging to track when guest vs user chats are loaded
- Ensured consistent data formatting between guest and authenticated user paths
- Maintained compatibility with both array and object API responses

## Benefits

- **Persistent guest experience**: Guest users can now use the app with confidence that their chats are saved
- **Better UX**: Incognito users get the same experience as logged-in users
- **Data migration**: Guest chats seamlessly transfer when users create an account
- **Debugging**: Added logging makes it easier to troubleshoot history issues
