// Quick test script to check guest session creation
// Run in browser console on http://localhost:3002/chat

console.log('🧪 Testing Guest Session Creation...');

// Check current session
console.log('1️⃣ Checking authentication status...');
fetch('/api/auth/session')
  .then(r => r.json())
  .then(session => {
    console.log('Session:', session);
    if (session?.user) {
      console.log('⚠️ You are logged in as:', session.user.email);
      console.log('💡 To test guest mode: Sign out first or use incognito mode');
    } else {
      console.log('✅ Not logged in - guest mode should activate');
      
      // Test guest session creation
      console.log('\n2️⃣ Creating guest session...');
      fetch('/api/guest/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(r => r.json())
      .then(data => {
        console.log('✅ Guest session response:', data);
        if (data.token) {
          localStorage.setItem('guest_session_token', data.token);
          console.log('✅ Token saved to localStorage');
          console.log('Token preview:', data.token.substring(0, 20) + '...');
        }
      })
      .catch(err => console.error('❌ Error creating guest session:', err));
    }
  });
