'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MoreVertical, Pin, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { TypingIndicator } from '@/components/typing-indicator';
import { supabase } from '@/data/supabase';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useSearchParams } from 'next/navigation';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

type ChatInterfaceProps = {
  chatId?: string | null;
};

export function ChatInterface({ chatId: externalChatId }: ChatInterfaceProps) {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const initialQuestion = searchParams.get("question");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  interface ChatIdState {
    chatId: string | null;
    setChatId: React.Dispatch<React.SetStateAction<string | null>>;
  }

  const [chatId, setChatId]: [string | null, React.Dispatch<React.SetStateAction<string | null>>] = useState<string | null>(() => {
      return externalChatId ?? searchParams.get("id");
  });
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

useEffect(() => {
  if (initialQuestion && typeof initialQuestion === "string" && messages.length === 0) {
    handleSendMessage(initialQuestion);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [initialQuestion]);

useEffect(() => {
  if (!chatId || messages.length > 0 || !user?.id) return;

  const loadChat = async () => {
    const { data, error } = await supabase
      .from('Chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error loading chat by id:', error);
      return;
    }

    setMessages(data.messages || []);
    setIsPinned(data.is_pinned || false);
  };

  loadChat();
}, [chatId, messages.length, user?.id]);

const getLastAIMessage = (messages: Message[]) => {
  const aiMessages = messages.filter((m) => m.sender === 'ai');
  const lastAI = aiMessages[aiMessages.length - 1];
  if (!lastAI) return 'No AI response yet.';
  return lastAI.content.replace(/\n/g, ' ').slice(0, 200); // first 200 chars, no line breaks
};

const createChatSession = async (newMessages: Message[]) => {
  if (!user?.id || isNaN(Number(user.id))) {
    console.error("Invalid user ID:", user?.id);
    return;
  }

  const title = newMessages[0]?.content || 'New Chat';

  // 🛑 Check for duplicate chat first
  const { data: existingChats, error: fetchError } = await supabase
    .from('Chats')
    .select('*')
    .eq('user_id', Number(user.id))
    .eq('title', title);

  if (fetchError) {
    console.error('Error checking for existing chat:', fetchError);
    return;
  }

  if (existingChats && existingChats.length > 0) {
    console.warn('Duplicate chat exists. Skipping insert.');
    setChatId(existingChats[0].id); // Set current session to existing chat
    return existingChats[0];
  }

  // ✅ If not duplicate, insert new chat
  const { data, error } = await supabase
    .from('Chats')
    .insert([
      {
        user_id: Number(user.id),
        title,
        messages: newMessages,
        is_pinned: false,
        last_message: getLastAIMessage(newMessages),
        last_updated: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating chat:', error);
    return null;
  }

  setChatId(data.id);
  setIsPinned(data.is_pinned);
  return data;
};

  const updateChatSession = async (updatedMessages: Message[]) => {
    if (!chatId || !user?.id) return;
    const { error } = await supabase
      .from('Chats')
      .update({
        messages: updatedMessages,
        last_message: getLastAIMessage(updatedMessages), // 🆕
        last_updated: new Date().toISOString(),
      })
      .eq('id', chatId)
      .eq('user_id', user.id);

    if (error) console.error('Error updating chat:', error);
  };

  const togglePin = async () => {
    if (!chatId) return;
    const { data, error } = await supabase
      .from('Chats')
      .update({ is_pinned: !isPinned })
      .eq('id', chatId)
      .select()
      .single();

    if (!error && data) {
      setIsPinned(data.is_pinned);
    } else {
      console.error('Error toggling pin:', error);
    }
  };

  const deleteChat = async () => {
    if (!chatId || !user?.id) return;
    const { error } = await supabase.from('Chats').delete().eq('id', chatId).eq('user_id', user.id);
    if (!error) {
      setMessages([]);
      setChatId(null);
      setIsPinned(false);
    } else {
      console.error('Error deleting chat:', error);
    }
  };

  const handleSendMessage = async (customInput?: string) => {
  const messageContent = typeof (customInput ?? input) === "string" ? (customInput ?? input) : "";
  if (!messageContent.trim()) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    content: messageContent,
    sender: 'user',
    timestamp: new Date(),
  };

  const newMessages = [...messages, userMessage];
  setMessages(newMessages);
  setInput('');
  setIsTyping(true);

  try {
    const formattedMessages = newMessages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    const res = await fetch('/api/api-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: formattedMessages, recordId: null }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || 'Error getting response from server.');
    }

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: data.reply ?? '',
      sender: 'ai',
      timestamp: new Date(),
    };

    const updatedMessages = [...newMessages, aiMessage];
    setMessages(updatedMessages);

    if (!chatId) {
      await createChatSession(updatedMessages);
    } else {
      await updateChatSession(updatedMessages);
    }
  } catch (error) {
    console.error('Failed to get AI response', error);
    const msg = error instanceof Error ? error.message : 'Error getting response from server.';
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: msg,
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsTyping(false);
  }
};



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <p className="text-lg font-semibold">Current Chat</p>
        {chatId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={togglePin}>
                <Pin className="mr-2 h-4 w-4" />
                {isPinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={deleteChat} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-36 w-full">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p>Start a conversation with AI</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn('flex gap-4 mb-8 break-words', message.sender === 'user' ? 'justify-end' : 'justify-start')}
          >
            {message.sender === 'ai' && (
              <Avatar className="h-10 w-10">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                'w-full',
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-lg p-1 max-w-md'
                  : ''
              )}
            >
              {message.sender === 'ai' ? (
                <div className="bg-muted rounded-lg px-6 py-4 w-full break-words font-['Roboto',sans-serif] leading-normal">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1 className="text-3xl font-bold mt-6 mb-3 leading-tight" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-2xl font-bold mt-5 mb-2 leading-snug" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-xl font-semibold mt-4 mb-2 leading-snug" {...props} />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="mb-3 leading-normal" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc ml-6 mb-3 leading-normal" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal ml-6 mb-3 leading-normal" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="mb-1 leading-normal" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="font-bold" {...props} />
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-md break-words">
                  {message.content}
                </p>
              )}
            </div>
            {message.sender === 'user' && (
              <Avatar className="h-10 w-10">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-4 mb-8">
            <Avatar className="h-10 w-10">
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-lg px-4 py-2">
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="sticky right-0 bottom-0 bg-background border-t p-4">
        <div className="flex gap-2 mx-auto w-full">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 rounded-lg"
          />
          <Button onClick={() => handleSendMessage()} disabled={!input || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}


