import crypto from 'crypto';

/**
 * Guest Session Utilities
 * Handles guest user session generation and management
 */

export interface GuestSession {
  id: string;
  session_token: string;
  created_at: string;
  expires_at: string;
}

/**
 * Generate a unique guest session token
 */
export function generateGuestToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get guest session token from localStorage (client-side only)
 */
export function getGuestToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('guest_session_token');
}

/**
 * Set guest session token in localStorage (client-side only)
 */
export function setGuestToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('guest_session_token', token);
}

/**
 * Remove guest session token from localStorage (client-side only)
 */
export function clearGuestToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('guest_session_token');
}

/**
 * Check if user is guest (no auth session but has guest token)
 */
export function isGuestUser(hasAuthSession: boolean): boolean {
  if (typeof window === 'undefined') return false;
  return !hasAuthSession && !!getGuestToken();
}

/**
 * Get or create guest session token
 * This should be called from the client side
 */
export async function getOrCreateGuestSession(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  // Check if we already have a guest token
  let token = getGuestToken();
  
  if (token) {
    // Verify the session is still valid
    try {
      const response = await fetch('/api/guest/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      
      if (response.ok) {
        return token;
      }
      // Token is invalid or expired, create a new one
      clearGuestToken();
    } catch (error) {
      console.error('Error verifying guest token:', error);
      clearGuestToken();
    }
  }
  
  // Create a new guest session
  try {
    const response = await fetch('/api/guest/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      setGuestToken(data.token);
      return data.token;
    }
  } catch (error) {
    console.error('Error creating guest session:', error);
  }
  
  return null;
}

/**
 * Migrate guest chat history to authenticated user account
 * Called after user signs in/up
 */
export async function migrateGuestToUser(userEmail: string): Promise<boolean> {
  const guestToken = getGuestToken();
  
  if (!guestToken) return false;
  
  try {
    const response = await fetch('/api/guest/migrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        guestToken, 
        userEmail 
      }),
    });
    
    if (response.ok) {
      clearGuestToken();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error migrating guest data:', error);
    return false;
  }
}
