// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { Send, Paperclip } from 'lucide-react';
// import ReactMarkdown from 'react-markdown';
// import { cn } from '@/lib/utils';
// import { TypingIndicator } from '@/components/typing-indicator';

// type Message = {
//   id: string;
//   content: string;
//   sender: 'user' | 'ai';
//   timestamp: Date;
// };

// export function ChatInterface() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleSendMessage = async () => {
//     if (!input.trim()) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       content: input,
//       sender: 'user',
//       timestamp: new Date(),
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setInput('');
//     setIsTyping(true);

//     try {
//       const formattedMessages = [...messages, userMessage].map(m => ({
//         role: m.sender === 'user' ? 'user' : 'assistant',
//         content: m.content,
//       }));

//       const res = await fetch('/api/api-chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ messages: formattedMessages, recordId: null }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data?.error || 'Error getting response from server.');
//       }

//       const aiMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         content: data.reply ?? '',
//         sender: 'ai',
//         timestamp: new Date(),
//       };
//       setMessages(prev => [...prev, aiMessage]);
//     } catch (error) {
//       console.error('Failed to get AI response', error);
//       const msg = error instanceof Error ? error.message : 'Error getting response from server.';
//       const errorMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         content: msg,
//         sender: 'ai',
//         timestamp: new Date(),
//       };
//       setMessages(prev => [...prev, errorMessage]);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const formatMarkdown = (text: string) => {
//     return text.replace(/([^\n])\n([^\n])/g, '$1\n\n$2');
//   };

//   return (
//     <div className="flex flex-col h-full bg-background">
//       <div className="flex-1 overflow-y-auto px-4 pt-6 pb-36 w-full">
//         {messages.length === 0 && (
//           <div className="text-center text-muted-foreground py-12">
//             <p>Start a conversation with AI</p>
//           </div>
//         )}

//         {messages.map((message) => (
//           <div
//             key={message.id}
//             className={cn(
//               'flex gap-4 mb-8 break-words',
//               message.sender === 'user' ? 'justify-end' : 'justify-start'
//             )}
//           >
//             {message.sender === 'ai' && (
//               <Avatar className="h-10 w-10">
//                 <AvatarFallback>AI</AvatarFallback>
//               </Avatar>
//             )}

//             <div
//               className={cn(
//                 'w-full',
//                 message.sender === 'user'
//                   ? 'bg-primary text-primary-foreground rounded-lg p-1 max-w-md'
//                   : ''
//               )}
//             >
//           {message.sender === 'ai' ? (
//             <div className="bg-muted rounded-lg px-6 py-4 w-full break-words font-['Roboto',sans-serif] leading-normal">
//           <ReactMarkdown
//             components={{
//               h1: ({ node, ...props }) => (
//                 <h1 className="text-3xl font-bold mt-6 mb-3 leading-tight" {...props} />
//               ),
//               h2: ({ node, ...props }) => (
//                 <h2 className="text-2xl font-bold mt-5 mb-2 leading-snug" {...props} />
//               ),
//               h3: ({ node, ...props }) => (
//                 <h3 className="text-xl font-semibold mt-4 mb-2 leading-snug" {...props} />
//               ),
//               p: ({ node, ...props }) => (
//                 <p className="mb-3 leading-normal" {...props} />
//               ),
//               ul: ({ node, ...props }) => (
//                 <ul className="list-disc ml-6 mb-3 leading-normal" {...props} />
//               ),
//               ol: ({ node, ...props }) => (
//                 <ol className="list-decimal ml-6 mb-3 leading-normal" {...props} />
//               ),
//               li: ({ node, ...props }) => (
//                 <li className="mb-1 leading-normal" {...props} />
//               ),
//               strong: ({ node, ...props }) => (
//                 <strong className="font-bold" {...props} />
//               ),
//             }}
//           >
//             {formatMarkdown(message.content)}
//           </ReactMarkdown>
//             </div>
//           ) : (
//             <p className="text-sm bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-md break-words">
//               {message.content}
//             </p>
//           )}
//         </div>
//             {message.sender === 'user' && (
//               <Avatar className="h-10 w-10">
//                 <AvatarFallback>U</AvatarFallback>
//               </Avatar>
//             )}
//           </div>
//         ))}

//         {isTyping && (
//           <div className="flex gap-4 mb-8">
//             <Avatar className="h-10 w-10">
//               <AvatarFallback>AI</AvatarFallback>
//             </Avatar>
//             <div className="bg-muted rounded-lg px-4 py-2">
//               <TypingIndicator />
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       <div className="sticky right-0 bottom-0 bg-background border-t p-4">
//         <div className="flex gap-2 mx-auto w-full">
//           {/* <Button variant="outline" size="sm">
//             <Paperclip className="h-4 w-4" />
//           </Button> */}
//           <Input
//             placeholder="Type your message..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyPress={handleKeyPress}
//             className="flex-1 rounded-lg"
//           />
//           <Button onClick={handleSendMessage} disabled={!input.trim()}>
//             <Send className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

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

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("question");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

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

  const createChatSession = async (newMessages: Message[]) => {
    const { data, error } = await supabase
      .from('Chats')
      .insert([
        {
          user_id: user?.id,
          title: newMessages[0]?.content.slice(0, 20) || 'New Chat',
          messages: newMessages,
          is_pinned: false,
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
    if (!chatId) return;
    const { error } = await supabase
      .from('Chats')
      .update({
        messages: updatedMessages,
        last_updated: new Date().toISOString(),
      })
      .eq('id', chatId);

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
    if (!chatId) return;
    const { error } = await supabase.from('Chats').delete().eq('id', chatId);
    if (!error) {
      setMessages([]);
      setChatId(null);
      setIsPinned(false);
    } else {
      console.error('Error deleting chat:', error);
    }
  };

  // const handleSendMessage = async () => {
  //   if (!input.trim()) return;

  //   const userMessage: Message = {
  //     id: Date.now().toString(),
  //     content: input,
  //     sender: 'user',
  //     timestamp: new Date(),
  //   };

  //   const newMessages = [...messages, userMessage];
  //   setMessages(newMessages);
  //   setInput('');
  //   setIsTyping(true);

  //   try {
  //     const formattedMessages = newMessages.map(m => ({
  //       role: m.sender === 'user' ? 'user' : 'assistant',
  //       content: m.content,
  //     }));

  //     const res = await fetch('/api/api-chat', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ messages: formattedMessages, recordId: null }),
  //     });

  //     const data = await res.json();
  //     if (!res.ok) {
  //       throw new Error(data?.error || 'Error getting response from server.');
  //     }

  //     const aiMessage: Message = {
  //       id: (Date.now() + 1).toString(),
  //       content: data.reply ?? '',
  //       sender: 'ai',
  //       timestamp: new Date(),
  //     };

  //     const updatedMessages = [...newMessages, aiMessage];
  //     setMessages(updatedMessages);

  //     if (!chatId) {
  //       await createChatSession(updatedMessages);
  //     } else {
  //       await updateChatSession(updatedMessages);
  //     }
  //   } catch (error) {
  //     console.error('Failed to get AI response', error);
  //     const msg = error instanceof Error ? error.message : 'Error getting response from server.';
  //     const errorMessage: Message = {
  //       id: (Date.now() + 1).toString(),
  //       content: msg,
  //       sender: 'ai',
  //       timestamp: new Date(),
  //     };
  //     setMessages(prev => [...prev, errorMessage]);
  //   } finally {
  //     setIsTyping(false);
  //   }
  // };

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

  const formatMarkdown = (text: string) => {
    return text.replace(/([^\n])\n([^\n])/g, '$1\n\n$2');
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
                    {formatMarkdown(message.content)}
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


