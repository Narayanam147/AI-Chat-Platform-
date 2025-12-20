'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchHistoryForUser, softDeleteHistory, HistoryEntry } from '@/lib/history';

interface SidebarProps {
  userId?: string | null;
  onSelectHistory?: (entry: HistoryEntry) => void;
  onCloseMobile?: () => void;
}

const ITEMS_PER_PAGE = 30;

export function Sidebar({ userId, onSelectHistory, onCloseMobile }: SidebarProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadHistory = useCallback(async (newOffset = 0) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // fetchHistoryForUser accepts an options object
      const res = await fetchHistoryForUser({ userId: userId ?? null, limit: ITEMS_PER_PAGE, offset: newOffset });
      const data = res.data;
      if (Array.isArray(data)) {
        if (newOffset === 0) setHistory(data);
        else setHistory((prev) => [...prev, ...data.slice(newOffset, newOffset + ITEMS_PER_PAGE)]);
        setOffset(newOffset + ITEMS_PER_PAGE);
        setHasMore(data.length >= newOffset + ITEMS_PER_PAGE);
      } else {
        setError('Unexpected response from history service');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [userId]);
  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (isNearBottom && hasMore && !loading && !loadingRef.current) {
      loadHistory(offset);
    }
  }, [offset, hasMore, loading, loadHistory]);
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this history entry?')) return;
    setDeleting(id);
    try {
      await softDeleteHistory(id, userId ?? null);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    } finally {
      setDeleting(null);
    }
  };

  const handleSelectHistory = (entry: HistoryEntry) => { onSelectHistory?.(entry); onCloseMobile?.(); };

  const truncateText = (text: string, maxLength = 50) => text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="sidebar-container flex flex-col h-full">
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">History</h2>
      </div>

      {error && (
        <div className="flex-shrink-0 px-4 py-3 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="mt-2 text-xs text-red-600 hover:text-red-800 underline">Dismiss</button>
        </div>
      )}

      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto overflow-x-hidden bg-white">
        {history.length === 0 && !loading ? (
          <div className="p-4 text-center text-gray-500"><p className="text-sm">No history yet</p></div>
        ) : (
          <div className="divide-y divide-gray-200">
            {history.map((entry) => (
              <button key={entry.id} onClick={() => handleSelectHistory(entry)} disabled={deleting === entry.id} className="w-full text-left p-4 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group border-b border-gray-100 last:border-b-0">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">{truncateText(entry.prompt, 40)}</p>
                <p className="text-xs text-gray-600 truncate mt-1 line-clamp-2">{truncateText(entry.response, 40)}</p>
                <time className="block text-xs text-gray-400 mt-2">{formatDate(entry.created_at)}</time>
                <button onClick={(e) => handleDelete(entry.id, e)} disabled={deleting === entry.id} className="mt-2 text-xs text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50" aria-label={`Delete: ${truncateText(entry.prompt, 20)}`}>{deleting === entry.id ? 'Deleting...' : 'Delete'}</button>
              </button>
            ))}
          </div>
        )}

        {loading && (<div className="p-4 text-center"><div className="inline-flex items-center justify-center"><div className="animate-spin"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg></div></div></div>)}

        {!hasMore && history.length > 0 && (<div className="p-4 text-center text-gray-400 text-xs">No more history</div>)}
      </div>

      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white space-y-2">
        <button onClick={() => loadHistory(0)} disabled={loading} className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Refresh</button>
      </div>
    </div>
  );
}
