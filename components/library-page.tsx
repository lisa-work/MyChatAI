'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Pin, Trash2, Copy, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/data/supabase';
import { useAuth } from './auth-provider';

type Message = {
  id?: number;
  content: string;
  // Add other message properties if needed
};

type Chat = {
  id?: number;
  title: string;
  last_message: string;
  last_updated: string;
  is_pinned: boolean;
  tags: string[];
  user_id: string;
  messages?: Message[];
};

export default function ChatPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  function highlightMatch(text: string, query: string) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  const fetchChats = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('Chats')
      .select('*, messages')
      .eq('user_id', user.id) // ✅ only fetch chats for logged-in user
      .order('last_updated', { ascending: false });

    if (!error && data) {
      setChats(data as Chat[]);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleCreateChat = async () => {
    if (!user?.id) return;

    const newChat: Omit<Chat, 'id'> = {
      title: 'New Chat',
      last_message: 'Start chatting...',
      last_updated: new Date().toISOString(),
      is_pinned: false,
      tags: ['General'],
      user_id: user.id, // ✅ assign chat to current user
    };

    const { data, error } = await supabase.from('Chats').insert([newChat]).select().single();

    if (error) {
      console.error('Error inserting new chat:', error);
    } else if (data) {
      router.push(`/chat?id=${data.id}`);
    }
  };


  const togglePin = async (chatId: number | undefined) => {
    if (!chatId) return;
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    await supabase
      .from('Chats')
      .update({ is_pinned: !chat.is_pinned })
      .eq('id', chatId);
    fetchChats();
  };

  const deleteChat = async (chatId: number | undefined) => {
    if (!chatId) return;
    await supabase.from('Chats').delete().eq('id', chatId);
    fetchChats();
  };

  const duplicateChat = async (chatId: number | undefined) => {
    const originalChat = chats.find(c => c.id === chatId);
    if (!originalChat) return;

    const { id, ...duplicatedChatData } = originalChat;

    const duplicatedChat: Omit<Chat, 'id'> = {
      ...duplicatedChatData,
      title: `${originalChat.title} (Copy)`,
      last_updated: new Date().toISOString(),
    };

    await supabase.from('Chats').insert([duplicatedChat]);
    fetchChats();
  };

const filteredChats = chats.filter(chat => {
  const query = searchQuery.toLowerCase();

  const titleMatch = (chat.title ?? '').toLowerCase().includes(query);
  const lastMessageMatch = (chat.last_message ?? '').toLowerCase().includes(query);
  const tagMatch = (chat.tags ?? []).some(tag => (tag ?? '').toLowerCase().includes(query));

  const messagesMatch = (chat.messages ?? []).some(
    msg => (msg.content ?? '').toLowerCase().includes(query)
  );

  return titleMatch || lastMessageMatch || tagMatch || messagesMatch;
});


  const pinnedChats = filteredChats.filter(chat => chat.is_pinned);
  const regularChats = filteredChats.filter(chat => !chat.is_pinned);

  const ChatCard = ({ chat }: { chat: Chat }) => {
    const router = useRouter();

  return (
    <Card
      onClick={() => router.push(`/chat?id=${chat.id}`)}
      className="cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <span
                dangerouslySetInnerHTML={{
                  __html: highlightMatch(chat.title, searchQuery),
                }}
              />
              {chat.is_pinned && <Pin className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>

            <CardDescription className="mt-1 text-sm text-muted-foreground line-clamp-2">
              <span
                dangerouslySetInnerHTML={{
                  __html: highlightMatch(chat.last_message, searchQuery),
                }}
              />
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* 🛑 Stop click propagation so dropdown click doesn't trigger card click */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()} // 🛑 Prevent click bubbling inside dropdown
            >
              <DropdownMenuItem onClick={() => togglePin(chat.id)}>
                <Pin className="mr-2 h-4 w-4" />
                {chat.is_pinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateChat(chat.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteChat(chat.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {(chat.tags ?? []).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Library</h1>
        <Button onClick={handleCreateChat}>New Chat</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full rounded-lg"
        />
      </div>

      {pinnedChats.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Pin className="h-5 w-5" />
            Pinned Chats
          </h2>
          <div className="grid gap-4">
            {pinnedChats.map((chat) => (
              <ChatCard key={chat.id} chat={chat} />
            ))}
          </div>
        </div>
      )}

      {regularChats.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Chats</h2>
          <div className="grid gap-4">
            {regularChats.map((chat) => (
              <ChatCard key={chat.id} chat={chat} />
            ))}
          </div>
        </div>
      )}

      {filteredChats.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? 'No chats found matching your search.' : 'No saved chats yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
