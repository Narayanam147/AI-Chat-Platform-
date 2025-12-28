'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSession, signOut, signIn } from "next-auth/react";
import Image from "next/image";
import { Send, Upload, Sparkles, FileText, Image as ImageIcon, X, Trash2, Plus, Settings, HelpCircle, FolderOpen, Code, Copy, Check, Brain, ToggleLeft, ToggleRight, Moon, Sun, MessageSquare, LogOut } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useSearchParams } from "next/navigation";
import { getOrCreateGuestSession, getGuestToken, migrateGuestToUser } from "@/lib/guestSession";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  attachments?: string[];
}

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  messages?: any[];
  pinned?: boolean;
}

interface UserActivity {
  topics: string[];
  preferredStyle: string;
  recentQueries: string[];
  interactionCount: number;
  writingStyle: string;
  preferredLength: string;
  expertise: { [key: string]: number };
  conversationPatterns: string[];
}

function ChatContent() {
  const { data: session, status } = useSession();
  // Simple admin check (add your admin email(s) here)
  const adminEmails = ['admin@example.com', 'sarvanmdubey@gmail.com'];
  const isAdmin = session?.user?.email && adminEmails.includes(session.user.email);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [renameMode, setRenameMode] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity>({
    topics: [],
    preferredStyle: 'balanced',
    recentQueries: [],
    interactionCount: 0,
    writingStyle: 'conversational',
    preferredLength: 'medium',
    expertise: {},
    conversationPatterns: []
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const settingsModalRef = useRef<HTMLDivElement>(null);
  const feedbackModalRef = useRef<HTMLDivElement>(null);
  const headingMenuRef = useRef<HTMLButtonElement | null>(null);
  const [headingMenuOpen, setHeadingMenuOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const searchParams = useSearchParams();

  // Shorthand commands mapping
  const shorthands: { [key: string]: string } = {
    '/sum': 'Summarize the key points from our conversation so far',
    '/trans': 'Translate the previous response to a different language',
    '/code': 'Provide code snippets or examples for this topic',
    '/explain': 'Explain this in simpler terms',
    '/expand': 'Provide more details and elaborate on this topic',
    '/tldr': 'Give me a brief summary in bullet points',
    '/q': 'Generate questions about this topic to test understanding',
    '/example': 'Give me real-world examples of this concept',
    '/compare': 'Compare and contrast the key differences',
    '/pros': 'List the pros and cons of this approach',
    '/help': 'Show available shorthand commands',
  };

  // Process shorthand input
  const processShorthandInput = (text: string): string => {
    const trimmed = text.trim();
    for (const [shorthand, expansion] of Object.entries(shorthands)) {
      if (trimmed.toLowerCase().startsWith(shorthand.toLowerCase())) {
        const rest = trimmed.substring(shorthand.length).trim();
        if (rest) {
          return `${expansion}\n\nContext: ${rest}`;
        } else {
          return expansion;
        }
      }
    }
    return text;
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove attached file
  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Copy message to clipboard
  const handleCopyMessage = async (messageId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (session?.user?.email) {
      return session.user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('light');
    }

    // Load personalization settings
    const savedPersonalization = localStorage.getItem('personalizationEnabled');
    if (savedPersonalization !== null) {
      setPersonalizationEnabled(savedPersonalization === 'true');
    }

    // Load user activity data
    const savedActivity = localStorage.getItem('userActivity');
    if (savedActivity) {
      try {
        setUserActivity(JSON.parse(savedActivity));
      } catch (e) {
        console.error('Error loading user activity:', e);
      }
    }
  }, []);

  // Initialize guest session for non-authenticated users
  useEffect(() => {
    async function initGuestSession() {
      console.log('🔍 Guest session init:', { status, hasSession: !!session });
      
      if (status === 'loading') return;
      
      if (!session) {
        console.log('🔑 Creating guest session...');
        // User is not authenticated, create/get guest session
        const token = await getOrCreateGuestSession();
        console.log('🔑 Guest session result:', { hasToken: !!token, tokenPreview: token?.substring(0, 10) });
        if (token) {
          setGuestToken(token);
          console.log('✅ Guest session initialized with token:', token.substring(0, 10) + '...');
        } else {
          console.error('❌ Failed to create guest session');
        }
      } else {
        console.log('👤 User is authenticated, skipping guest session');
      }
    }

    initGuestSession();
  }, [session, status]);

  // Migrate guest data when user logs in
  useEffect(() => {
    async function handleUserLogin() {
      if (status === 'loading') return;
      
      if (session?.user?.email) {
        const token = getGuestToken();
        if (token) {
          console.log('Migrating guest data to user account...');
          const success = await migrateGuestToUser(session.user.email);
          if (success) {
            console.log('Guest data migrated successfully');
            // Reload chat history to show migrated chats
            loadChatHistory();
          }
        }
      }
    }

    handleUserLogin();
  }, [session, status]);

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
          
          // Sort: pinned chats first, then by timestamp
          const pinnedChats = mapped.filter((c: ChatHistory) => c.pinned);
          const unpinnedChats = mapped.filter((c: ChatHistory) => !c.pinned);
          const sorted = [...pinnedChats, ...unpinnedChats];
          
          setChatHistory(sorted);
          console.log(`📌 Loaded ${mapped.length} chats (${pinnedChats.length} pinned) for ${session?.user?.email ? 'user' : 'guest'}`);
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  // Load chat history when guest token or session is available
  useEffect(() => {
    if (session?.user?.email || guestToken) {
      loadChatHistory();
    }
  }, [session, guestToken]);

  useEffect(() => {
    const chatId = searchParams.get('chatId');
    if (chatId) {
      const chat = chatHistory.find(c => c.id === chatId);
      if (chat) {
        if (chat.messages && chat.messages.length) {
          const mapped = chat.messages.map((m: any, i: number) => ({
            id: `${chat.id}-${i}`,
            text: m.text,
            sender: (m.sender === 'ai' ? 'ai' : 'user') as 'ai' | 'user',
            timestamp: new Date(m.timestamp || new Date()),
          }));
          setMessages(mapped);
        } else {
          setMessages([]);
        }
        setSelectedChatId(chat.id);
        setCurrentChatId(chat.id);
      }
    }
  }, [searchParams, chatHistory]);

  // Prevent hydration mismatch by only rendering interactive UI after mount
  useEffect(() => {
    setMounted(true);
    const update = () => setIsMobile(window.innerWidth < 1024);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Extract topics from user message
  const extractTopics = (text: string): string[] => {
    const keywords = text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/) // Corrected regex for splitting by whitespace
      .filter(word => word.length > 4)
      .filter(word => !['about', 'would', 'could', 'should', 'there', 'their', 'which', 'where', 'please', 'thanks', 'thank'].includes(word));
    return Array.from(new Set(keywords)).slice(0, 5);
  };

  // Detect conversation patterns and user preferences
  const analyzeUserBehavior = (message: string, allMessages: Message[]) => {
    const patterns: string[] = [];
    const msgLower = message.toLowerCase();
    
    // Detect question types
    if (msgLower.includes('how to') || msgLower.includes('how do')) patterns.push('tutorial_seeker');
    if (msgLower.includes('explain') || msgLower.includes('what is')) patterns.push('explanation_seeker');
    if (msgLower.includes('code') || msgLower.includes('program') || msgLower.includes('function')) patterns.push('coder');
    if (msgLower.includes('write') || msgLower.includes('create') || msgLower.includes('generate')) patterns.push('creator');
    if (msgLower.includes('summarize') || msgLower.includes('tldr') || msgLower.includes('brief')) patterns.push('prefers_concise');
    if (msgLower.includes('detail') || msgLower.includes('elaborate') || msgLower.includes('explain more')) patterns.push('prefers_detailed');
    
    // Detect expertise areas
    const expertiseAreas: { [key: string]: string[] } = {
      'programming': ['code', 'programming', 'developer', 'javascript', 'python', 'api', 'function', 'debug'],
      'business': ['business', 'marketing', 'strategy', 'growth', 'revenue', 'sales', 'startup'],
      'creative': ['creative', 'design', 'art', 'writing', 'story', 'content', 'brand'],
      'technical': ['technical', 'engineering', 'system', 'architecture', 'database', 'server'],
      'academic': ['research', 'study', 'thesis', 'academic', 'paper', 'citation', 'analysis'],
    };
    
    const detectedExpertise: { [key: string]: number } = {};
    for (const [area, keywords] of Object.entries(expertiseAreas)) {
      for (const keyword of keywords) {
        if (msgLower.includes(keyword)) {
          detectedExpertise[area] = (detectedExpertise[area] || 0) + 1;
        }
      }
    }
    
    // Analyze response length preference from chat history
    const userMessages = allMessages.filter(m => m.sender === 'user');
    const avgLength = userMessages.length > 0 
      ? userMessages.reduce((sum, m) => sum + m.text.length, 0) / userMessages.length 
      : 100;
    
    let preferredLength = 'medium';
    if (avgLength < 50) preferredLength = 'short';
    else if (avgLength > 200) preferredLength = 'detailed';
    
    return { patterns, detectedExpertise, preferredLength };
  };

  // Update user activity when sending a message
  const updateUserActivity = (message: string) => {
    const newTopics = extractTopics(message);
    const { patterns, detectedExpertise, preferredLength } = analyzeUserBehavior(message, messages);
    
    setUserActivity(prev => {
      // Merge expertise scores
      const mergedExpertise = { ...prev.expertise };
      for (const [area, score] of Object.entries(detectedExpertise)) {
        mergedExpertise[area] = (mergedExpertise[area] || 0) + score;
      }
      
      const updatedActivity = {
        topics: Array.from(new Set([...newTopics, ...prev.topics])).slice(0, 30),
        preferredStyle: prev.preferredStyle,
        recentQueries: [message.substring(0, 100), ...prev.recentQueries].slice(0, 15),
        interactionCount: prev.interactionCount + 1,
        writingStyle: patterns.includes('prefers_concise') ? 'concise' : 
                      patterns.includes('prefers_detailed') ? 'detailed' : 'conversational',
        preferredLength,
        expertise: mergedExpertise,
        conversationPatterns: Array.from(new Set([...patterns, ...prev.conversationPatterns])).slice(0, 10)
      };
      localStorage.setItem('userActivity', JSON.stringify(updatedActivity));
      return updatedActivity;
    });
  };

  // Toggle personalization
  const togglePersonalization = () => {
    const newValue = !personalizationEnabled;
    setPersonalizationEnabled(newValue);
    localStorage.setItem('personalizationEnabled', String(newValue));
  };

  // Clear user activity data
  const clearUserActivity = () => {
    const emptyActivity = {
      topics: [],
      preferredStyle: 'balanced',
      recentQueries: [],
      interactionCount: 0,
      writingStyle: 'conversational',
      preferredLength: 'medium',
      expertise: {},
      conversationPatterns: []
    };
    setUserActivity(emptyActivity);
    localStorage.removeItem('userActivity');
  };

  // Save chat to history when messages change (local state only for UI updates)
  useEffect(() => {
    // Skip if no messages
    if (messages.length === 0) return;
    
    const firstUserMessage = messages.find(m => m.sender === 'user');
    if (!firstUserMessage) return;

    // If we have a currentChatId or selectedChatId, update that chat entry in local state
    const activeId = currentChatId || selectedChatId;
    
    if (activeId) {
      setChatHistory(prev => {
        const exists = prev.some(ch => ch.id === activeId);
        if (exists) {
          return prev.map(ch => {
            if (ch.id === activeId) {
              return {
                ...ch,
                timestamp: new Date(),
                preview: messages[messages.length - 1]?.text.substring(0, 100) || ch.preview,
                messages: messages.map(m => ({
                  text: m.text,
                  sender: m.sender,
                  timestamp: typeof m.timestamp === 'string' ? m.timestamp : m.timestamp.toISOString(),
                })),
              };
            }
            return ch;
          });
        }
        return prev;
      });
    } else {
      // No active chat - this shouldn't happen as currentChatId is set when first message is sent
      // But as fallback, create a temporary local entry
      const existingChat = chatHistory.find(ch => 
        ch.title === `${firstUserMessage.text.substring(0, 50)}${firstUserMessage.text.length > 50 ? '...' : ''}`
      );
      
      if (!existingChat) {
        const tempId = `temp-${Date.now()}`;
        const newChat: ChatHistory = {
          id: tempId,
          title: `${firstUserMessage.text.substring(0, 50)}${firstUserMessage.text.length > 50 ? '...' : ''}`,
          timestamp: new Date(),
          preview: firstUserMessage.text.substring(0, 100),
          messages: messages.map(m => ({
            text: m.text,
            sender: m.sender,
            timestamp: typeof m.timestamp === 'string' ? m.timestamp : m.timestamp.toISOString(),
          })),
          pinned: false,
        };
        // Add new chat after pinned chats, not at the very top
        setChatHistory(prev => {
          const pinnedChats = prev.filter(ch => ch.pinned);
          const unpinnedChats = prev.filter(ch => !ch.pinned);
          return [...pinnedChats, newChat, ...unpinnedChats];
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Filter chat history based on search query and filter type
  // Filter chat history based on search (if needed in the future)
  const filteredChatHistory = chatHistory;

  // Group chat history by time
  const groupChatHistory = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const groups: { [key: string]: ChatHistory[] } = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Older': []
    };

    filteredChatHistory.forEach(chat => {
      const chatDate = new Date(chat.timestamp);
      if (chatDate >= today) {
        groups['Today'].push(chat);
      } else if (chatDate >= yesterday) {
        groups['Yesterday'].push(chat);
      } else if (chatDate >= sevenDaysAgo) {
        groups['Previous 7 Days'].push(chat);
      } else {
        groups['Older'].push(chat);
      }
    });

    return groups;
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setSelectedChatId(null);
    setCurrentChatId(null); // Clear current chat ID to start fresh conversation
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!chatId) return;
    
    // Show confirmation
    if (!confirm('Delete this chat? It will be permanently removed from your history.')) {
      return;
    }
    
    // Optimistic UI update - remove from list immediately
    const previousHistory = chatHistory;
    setChatHistory(prev => prev.filter(ch => ch.id !== chatId));
    
    // If deleted chat was selected, clear messages
    if (selectedChatId === chatId || currentChatId === chatId) {
      setSelectedChatId(null);
      setCurrentChatId(null);
      setMessages([]);
    }
    
    // For temporary local chats or unauthenticated users, just remove from UI (no API call needed)
    if (chatId.startsWith('temp-') || !session?.user?.email) {
      console.log('Chat deleted locally:', chatId);
      return;
    }
    
    try {
      // Soft delete via API (marks as deleted in DB)
      const res = await fetch(`/api/history/${encodeURIComponent(chatId)}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const txt = await res.text();
        console.error('Failed to delete chat:', res.status, txt);
        // Rollback on error
        setChatHistory(previousHistory);
        alert('Failed to delete chat. Please try again.');
        return;
      }
      
      console.log('Chat soft-deleted successfully:', chatId);
    } catch (e) {
      console.error('Delete error', e);
      // Rollback on error
      setChatHistory(previousHistory);
      alert('Failed to delete chat. Please try again.');
    }
  };

  const startRename = () => {
    const id = selectedChatId || currentChatId;
    if (!id) return;
    const title = chatHistory.find(c => c.id === id)?.title || '';
    setRenameValue(title);
    setRenameMode(true);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const saveRename = async () => {
    const id = selectedChatId || currentChatId;
    if (!id) return;
    const title = renameValue.trim() || 'Untitled Chat';
    setChatHistory(prev => prev.map(c => c.id === id ? { ...c, title } : c));
    setRenameMode(false);
    await persistChatTitle(id, title);
  };

  const cancelRename = () => {
    setRenameMode(false);
    setRenameValue('');
  };

  const handleClearAllChats = async () => {
    if (!confirm('Are you sure you want to delete all chat history? This cannot be undone.')) {
      return;
    }
    
    const previous = chatHistory;
    setChatHistory([]);
    setMessages([]);
    setSelectedChatId(null);
    
    try {
      // Delete all chats from backend
      for (const chat of previous) {
        await fetch(`/api/history/${encodeURIComponent(chat.id)}`, {
          method: 'DELETE',
        });
      }
    } catch (e) {
      console.error('Clear all error', e);
      setChatHistory(previous);
    }
  };

  // Toggle pin state for a chat and reorder locally (persist to backend)
  const togglePin = async (chatId: string) => {
    if (!chatId) return;
    // compute new pinned state from current local state
    const current = chatHistory.find(ch => ch.id === chatId);
    const newPinned = !Boolean(current?.pinned);
    setChatHistory(prev => {
      const updated = prev.map(ch => ch.id === chatId ? { ...ch, pinned: newPinned } : ch);
      // reorder pinned chats to top
      const pinned = updated.filter(ch => ch.pinned);
      const others = updated.filter(ch => !ch.pinned);
      return [...pinned, ...others];
    });

    try {
      await fetch(`/api/history/${encodeURIComponent(chatId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: newPinned }),
      });
    } catch (e) {
      console.error('Failed to persist pin state', e);
    }
  };

  // Share chat by copying a link to clipboard (snapshot approach - like Gemini)
  const handleShare = async (chatId?: string) => {
    console.log('🔗 Share button clicked:', { 
      chatId, 
      selectedChatId, 
      currentChatId,
      currentMessagesCount: messages.length,
      chatHistoryCount: chatHistory.length
    });
    
    // Determine which chat to share
    const id = chatId || selectedChatId || currentChatId;
    console.log('📋 Target chat ID:', id);
    
    if (!id) {
      alert('No chat selected to share.');
      return;
    }

    let messagesToShare = messages;
    let chatTitle = 'Shared Chat';
    
    // If we don't have messages in current state, fetch from database
    if (!messagesToShare || messagesToShare.length === 0 || (chatId && chatId !== currentChatId)) {
      console.log('🔍 Fetching chat from database...', { id });
      
      try {
        const response = await fetch(`/api/history/${id}`);
        console.log('📡 Fetch response:', { status: response.status, ok: response.ok });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📦 Fetched chat data:', {
            hasData: !!data,
            hasMessages: !!data?.messages,
            messageCount: data?.messages?.length || 0,
            title: data?.title,
            rawMessages: data?.messages
          });
          
          if (data?.messages && Array.isArray(data.messages) && data.messages.length > 0) {
            messagesToShare = data.messages.map((m: any, i: number) => ({
              id: `${id}-${i}`,
              text: m.text || '',
              sender: (m.sender || 'user') as 'user' | 'ai',
              timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
            }));
            chatTitle = data.title || 'Shared Chat';
            console.log('✅ Loaded messages from database:', {
              count: messagesToShare.length,
              firstMessage: messagesToShare[0]
            });
          } else {
            console.error('❌ No valid messages in fetched data:', {
              messagesExists: !!data?.messages,
              isArray: Array.isArray(data?.messages),
              length: data?.messages?.length,
              rawMessages: data?.messages
            });
            alert('This chat has no messages to share. Please select a chat with messages.');
            return;
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Failed to fetch chat:', response.status, errorText);
          alert(`Failed to load chat: ${response.status}`);
          return;
        }
      } catch (error) {
        console.error('❌ Error fetching chat:', error);
        alert(`Error loading chat: ${error}`);
        return;
      }
    } else {
      // Use title from chatHistory if available
      chatTitle = chatHistory.find(ch => ch.id === id)?.title || 'Shared Chat';
      console.log('📝 Using current messages state:', {
        count: messagesToShare.length,
        firstMessage: messagesToShare[0]
      });
    }
    
    // Final comprehensive check
    if (!messagesToShare || !Array.isArray(messagesToShare) || messagesToShare.length === 0) {
      console.error('❌ No messages to share after all attempts:', {
        hasMessages: !!messagesToShare,
        isArray: Array.isArray(messagesToShare),
        length: messagesToShare?.length,
        messagesToShare
      });
      alert('Cannot share an empty chat. Please send at least one message first.');
      return;
    }
    
    // Validate message format
    const validMessages = messagesToShare.filter(m => m && m.text && m.sender);
    if (validMessages.length === 0) {
      console.error('❌ All messages are invalid:', messagesToShare);
      alert('Cannot share chat: messages are invalid or empty.');
      return;
    }
    
    if (validMessages.length < messagesToShare.length) {
      console.warn('⚠️ Some messages were invalid and filtered out:', {
        original: messagesToShare.length,
        valid: validMessages.length
      });
      messagesToShare = validMessages;
    }

    try {
      console.log('📤 Sending share request with messages:', {
        count: messagesToShare.length,
        messages: messagesToShare,
        firstMessage: messagesToShare[0]
      });
      
      const messagesPayload = messagesToShare.map((m, index) => {
        try {
          let timestampStr: string;
          if (typeof m.timestamp === 'string') {
            timestampStr = m.timestamp;
          } else if (m.timestamp instanceof Date) {
            timestampStr = m.timestamp.toISOString();
          } else {
            // Fallback to current time if timestamp is missing or invalid
            timestampStr = new Date().toISOString();
            console.warn(`⚠️ Invalid timestamp for message ${index}, using current time`);
          }
          
          return {
            text: m.text || '',
            sender: m.sender || 'user',
            timestamp: timestampStr,
          };
        } catch (err) {
          console.error(`❌ Error processing message ${index}:`, err, m);
          // Return a valid message structure even if processing fails
          return {
            text: m.text || 'Error processing message',
            sender: m.sender || 'user',
            timestamp: new Date().toISOString(),
          };
        }
      });
      
      console.log('📦 Payload:', {
        messages: messagesPayload,
        messageCount: messagesPayload.length,
        title: chatTitle,
        expiresDays: 30,
        isPublic: true
      });
      
      // Send messages directly to create a snapshot (no database lookup needed)
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: messagesPayload,
          title: chatTitle,
          expiresDays: 30,
          isPublic: true 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Share API error response:', errorData);
        throw new Error(errorData.error || 'Failed to create share link');
      }

      const data = await response.json();
      console.log('📬 Share API response:', data);
      
      if (!data.id || !data.token) {
        console.error('❌ Invalid share response - missing id or token:', data);
        throw new Error('Invalid response from share API');
      }
      
      const shareUrl = `${window.location.origin}/shared/${data.id}?t=${data.token}`;
      console.log('✅ Share link created:', shareUrl);

      // Try clipboard first (most reliable)
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl);
          alert('✅ Shareable link copied to clipboard!\n\nAnyone with the link can view this chat.');
          return;
        }
      } catch (clipErr) {
        console.warn('Clipboard API failed:', clipErr);
      }

      // Try Web Share API on mobile
      try {
        if (navigator.share) {
          await navigator.share({
            title: 'Shared Chat from Ace',
            text: 'Check out this conversation',
            url: shareUrl,
          });
          return;
        }
      } catch (shareErr) {
        console.warn('Web Share API failed:', shareErr);
      }

      // Last resort: show prompt so user can copy manually
      prompt('Copy this shareable link:', shareUrl);
    } catch (e) {
      console.error('❌ Failed to create share link:', e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      alert(`Failed to create shareable link: ${errorMessage}\n\nPlease check the console for details.`);
    }
  };

  // Persist chat title change to backend
  const persistChatTitle = async (chatId: string, title: string) => {
    if (!chatId) return;
    try {
      await fetch(`/api/history/${encodeURIComponent(chatId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
    } catch (e) {
      console.error('Failed to persist chat title', e);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({
      chats: chatHistory,
      exportDate: new Date().toISOString(),
      userEmail: session?.user?.email
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim() || feedbackSubmitting) return;
    
    setFeedbackSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedbackText,
          userEmail: session?.user?.email,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        alert('Thank you for your feedback!');
        setFeedbackText('');
        setShowFeedbackModal(false);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('Failed to send feedback. Please try again.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    // Apply theme to document root
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
      if (settingsModalRef.current && !settingsModalRef.current.contains(event.target as Node)) {
        setShowSettingsModal(false);
      }
      if (feedbackModalRef.current && !feedbackModalRef.current.contains(event.target as Node)) {
        setShowFeedbackModal(false);
      }
      // Close dropdown menus when clicking outside
      setOpenDropdownId(null);
      setHeadingMenuOpen(false);
    };

    if (showAttachMenu || showSettingsModal || showFeedbackModal || openDropdownId || headingMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAttachMenu, showSettingsModal, showFeedbackModal, openDropdownId, headingMenuOpen]);

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    // Build message text with file info
    let messageText = input;
    const fileNames = attachedFiles.map(f => f.name);
    
    // If there are attached files, mention them
    if (attachedFiles.length > 0) {
      const fileList = fileNames.join(', ');
      if (messageText) {
        messageText += `\n\n[Attached files: ${fileList}]`;
      } else {
        messageText = `[Attached files: ${fileList}]`;
      }
    }

    // Process shorthand input before sending
    const processedText = processShorthandInput(messageText);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: processedText,
      sender: 'user',
      timestamp: new Date(),
      attachments: fileNames.length > 0 ? fileNames : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedFiles([]); // Clear attached files after sending
    setIsLoading(true);

    // Update user activity for personalization
    if (personalizationEnabled) {
      updateUserActivity(processedText);
    }

    try {
      // For now, send text to API (file processing would need backend support)
      const promptText = attachedFiles.length > 0 
        ? `${processedText}\n\n(Note: User attached files: ${fileNames.join(', ')}. File content analysis is not yet supported.)`
        : processedText;

      // Prepare enhanced personalization context (Gemini-style adaptive learning)
      const personalizationContext = personalizationEnabled ? {
        enabled: true,
        topics: userActivity.topics,
        recentQueries: userActivity.recentQueries.slice(0, 5),
        interactionCount: userActivity.interactionCount,
        writingStyle: userActivity.writingStyle,
        preferredLength: userActivity.preferredLength,
        expertise: userActivity.expertise,
        conversationPatterns: userActivity.conversationPatterns,
        // Include current chat context for better continuity
        currentChatContext: messages.slice(-6).map(m => ({
          role: m.sender,
          content: m.text.substring(0, 200)
        }))
      } : null;

      console.log('?? Sending to /api/chat:', { promptText: promptText.substring(0, 100), userId: session?.user?.email, hasGuestToken: !!guestToken });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: promptText,
          userId: session?.user?.email,
          guestToken: guestToken,
          personalization: personalizationContext,
          chatId: currentChatId // Send current chat ID to append messages
        }),
      });

      console.log('?? Response status:', response.status, response.statusText);

      let data;
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        let errorMessage = `API error: ${response.status}`;
        
        try {
          if (contentType?.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            // For non-JSON responses, read as text
            const text = await response.text();
            console.error('API returned non-JSON response:', text.substring(0, 200));
            errorMessage = text || 'Server error - check console for details';
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      // Parse successful response - always try to read as JSON first
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        // Try to get text response for better debugging
        try {
          const text = await response.text();
          console.error('Response body:', text.substring(0, 500));
        } catch (e) {
          console.error('Could not read response body');
        }
        throw new Error('Invalid response format from server');
      }

      if (!data.response) {
        throw new Error(data.error || 'No response from AI');
      }

      // Update currentChatId with the database ID
      if (data.chatId) {
        const oldChatId = currentChatId;
        setCurrentChatId(data.chatId);
        setSelectedChatId(data.chatId);
        
        // If we had a temp ID, update the chat history with the real database ID
        if (oldChatId && oldChatId.startsWith('temp-')) {
          setChatHistory(prev => prev.map(ch => 
            ch.id === oldChatId ? { ...ch, id: data.chatId } : ch
          ));
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error instanceof Error ? `Error: ${error.message}` : 'Sorry, there was an error processing your request.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

      const handleExport = async (format: 'word' | 'pdf') => {
        if (messages.length === 0) {
          alert('No messages to export');
          return;
        }
    
        try {
          const response = await fetch('/api/export', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              messages,
              format,
              userId: session?.user?.email 
            }),
          });
    
          if (!response.ok) {
            throw new Error('Export failed');
          }
    
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `chat-export-${Date.now()}.${format === 'word' ? 'docx' : 'pdf'}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } catch (error) {
          console.error('Export error:', error);
      alert('Failed to export. Please try again.');
    }
  };

  if (!mounted) return null;

  return (
    <MainLayout
          onNewChat={handleNewChat}
          chatHistory={chatHistory}
          onSelectChat={(chat) => {
            if (chat.messages && chat.messages.length) {
              const mapped = chat.messages.map((m: any, i: number) => ({
                id: `${chat.id}-${i}`,
                text: m.text,
                sender: (m.sender === 'ai' ? 'ai' : 'user') as 'ai' | 'user',
                timestamp: new Date(m.timestamp || new Date()),
              }));
              setMessages(mapped);
            } else {
              setMessages([]);
            }
            setSelectedChatId(chat.id);
            setCurrentChatId(chat.id);
          }}
          onDeleteChat={handleDeleteChat}
          onPinChat={togglePin}
          onRenameChat={startRename}
          onShareChat={handleShare}
          selectedChatId={selectedChatId || currentChatId}
          onOpenSettings={() => setShowSettingsModal(true)}
          isMobile={isMobile}
          chatTitle={chatHistory.find((c) => c.id === (selectedChatId || currentChatId))?.title || 'New chat'}
          isChatActive={!!(selectedChatId || currentChatId)}
        >
          <div className='flex flex-col h-full bg-white dark:bg-[#131314] relative'>
              <div className='flex-1 overflow-y-auto'>
                {/* Conversation View - Messages */}
                <div className='flex-1 bg-gradient-to-b from-white/50 dark:from-[#131314]/30 to-white dark:to-[#131314] transition-all duration-300 scroll-smooth'>
                  {/* Greeting State - ONLY when no messages */}
                  {messages.length === 0 && (
                    <div className='flex items-center justify-center h-full animate-fadeIn px-4 py-8'>
                      <div className='text-center max-w-2xl'>
                        <h2 className='text-2xl sm:text-4xl font-semibold text-gray-900 dark:text-[#E3E3E3] mb-4'>
                          Ace
                        </h2>
                        <p className='text-sm sm:text-lg text-gray-600 dark:text-[#C4C7C5] mb-2'>
                          Hello, {session?.user?.name?.split(' ')[0] || 'there'}
                        </p>
                        <p className='text-sm sm:text-lg text-gray-600 dark:text-[#C4C7C5]'>
                          How can I help you today?
                        </p>
                      </div>
                    </div>
                  )}
    
                  {/* Conversation State - ONLY when messages exist */}
                  {messages.length > 0 && (
                    <div className='w-full space-y-0'>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`w-full py-4 sm:py-6 px-4 sm:px-6 lg:px-8 ${message.sender === 'user' ? 'bg-transparent' : 'bg-gray-50/50 dark:bg-[#131314]/20'} border-b border-gray-100/50 dark:border-[#333537]/50`}
                        >
                          <div className='max-w-4xl mx-auto flex gap-2 sm:gap-4'>
                            {/* Avatar */}
                            <div className='flex-shrink-0'>
                              {message.sender === 'user' ? (
                                session?.user?.image ? (
                                  <Image src={session.user.image} alt='User' width={40} height={40} className='w-8 h-8 sm:w-10 sm:h-10 rounded-full' />
                                ) : (
                                  <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center'>
                                    <span className='text-white font-semibold text-xs sm:text-sm'>{getUserInitials()}</span>
                                  </div>
                                )
                              ) : (
                                <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center'>
                                  <Sparkles className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
                                </div>
                              )}
                            </div>
    
                            {/* Message Content */}
                            <div className='flex-1 min-w-0 group'>
                              <div className='relative'>
                                {message.sender === 'ai' ? (
                                  <div className='prose prose-sm sm:prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-gray-100 text-gray-900 dark:text-[#E3E3E3]'>
                                    <ReactMarkdown>{message.text}</ReactMarkdown>
                                  </div>
                                ) : (
                                  <p className='whitespace-pre-wrap text-sm sm:text-[15px] leading-relaxed text-gray-900 dark:text-gray-100'>{message.text}</p>
                                )}
                                {/* Copy Button */}
                                <button
                                  onClick={() => handleCopyMessage(message.id, message.text)}
                                  className='mt-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200/70 dark:bg-[#333537]/50 hover:bg-gray-300 dark:hover:bg-[#333537]'
                                  title='Copy message'
                                >
                                  {copiedMessageId === message.id ? (
                                    <Check className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500' />
                                  ) : (
                                    <Copy className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-[#C4C7C5]' />
                                  )}
                                </button>
                                <p className='text-xs text-gray-400 dark:text-gray-500 mt-2'>
                                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {isLoading && (
                        <div className='w-full py-6 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-[#131314]/20 border-b border-gray-100/50 dark:border-[#333537]/50'>
                          <div className='max-w-4xl mx-auto flex gap-3 sm:gap-4'>
                            <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0'>
                              <Sparkles className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
                            </div>
                            <div className='flex-1'>
                              <div className='flex gap-2 py-2'>
                                <div className='w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce'></div>
                                <div className='w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce' style={{ animationDelay: '0.2s' }}></div>
                                <div className='w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce' style={{ animationDelay: '0.4s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </div>
    
              {/* Chat Input Bar - Floating capsule design with glassmorphism */}
              <div className='flex justify-center w-full px-4 pb-4'>
                <div className='w-full max-w-[750px]'>
                  <div className='relative flex items-end gap-3 px-4 py-2 bg-white/80 dark:bg-[#1E1E1E]/80 backdrop-blur-xl rounded-[24px] border border-gray-200/50 dark:border-[#333537]/30 shadow-lg hover:shadow-xl focus-within:shadow-xl focus-within:border-gray-300 dark:focus-within:border-[#333537]/50 transition-all duration-300'>
                      {/* Attachment/Tools Menu */}
                      <div className='relative' ref={attachMenuRef}>
                        <button
                          onClick={() => setShowAttachMenu(!showAttachMenu)}
                          className='p-2 hover:bg-gray-100 dark:hover:bg-[#333537]/40 rounded-full transition-all duration-200'
                          title='Add attachments'
                        >
                          <Plus className='w-5 h-5 text-gray-600 dark:text-[#C4C7C5]' strokeWidth={1.5} />
                        </button>
    
                        {showAttachMenu && (
                          <div className='absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#333537] rounded-xl shadow-xl py-2 z-[50]'>
                            <button
                              onClick={() => {
                                fileInputRef.current?.click();
                                setShowAttachMenu(false);
                              }}
                              className='w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-[#E3E3E3] hover:bg-gray-100 dark:hover:bg-[#333537] transition-colors flex items-center gap-3'
                            >
                              <Upload className='w-4 h-4' />
                              Upload files
                            </button>
                            <button className='w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-[#E3E3E3] hover:bg-gray-100 dark:hover:bg-[#333537] transition-colors flex items-center gap-3'>
                              Add from Drive
                            </button>
                            <button className='w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-[#E3E3E3] hover:bg-gray-100 dark:hover:bg-[#333537] transition-colors flex items-center gap-3'>
                              <FolderOpen className='w-4 h-4' />
                              Import code
                            </button>
                          </div>
                        )}
                      </div>
    
                      {/* Hidden file input */}
                      <input
                        type='file'
                        ref={fileInputRef}
                        className='hidden'
                        multiple
                        accept='image/*,.pdf,.doc,.docx,.txt'
                        onChange={handleFileSelect}
                      />
    
                      {/* Attached Files Preview */}
                      {attachedFiles.length > 0 && (
                        <div className='flex flex-wrap gap-2 px-2'>
                          {attachedFiles.map((file, index) => (
                            <div key={index} className='flex items-center gap-2 bg-gray-200/60 dark:bg-[#333537]/50 rounded-lg px-3 py-1.5'>
                              {file.type.startsWith('image/') ? (
                                <ImageIcon className='w-4 h-4 text-blue-500' />
                              ) : (
                                <FileText className='w-4 h-4 text-blue-500' />
                              )}
                              <span className='text-xs text-gray-700 dark:text-[#E3E3E3] max-w-[100px] truncate'>
                                {file.name}
                              </span>
                              <button
                                onClick={() => removeAttachedFile(index)}
                                className='p-0.5 hover:bg-gray-300 dark:hover:bg-[#333537] rounded'
                              >
                                <X className='w-3 h-3 text-gray-500' />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
    
                      {/* Text Input Field - Borderless for seamless blending */}
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder='Ask Ace'
                        className='flex-1 py-3 bg-transparent border-none focus:outline-none resize-none text-gray-900 dark:text-[#E3E3E3] placeholder-gray-400 dark:placeholder-[#C4C7C5]/70 text-[15px] min-h-[40px] max-h-[200px]'
                        rows={1}
                        disabled={isLoading}
                        style={{
                          height: 'auto',
                          overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden'
                        }}
                      />
    
                      {/* Submit Button - High contrast circular design that lights up when typing */}
                      <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className={`p-2.5 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${
                          input.trim() 
                            ? 'bg-gray-900 dark:bg-[#8AB4F8] hover:bg-gray-800 dark:hover:bg-[#a3c4fa] shadow-md hover:shadow-lg scale-100' 
                            : 'bg-gray-300 dark:bg-[#333537] opacity-50 scale-95'
                        }`}
                        title='Send message'
                      >
                        <Send className={`w-5 h-5 transition-colors ${input.trim() ? 'text-white dark:text-[#131314]' : 'text-gray-500 dark:text-[#C4C7C5]'}`} strokeWidth={2} />
                      </button>
                    </div>
    
                    {/* Input helper text */}
                    <p className='text-xs text-gray-500 dark:text-gray-500 text-center mt-2.5'>
                      AI can make mistakes. Verify important information.
                    </p>
    
                    {/* Shorthand suggestions popup */}
                    {input.startsWith('/') && (
                      <div className='absolute bottom-full left-0 right-0 mb-2 max-h-64 overflow-y-auto bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#333537] rounded-lg shadow-lg z-50'>
                        <div className='p-3 space-y-1'>
                          {Object.entries(shorthands).map(([shorthand, description]) => (
                            <button
                              key={shorthand}
                              onClick={() => setInput(shorthand)}
                              className='w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#333537] rounded transition-colors group'
                            >
                              <div className='flex items-start gap-2'>
                                <code className='text-blue-600 dark:text-blue-400 font-semibold text-sm flex-shrink-0'>
                                  {shorthand}
                                </code>
                                <span className='text-xs text-gray-600 dark:text-[#C4C7C5] group-hover:text-gray-900 dark:group-hover:text-white transition-colors'>
                                  {description}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            {/* Settings Modal */}
            {showSettingsModal && (
              <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4'>
                <div 
                  ref={settingsModalRef}
                  className='settings-modal-container bg-white dark:bg-[#131314] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden'
                  style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#131314' : '#ffffff' }}
                >
                  {/* Modal Header */}
                  <div className='p-6 border-b border-gray-200 dark:border-[#333537] flex items-center justify-between'>
                    <h2 className='text-xl font-semibold text-gray-900 dark:text-[#E3E3E3]'>Settings</h2>
                    <button
                      onClick={() => setShowSettingsModal(false)}
                      className='p-2 hover:bg-gray-100 dark:hover:bg-[#333537] rounded-full transition-colors'
                      aria-label='Close settings'
                    >
                      <X className='w-5 h-5 text-gray-600 dark:text-[#C4C7C5]' />
                    </button>
                  </div>
    
                  {/* Modal Content */}
                  <div className='p-6 space-y-6 max-h-[70vh] overflow-y-auto'>
                    {/* Theme Selection */}
                    <div>
                      <h3 className='text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] mb-3'>Theme</h3>
                      <div className='flex gap-3'>
                        <button
                          onClick={() => handleThemeChange('light')}
                          className={`flex-1 p-4 rounded-lg border-2 transition-all ${ 
                            theme === 'light'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <Sun className='w-6 h-6 mx-auto mb-2 text-gray-700 dark:text-[#E3E3E3]' />
                          <span className='text-sm font-medium text-gray-900 dark:text-[#E3E3E3]'>Light</span>
                        </button>
                        <button
                          onClick={() => handleThemeChange('dark')}
                          className={`flex-1 p-4 rounded-lg border-2 transition-all ${ 
                            theme === 'dark'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <Moon className='w-6 h-6 mx-auto mb-2 text-gray-700 dark:text-[#E3E3E3]' />
                          <span className='text-sm font-medium text-gray-900 dark:text-[#E3E3E3]'>Dark</span>
                        </button>
                      </div>
                    </div>
    
                    {/* Export Chat */}
                    <div>
                      <h3 className='text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] mb-3'>Export Chat</h3>
                      <div className='space-y-2'>
                        <button
                          onClick={() => handleExport('word')}
                          className='w-full p-4 bg-gray-100 dark:bg-[#1E1E1E] hover:bg-gray-200 dark:hover:bg-[#333537] rounded-lg transition-colors flex items-center gap-3'
                        >
                          <FileText className='w-5 h-5 text-blue-600' />
                          <div className='flex-1 text-left'>
                            <p className='text-sm font-medium text-gray-900 dark:text-[#E3E3E3]'>Export as DOC</p>
                            <p className='text-xs text-gray-600 dark:text-[#C4C7C5]'>Download chat as Word document</p>
                          </div>
                        </button>
                        <button
                          onClick={() => handleExport('pdf')}
                          className='w-full p-4 bg-gray-100 dark:bg-[#1E1E1E] hover:bg-gray-200 dark:hover:bg-[#333537] rounded-lg transition-colors flex items-center gap-3'
                        >
                          <FileText className='w-5 h-5 text-red-600' />
                          <div className='flex-1 text-left'>
                            <p className='text-sm font-medium text-gray-900 dark:text-[#E3E3E3]'>Export as PDF</p>
                            <p className='text-xs text-gray-600 dark:text-[#C4C7C5]'>Download chat as PDF file</p>
                          </div>
                        </button>
                      </div>
                    </div>
    
                    {/* Clear History */}
                    <div>
                      <h3 className='text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] mb-3'>Clear History</h3>
                      <button
                        onClick={handleClearAllChats}
                        className='w-full p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg transition-colors flex items-center gap-3'
                      >
                        <Trash2 className='w-5 h-5 text-red-600 dark:text-red-500' />
                        <div className='flex-1 text-left'>
                          <p className='text-sm font-medium text-red-700 dark:text-red-500'>Clear All History</p>
                          <p className='text-xs text-red-600 dark:text-red-400'>Permanently delete all chat history</p>
                        </div>
                      </button>
                    </div>
    
                    {/* Help & Support */}
                    <div>
                      <h3 className='text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] mb-3'>Help & Support</h3>
                      <div className='space-y-2'>
                        <a
                          href='/help'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='w-full p-3 bg-gray-100 dark:bg-[#1E1E1E] hover:bg-gray-200 dark:hover:bg-[#333537] rounded-lg transition-colors flex items-center gap-3 text-sm text-gray-700 dark:text-[#E3E3E3]'
                        >
                          <HelpCircle className='w-5 h-5' />
                          Help Center
                        </a>
                        <button
                          onClick={() => {
                            setShowSettingsModal(false);
                            setShowFeedbackModal(true);
                          }}
                          className='w-full p-3 bg-gray-100 dark:bg-[#1E1E1E] hover:bg-gray-200 dark:hover:bg-[#333537] rounded-lg transition-colors flex items-center gap-3 text-sm text-gray-700 dark:text-[#E3E3E3]'
                        >
                          <MessageSquare className='w-5 h-5' />
                          Send Feedback
                        </button>
                        <a
                          href='/terms'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='w-full p-3 bg-gray-100 dark:bg-[#1E1E1E] hover:bg-gray-200 dark:hover:bg-[#333537] rounded-lg transition-colors flex items-center gap-3 text-sm text-gray-700 dark:text-[#E3E3E3]'
                        >
                          <FileText className='w-5 h-5' />
                          Terms of Service
                        </a>
                        <a
                          href='/privacy'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='w-full p-3 bg-gray-100 dark:bg-[#1E1E1E] hover:bg-gray-200 dark:hover:bg-[#333537] rounded-lg transition-colors flex items-center gap-3 text-sm text-gray-700 dark:text-[#E3E3E3]'
                        >
                          <FileText className='w-5 h-5' />
                          Privacy Policy
                        </a>
                      </div>
                    </div>
    
                    {/* Personalization / User Activity - At Bottom */}
                    <div>
                      <h3 className='text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] mb-3 flex items-center gap-2'>
                        <Brain className='w-4 h-4' />
                        Your Past Chats with AI
                      </h3>
                      <div className='p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 mb-3'>
                        <p className='text-xs text-purple-800 dark:text-purple-300'>
                          AI learns from your past chats, understanding more about you and your preferences to personalize your experience. You can manage and delete your data, or turn this off anytime.
                        </p>
                      </div>
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between p-4 bg-gray-100 dark:bg-[#1E1E1E] rounded-lg'>
                          <div className='flex-1'>
                            <p className='text-sm font-medium text-gray-900 dark:text-[#E3E3E3]'>Adaptive Responses</p>
                            <p className='text-xs text-gray-600 dark:text-[#C4C7C5]'>AI learns from your activity to provide better answers</p>
                          </div>
                          <button
                            onClick={togglePersonalization}
                            className='ml-4 focus:outline-none'
                            aria-label={personalizationEnabled ? 'Disable personalization' : 'Enable personalization'}
                          >
                            {personalizationEnabled ? (
                              <ToggleRight className='w-10 h-10 text-blue-600' />
                            ) : (
                              <ToggleLeft className='w-10 h-10 text-gray-400' />
                            )}
                          </button>
                        </div>
                        
                        {personalizationEnabled && isAdmin && (
                          <div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                            <p className='text-xs font-medium text-blue-800 dark:text-blue-300 mb-3'>?? User Learning Profile (Admin Only)</p>
                            <div className='space-y-2 text-xs text-blue-700 dark:text-blue-400'>
                              <div className='flex justify-between'>
                                <span>Total Interactions:</span>
                                <span className='font-medium'>{userActivity.interactionCount}</span>
                              </div>
                              <div className='flex justify-between'>
                                <span>Topics Learned:</span>
                                <span className='font-medium'>{userActivity.topics.length}</span>
                              </div>
                              <div className='flex justify-between'>
                                <span>Writing Style:</span>
                                <span className='font-medium capitalize'>{userActivity.writingStyle}</span>
                              </div>
                              <div className='flex justify-between'>
                                <span>Response Length:</span>
                                <span className='font-medium capitalize'>{userActivity.preferredLength}</span>
                              </div>
                              {Object.keys(userActivity.expertise).length > 0 && (
                                <div>
                                  <span className='block mb-1'>Expertise Areas:</span>
                                  <div className='flex flex-wrap gap-1 mt-1'>
                                    {Object.entries(userActivity.expertise)
                                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                                      .slice(0, 4)
                                      .map(([area]) => (
                                        <span key={area} className='px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs capitalize'>
                                          {area}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}
                              {userActivity.conversationPatterns.length > 0 && (
                                <div>
                                  <span className='block mb-1'>Conversation Style:</span>
                                  <div className='flex flex-wrap gap-1 mt-1'>
                                    {userActivity.conversationPatterns.slice(0, 3).map((pattern) => (
                                      <span key={pattern} className='px-2 py-0.5 bg-purple-200 dark:bg-purple-800 rounded text-xs'>
                                        {pattern.replace('_', ' ')}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {userActivity.topics.length > 0 && (
                                <div>
                                  <span className='block mb-1'>Recent Topics:</span>
                                  <p className='text-xs opacity-80 truncate'>{userActivity.topics.slice(0, 8).join(', ')}</p>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={clearUserActivity}
                              className='mt-4 w-full px-3 py-2 text-xs text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                            >
                              ??? Clear All Activity Data
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
    
            {/* Feedback Modal */}
            {showFeedbackModal && (
              <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4'>
                <div 
                  ref={feedbackModalRef}
                  className='bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden'
                >
                  {/* Modal Header */}
                  <div className='p-6 border-b border-gray-200 dark:border-[#333537] flex items-center justify-between'>
                    <h2 className='text-xl font-semibold text-gray-900 dark:text-[#E3E3E3]'>Send Feedback</h2>
                    <button
                      onClick={() => {
                        setShowFeedbackModal(false);
                        setFeedbackText('');
                      }}
                      className='p-2 hover:bg-gray-100 dark:hover:bg-[#333537] rounded-full transition-colors'
                      aria-label='Close feedback'
                    >
                      <X className='w-5 h-5 text-gray-600 dark:text-[#C4C7C5]' />
                    </button>
                  </div>
    
                  {/* Modal Content */}
                  <div className='p-6'>
                      <p className='text-sm text-gray-600 dark:text-[#C4C7C5] mb-4'>
                      Help us improve Ace by sharing your thoughts, suggestions, or reporting issues.
                    </p>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder='Type your feedback here...'
                      className='w-full h-32 p-3 border border-gray-300 dark:border-[#333537] rounded-lg bg-white dark:bg-[#131314] text-gray-900 dark:text-[#E3E3E3] placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                    />
                    <div className='flex gap-3 mt-4'>
                      <button
                        onClick={() => {
                          setShowFeedbackModal(false);
                          setFeedbackText('');
                        }}
                        className='flex-1 px-4 py-2.5 bg-gray-200 dark:bg-[#333537] text-gray-700 dark:text-[#E3E3E3] rounded-lg hover:bg-gray-300 dark:hover:bg-[#333537] transition-colors font-medium'
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitFeedback}
                        disabled={!feedbackText.trim() || feedbackSubmitting}
                        className='flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium'
                      >
                        {feedbackSubmitting ? 'Sending...' : 'Submit'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </MainLayout>
  );
}

export default function ChatClientPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}



