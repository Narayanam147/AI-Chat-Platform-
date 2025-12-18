'use client';

import { useSession, signOut, signIn } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { Send, Upload, Download, Menu, LogOut, User, Sparkles, FileText, Image as ImageIcon, X, MessageSquare, Clock, Trash2, Plus, Settings, HelpCircle, FolderOpen, Code, Moon, Sun, Mail, KeyRound, Copy, Check, Brain, ToggleLeft, ToggleRight, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";

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

export default function ChatPage() {
    const { data: session } = useSession();
    // Simple admin check (add your admin email(s) here)
    const adminEmails = ["admin@example.com", "sarvanmdubey@gmail.com"];
    const isAdmin = session?.user?.email && adminEmails.includes(session.user.email);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [renameMode, setRenameMode] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userActivity, setUserActivity] = useState<{
    topics: string[];
    preferredStyle: string;
    recentQueries: string[];
    interactionCount: number;
    writingStyle: string;
    preferredLength: string;
    expertise: { [key: string]: number };
    conversationPatterns: string[];
  }>({
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
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const settingsModalRef = useRef<HTMLDivElement>(null);
  const feedbackModalRef = useRef<HTMLDivElement>(null);
  const headingMenuRef = useRef<HTMLButtonElement | null>(null);
  const [headingMenuOpen, setHeadingMenuOpen] = useState(false);

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
      document.documentElement.classList.remove('dark');
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

  // Extract topics from user message
  const extractTopics = (text: string): string[] => {
    const keywords = text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
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
        ch.title === firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '')
      );
      
      if (!existingChat) {
        const tempId = `temp-${Date.now()}`;
        const newChat: ChatHistory = {
          id: tempId,
          title: firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? '...' : ''),
          timestamp: new Date(),
          preview: firstUserMessage.text.substring(0, 100),
          messages: messages.map(m => ({
            text: m.text,
            sender: m.sender,
            timestamp: typeof m.timestamp === 'string' ? m.timestamp : m.timestamp.toISOString(),
          })),
          pinned: false,
        };
        setChatHistory(prev => [newChat, ...prev]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Filter chat history based on search query
  const filteredChatHistory = searchQuery.trim() 
    ? chatHistory.filter(chat => 
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chatHistory;

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
    setInput("");
    setSelectedChatId(null);
    setCurrentChatId(null); // Clear current chat ID to start fresh conversation
  };

  const handleDeleteChat = async (chatId: string) => {
    // Optimistic UI update
    const previous = chatHistory;
    setChatHistory(prev => prev.filter(ch => ch.id !== chatId));
    try {
      const res = await fetch(`/api/history/${encodeURIComponent(chatId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error('Failed to delete chat:', res.status, txt);
        setChatHistory(previous); // rollback
        return;
      }
      // If deleted chat was selected, clear messages
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
        setMessages([]);
      }
    } catch (e) {
      console.error('Delete error', e);
      setChatHistory(previous); // rollback
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

  // Share chat by copying a link to clipboard
  const handleShare = async (chatId?: string) => {
    // determine effective id
    const id = chatId || selectedChatId || currentChatId;
    if (!id) {
      alert('No chat selected to share');
      return;
    }
    const url = `${window.location.origin}/chat?chatId=${encodeURIComponent(id)}`;
    try {
      // Prefer Web Share API on mobile
      if (navigator.share) {
        await navigator.share({
          title: 'Chat from Chat Assistant',
          text: 'Open this chat in Chat Assistant',
          url,
        });
        return;
      }

      // Fallback: try clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        alert('Shareable link copied to clipboard');
        return;
      }

      // Last resort: show prompt so user can copy manually
      prompt('Copy this link:', url);
    } catch (e) {
      console.error('Failed to share link', e);
      try {
        prompt('Copy this link:', url);
      } catch (_) {
        // swallow
      }
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (settingsModalRef.current && !settingsModalRef.current.contains(event.target as Node)) {
        setShowSettingsModal(false);
      }
      if (feedbackModalRef.current && !feedbackModalRef.current.contains(event.target as Node)) {
        setShowFeedbackModal(false);
      }
    };

    if (showAttachMenu || showProfileMenu || showSettingsModal || showFeedbackModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAttachMenu, showProfileMenu, showSettingsModal, showFeedbackModal]);

  // Load history from backend for signed-in user
  useEffect(() => {
    const load = async () => {
      if (!session?.user?.email) return;
      try {
        const res = await fetch(`/api/history?userId=${encodeURIComponent(session.user.email)}`);
        if (!res.ok) {
          console.error('Failed to fetch history', await res.text());
          return;
        }
        const json = await res.json();
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
        }
      } catch (e) {
        console.error('Error loading history', e);
      }
    };

    load();
  }, [session?.user?.email]);

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

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      attachments: fileNames.length > 0 ? fileNames : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setAttachedFiles([]); // Clear attached files after sending
    setIsLoading(true);

    // Update user activity for personalization
    if (personalizationEnabled) {
      updateUserActivity(input);
    }

    try {
      // For now, send text to API (file processing would need backend support)
      const promptText = attachedFiles.length > 0 
        ? `${input}\n\n(Note: User attached files: ${fileNames.join(', ')}. File content analysis is not yet supported.)`
        : input;

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

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt: promptText,
          userId: session?.user?.email,
          personalization: personalizationContext,
          chatId: currentChatId // Send current chat ID to append messages
        }),
      });

      const data = await response.json();

      // Update currentChatId if a new chat was created
      if (data.chatId && !currentChatId) {
        setCurrentChatId(data.chatId);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "Sorry, I couldn't generate a response.",
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, there was an error processing your request.",
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
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      console.error("Export error:", error);
      alert('Failed to export. Please try again.');
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Overlay for mobile when sidebar is open */}
      {showSidebar && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Left Sidebar - Collapsible */}
      <aside className={`${showSidebar ? 'w-72' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col fixed lg:relative h-full z-50 lg:z-auto`}>
        {/* New Chat Button - Prominent */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={handleNewChat}
            className="w-full py-3 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-full hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-sm hover:shadow-md font-medium text-sm flex items-center gap-3"
          >
            <Plus className="w-5 h-5" />
            <p className="flex-1 text-left">New chat</p>
            <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Small header for chat list */}
        <div className="px-3 pb-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide">Chats</h3>
        </div>

        {/* Navigation List - Chat History */}
        <div className="flex-1 overflow-y-auto px-2">
          {/* No results message */}
          {searchQuery && filteredChatHistory.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No chats found for &ldquo;{searchQuery}&rdquo;
            </div>
          )}
          <div className="space-y-1">
            {Object.entries(groupChatHistory()).map(([group, chats]) => (
              chats.length > 0 && (
                <div key={group} className="mb-3">
                  {/* Time Group Header */}
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                      {group}
                    </h3>
                  </div>
                  
                  {/* Chat Items */}
                  <div className="space-y-0.5">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => {
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
                          setCurrentChatId(chat.id); // Set current chat ID for continuing conversation
                          setSearchQuery(""); // Clear search when selecting a chat
                        }}
                        className={`group relative px-3 py-2.5 mx-1 rounded-lg transition-colors cursor-pointer ${
                          (selectedChatId === chat.id || currentChatId === chat.id)
                            ? 'bg-gray-200 dark:bg-gray-800' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-1 flex-1">
                            {chat.title}
                          </p>
                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!confirm('Delete this chat? This cannot be undone.')) return;
                              handleDeleteChat(chat.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded transition-all"
                            title="Delete chat"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                          </button>
                          {/* Pin Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(chat.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded transition-all ml-1"
                            title={chat.pinned ? 'Unpin chat' : 'Pin chat'}
                          >
                            <svg className={`w-3.5 h-3.5 ${chat.pinned ? 'text-yellow-500' : 'text-gray-600 dark:text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M7.05 2.29a1 1 0 011.41 0L10 3.83l1.54-1.54a1 1 0 011.41 1.41L11.41 5.24l1.54 1.54a1 1 0 01-1.41 1.41L10 6.66l-1.54 1.54a1 1 0 01-1.41-1.41l1.54-1.54L6.05 3.7a1 1 0 010-1.41z"/></svg>
                          </button>
                          {/* Rename in sidebar */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChatId(chat.id);
                              setCurrentChatId(chat.id);
                              startRename();
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded transition-all ml-1"
                            title="Rename chat"
                          >
                            <svg className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Sidebar Footer - Settings and Help */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-3">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-3"
          >
            <Settings className="w-4 h-4" />
            Settings and help
          </button>
        </div>
      </aside>

      {/* Main Chat Area - Right Column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Persistent Hamburger Menu + Title + User Profile */}
        <header className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {/* Persistent Hamburger Menu - Always Visible */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
              title={showSidebar ? "Close sidebar" : "Open sidebar"}
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Quick Theme Toggle */}
            <button
              onClick={() => {
                const newTheme = theme === 'light' ? 'dark' : 'light';
                setTheme(newTheme);
                localStorage.setItem('theme', newTheme);
                document.documentElement.classList.toggle('dark', newTheme === 'dark');
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle theme"
              title={theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Title - Show when sidebar is collapsed */}
            {!showSidebar && (
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Chat Assistant</h1>
              </div>
            )}
          </div>

          {/* Simple User Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            {/* For GUEST users - Show Log In / Sign Up buttons */}
            {!session && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => signIn()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => signIn()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* For LOGGED-IN users - Show Avatar */}
            {session && (
              <>
                <div onClick={() => setShowProfileMenu(!showProfileMenu)} className="cursor-pointer">
                  {session?.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || 'User'} 
                      className="w-9 h-9 rounded-full object-cover hover:ring-2 hover:ring-blue-500 transition-all"
                      title={session.user.name || 'User profile'}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center hover:ring-2 hover:ring-blue-500 transition-all ${session?.user?.image ? 'hidden' : ''}`} title="User profile">
                    <span className="text-white font-semibold text-sm">
                      {getUserInitials()}
                    </span>
                  </div>
                </div>

                {/* Simple Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    {/* User Email */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                        {session?.user?.email || 'user@example.com'}
                      </p>
                    </div>

                    {/* Sign Out Button */}
                    <div className="p-2">
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </header>

        {/* Chat Heading with Options (Gemini-style) */}
        {(selectedChatId || currentChatId) && (
          <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-blue-600" />
              {!renameMode ? (
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white max-w-xs truncate">
                  {chatHistory.find((c) => c.id === (selectedChatId || currentChatId))?.title || 'Untitled Chat'}
                </h2>
              ) : (
                <input
                  ref={renameInputRef}
                  className="text-2xl font-bold bg-transparent outline-none border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white max-w-xs"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={saveRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveRename();
                    if (e.key === 'Escape') cancelRename();
                  }}
                  aria-label="Rename chat"
                />
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setHeadingMenuOpen(v => !v)}
                aria-haspopup="true"
                aria-expanded={headingMenuOpen}
                ref={headingMenuRef}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Open actions"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {headingMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      const id = selectedChatId || currentChatId;
                      if (!id) return;
                      togglePin(id);
                      setHeadingMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {chatHistory.find(c => c.id === (selectedChatId || currentChatId))?.pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={() => { startRename(); setHeadingMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => { handleShare(selectedChatId || currentChatId || undefined); setHeadingMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => {
                      const id = selectedChatId || currentChatId;
                      if (!id) return;
                      if (!confirm('Delete this chat? This cannot be undone.')) return;
                      handleDeleteChat(id);
                      setHeadingMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conversation View - Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Hello, {session?.user?.name?.split(' ')[0] || 'there'}
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  How can I help you today?
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {message.sender === 'user' ? (
                      session?.user?.image ? (
                        <img src={session.user.image} alt="User" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
                        </div>
                      )
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 max-w-3xl group">
                    <div className={`relative rounded-2xl px-5 py-3 ${
                      message.sender === 'user'
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        : 'bg-transparent text-gray-900 dark:text-white'
                    }`}>
                      {message.sender === 'ai' ? (
                        <ReactMarkdown className="prose dark:prose-invert max-w-none">
                          {message.text}
                        </ReactMarkdown>
                      ) : (
                        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.text}</p>
                      )}
                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopyMessage(message.id, message.text)}
                        className={`absolute ${message.sender === 'user' ? 'left-2' : 'right-2'} top-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600`}
                        title="Copy message"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-2 px-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2 px-5 py-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input Bar - Multi-functional (Gemini-style) */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-300 dark:border-gray-700 p-2 shadow-sm focus-within:shadow-md focus-within:border-blue-500 transition-all">
              {/* Attachment/Tools Menu */}
              <div className="relative" ref={attachMenuRef}>
                <button
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                  title="Add attachments"
                >
                  <Plus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>

                {showAttachMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2 z-50">
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowAttachMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <Upload className="w-4 h-4" />
                      Upload files
                    </button>
                    <button className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3">
                      <FolderOpen className="w-4 h-4" />
                      Add from Drive
                    </button>
                    <button className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3">
                      <Code className="w-4 h-4" />
                      Import code
                    </button>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
              />

              {/* Attached Files Preview */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 px-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 rounded-lg px-3 py-1.5">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="text-xs text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeAttachedFile(index)}
                        className="p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Text Input Field */}
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Chat Assistant"
                className="flex-1 px-4 py-3 bg-transparent border-none focus:outline-none resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-[15px] min-h-[48px] max-h-[200px]"
                rows={1}
                disabled={isLoading}
                style={{
                  height: 'auto',
                  overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden'
                }}
              />

              {/* Submit Button */}
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 rounded-full transition-colors disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Input helper text */}
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-2">
              Chat Assistant can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            ref={settingsModalRef}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close settings"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Theme Selection */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Theme</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Sun className="w-6 h-6 mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Light</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Moon className="w-6 h-6 mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Dark</span>
                  </button>
                </div>
              </div>

              {/* Export Chat */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Export Chat</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleExport('word')}
                    className="w-full p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Export as DOC</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Download chat as Word document</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <FileText className="w-5 h-5 text-red-600" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Export as PDF</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Download chat as PDF file</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Clear History */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Clear History</h3>
                <button
                  onClick={handleClearAllChats}
                  className="w-full p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-500" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-red-700 dark:text-red-500">Clear All History</p>
                    <p className="text-xs text-red-600 dark:text-red-400">Permanently delete all chat history</p>
                  </div>
                </button>
              </div>

              {/* Help & Support */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Help & Support</h3>
                <div className="space-y-2">
                  <a
                    href="/help"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <HelpCircle className="w-5 h-5" />
                    Help Center
                  </a>
                  <button
                    onClick={() => {
                      setShowSettingsModal(false);
                      setShowFeedbackModal(true);
                    }}
                    className="w-full p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Send Feedback
                  </button>
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <FileText className="w-5 h-5" />
                    Terms of Service
                  </a>
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <FileText className="w-5 h-5" />
                    Privacy Policy
                  </a>
                </div>
              </div>

              {/* Personalization / User Activity - At Bottom */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Your Past Chats with AI
                </h3>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 mb-3">
                  <p className="text-xs text-purple-800 dark:text-purple-300">
                    AI learns from your past chats, understanding more about you and your preferences to personalize your experience. You can manage and delete your data, or turn this off anytime.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Adaptive Responses</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">AI learns from your activity to provide better answers</p>
                    </div>
                    <button
                      onClick={togglePersonalization}
                      className="ml-4 focus:outline-none"
                      aria-label={personalizationEnabled ? "Disable personalization" : "Enable personalization"}
                    >
                      {personalizationEnabled ? (
                        <ToggleRight className="w-10 h-10 text-blue-600" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {personalizationEnabled && isAdmin && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-3">📊 User Learning Profile (Admin Only)</p>
                      <div className="space-y-2 text-xs text-blue-700 dark:text-blue-400">
                        <div className="flex justify-between">
                          <span>Total Interactions:</span>
                          <span className="font-medium">{userActivity.interactionCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Topics Learned:</span>
                          <span className="font-medium">{userActivity.topics.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Writing Style:</span>
                          <span className="font-medium capitalize">{userActivity.writingStyle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Response Length:</span>
                          <span className="font-medium capitalize">{userActivity.preferredLength}</span>
                        </div>
                        {Object.keys(userActivity.expertise).length > 0 && (
                          <div>
                            <span className="block mb-1">Expertise Areas:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(userActivity.expertise)
                                .sort((a, b) => (b[1] as number) - (a[1] as number))
                                .slice(0, 4)
                                .map(([area]) => (
                                  <span key={area} className="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs capitalize">
                                    {area}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                        {userActivity.conversationPatterns.length > 0 && (
                          <div>
                            <span className="block mb-1">Conversation Style:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {userActivity.conversationPatterns.slice(0, 3).map((pattern) => (
                                <span key={pattern} className="px-2 py-0.5 bg-purple-200 dark:bg-purple-800 rounded text-xs">
                                  {pattern.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {userActivity.topics.length > 0 && (
                          <div>
                            <span className="block mb-1">Recent Topics:</span>
                            <p className="text-xs opacity-80 truncate">{userActivity.topics.slice(0, 8).join(', ')}</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={clearUserActivity}
                        className="mt-4 w-full px-3 py-2 text-xs text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        🗑️ Clear All Activity Data
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            ref={feedbackModalRef}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Send Feedback</h2>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackText('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close feedback"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Help us improve Chat Assistant by sharing your thoughts, suggestions, or reporting issues.
              </p>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Type your feedback here..."
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackText('');
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackText.trim() || feedbackSubmitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {feedbackSubmitting ? 'Sending...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
