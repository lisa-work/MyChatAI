'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Paperclip, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TypingIndicator } from '@/components/typing-indicator';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  images?: string[];
  sources?: { title: string; url: string }[];
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const formattedMessages = [...messages, userMessage].map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const res = await fetch('/api/api-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: formattedMessages }),
      });

      const data = await res.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply ?? '',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get AI response', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Error getting response from server.',
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
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">New Chat</h1>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p>Start a conversation with AI</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex w-full',
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'flex max-w-[80%] gap-3',
                message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback>
                  {message.sender === 'user' ? 'U' : 'AI'}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <Card className={cn(
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                )}>
                  <CardContent className="p-3">
                    <p className="text-sm">{message.content}</p>
                  </CardContent>
                </Card>

                {message.sender === 'ai' && (message.images || message.sources) && (
                  <div className="w-full max-w-md">
                    <Tabs defaultValue="answer" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="answer">Answer</TabsTrigger>
                        <TabsTrigger value="images" disabled={!message.images}>Images</TabsTrigger>
                        <TabsTrigger value="videos" disabled>Videos</TabsTrigger>
                        <TabsTrigger value="sources" disabled={!message.sources}>Sources</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="answer" className="mt-2">
                        <Card>
                          <CardContent className="p-3">
                            <p className="text-sm text-muted-foreground">
                              Main response content appears here.
                            </p>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      {message.images && (
                        <TabsContent value="images" className="mt-2">
                          <div className="grid grid-cols-2 gap-2">
                            {message.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Generated image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        </TabsContent>
                      )}
                      
                      {message.sources && (
                        <TabsContent value="sources" className="mt-2">
                          <Card>
                            <CardContent className="p-3 space-y-2">
                              {message.sources.map((source, index) => (
                                <div key={index} className="text-sm">
                                  <a 
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {source.title}
                                  </a>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        </TabsContent>
                      )}
                    </Tabs>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <Card className="bg-muted">
                <CardContent className="p-3">
                  <TypingIndicator />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}