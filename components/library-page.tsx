'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Pin, Trash2, Copy, MoreVertical, Upload } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/data/supabase';
import { v4 as uuidv4 } from 'uuid';

type Chat = {
  id: string;
  title: string;
  lastMessage: string;
  lastUpdated: string;
  isPinned: boolean;
  tags: string[];
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileUrl?: string;
};

export default function ChatPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);

  // 🟢 Fetch chats from Supabase
  const fetchChats = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('Chats').select('*').order('lastUpdated', { ascending: false });

    if (!error && data) {
      setChats(data as Chat[]);
    }
    setLoading(false);
  };

  // 🔄 Load chats initially
  useEffect(() => {
    fetchChats();
  }, []);

  const handleCreateChat = async () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: 'New Chat',
      lastMessage: 'Start chatting...',
      lastUpdated: new Date().toISOString(),
      isPinned: false,
      tags: ['General'],
    };

    await supabase.from('Chats').insert([newChat]);
    fetchChats();
  };

  const togglePin = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    await supabase.from('Chats').update({ isPinned: !chat.isPinned }).eq('id', chatId);
    fetchChats();
  };

  const deleteChat = async (chatId: string) => {
    await supabase.from('Chats').delete().eq('id', chatId);
    fetchChats();
  };

  const duplicateChat = async (chatId: string) => {
    const originalChat = chats.find(c => c.id === chatId);
    if (!originalChat) return;

    const duplicatedChat = {
      ...originalChat,
      id: uuidv4(),
      title: `${originalChat.title} (Copy)`,
      lastUpdated: new Date().toISOString(),
    };

    await supabase.from('Chats').insert([duplicatedChat]);
    fetchChats();
  };

  const handleFakeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];

    const newChat: Chat = {
      id: uuidv4(),
      title: `File Chat: ${file.name}`,
      lastMessage: `Uploaded file: ${file.name}`,
      lastUpdated: new Date().toISOString(),
      isPinned: false,
      tags: ['File'],
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl: `local-${file.name}`, // Just a placeholder, no storage
    };

    await supabase.from('Chats').insert([newChat]);
    fetchChats();
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedChats = filteredChats.filter(chat => chat.isPinned);
  const regularChats = filteredChats.filter(chat => !chat.isPinned);

  const ChatCard = ({ chat }: { chat: Chat }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {chat.title}
              {chat.isPinned && <Pin className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
            <CardDescription className="mt-1">
              {chat.lastMessage}
            </CardDescription>
            {chat.fileName && (
              <p className="text-xs text-muted-foreground mt-1">
                File: {chat.fileName} ({Math.round((chat.fileSize ?? 0) / 1024)} KB)
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => togglePin(chat.id)}>
                <Pin className="mr-2 h-4 w-4" />
                {chat.isPinned ? 'Unpin' : 'Pin'}
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
          <div className="flex gap-1">
            {chat.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {new Date(chat.lastUpdated).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Library</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateChat}>New Chat</Button>
          <label htmlFor="fileUpload" className="flex items-center gap-2 cursor-pointer text-sm">
            <Upload className="h-4 w-4" />
            Upload
            <input
              id="fileUpload"
              type="file"
              className="hidden"
              onChange={handleFakeFileUpload}
            />
          </label>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full"
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
