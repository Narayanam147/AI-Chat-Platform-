'use client';

import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Share2, Pin, Edit3, Trash2 } from 'lucide-react';

interface ChatHistoryDropdownProps {
  chatId: string;
  isPinned?: boolean;
  onPin: (chatId: string) => void;
  onRename: (chatId: string) => void;
  onShare: (chatId: string) => void;
  onDelete: (chatId: string) => void;
}

export function ChatHistoryDropdown({
  chatId,
  isPinned = false,
  onPin,
  onRename,
  onShare,
  onDelete,
}: ChatHistoryDropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Chat options"
        >
          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[200px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-1 z-[100] animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          sideOffset={5}
          align="end"
        >
          <DropdownMenu.Item
            onClick={(e) => {
              e.stopPropagation();
              onShare(chatId);
            }}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 outline-none cursor-pointer transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={(e) => {
              e.stopPropagation();
              onPin(chatId);
            }}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 outline-none cursor-pointer transition-colors"
          >
            <Pin className="w-4 h-4" />
            <span>{isPinned ? 'Unpin' : 'Pin'}</span>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={(e) => {
              e.stopPropagation();
              onRename(chatId);
            }}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 outline-none cursor-pointer transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Rename</span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

          <DropdownMenu.Item
            onClick={(e) => {
              e.stopPropagation();
              onDelete(chatId);
            }}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 outline-none cursor-pointer transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
