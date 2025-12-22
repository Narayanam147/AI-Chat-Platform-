import { Suspense } from 'react';
import ChatClientPage from './ChatClientPage';

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatClientPage />
    </Suspense>
  );
}