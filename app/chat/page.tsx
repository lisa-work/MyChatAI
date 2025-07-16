'use client';

import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { ChatInterface } from '@/components/chat-interface';
import { useAuth } from '@/hooks/use-auth';
import { AuthPage } from '@/components/auth-page';
import { useSearchParams } from 'next/navigation';

export default function ChatPage() {
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id'); // ✅ get chat ID from URL

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <ChatInterface chatId={chatId} /> {/* ✅ pass chatId to ChatInterface */}
        </main>
      </div>
    </div>
  );
}
