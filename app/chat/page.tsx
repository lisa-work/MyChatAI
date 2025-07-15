'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/data/supabase';
import { Send, Paperclip } from 'lucide-react';

export default function ChatPage() {
  const session = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!conversationId) return;
    fetchMessages();
  }, [conversationId]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('Messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const createConversation = async () => {
    const id = uuidv4();
    await supabase.from('Conversations').insert({
      id,
      user_id: session?.user.id,
      title: 'New Chat',
      is_pinned: false,
    });
    setConversationId(id);
  };

  const sendMessage = async () => {
    if (!conversationId || !input.trim()) return;

    // Save user message
    const userMessage = {
      id: uuidv4(),
      conversation_id: conversationId,
      sender: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };
    await supabase.from('Messages').insert(userMessage);
    setMessages((prev) => [...prev, userMessage]);

    // Call AI API
    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: input }] }),
    });
    const data = await res.json();
    const aiMessage = {
      id: uuidv4(),
      conversation_id: conversationId,
      sender: 'ai',
      content: data.reply,
      created_at: new Date().toISOString(),
    };

    await supabase.from('Messages').insert(aiMessage);
    setMessages((prev) => [...prev, aiMessage]);
    setInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !conversationId) return;
    const file = e.target.files[0];
    const filePath = `${uuidv4()}-${file.name}`;

    await supabase.storage.from('chat-uploads').upload(filePath, file);
    const { data } = supabase.storage.from('chat-uploads').getPublicUrl(filePath);

    const fileMessage = {
      id: uuidv4(),
      conversation_id: conversationId,
      sender: 'user',
      content: 'Sent a file',
      file_url: data.publicUrl,
      created_at: new Date().toISOString(),
    };

    await supabase.from('Messages').insert(fileMessage);
    setMessages((prev) => [...prev, fileMessage]);
  };

  return (
    <div className="p-4">
      {!conversationId && (
        <Button onClick={createConversation}>Start New Chat</Button>
      )}

      {conversationId && (
        <>
          <div className="flex flex-col gap-2 mb-4">
            {messages.map((msg) => (
              <Card key={msg.id} className={msg.sender === 'user' ? 'bg-primary text-white' : 'bg-muted'}>
                <div className="p-2">
                  {msg.content}
                  {msg.file_url && (
                    <a href={msg.file_url} target="_blank" className="text-blue-600 underline ml-2">View file</a>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <Button onClick={sendMessage}><Send className="h-4 w-4" /></Button>
            <Button onClick={() => fileInputRef.current?.click()}><Paperclip className="h-4 w-4" /></Button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </>
      )}
    </div>
  );
}
