'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Sparkles, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const exampleQuestions = [
  "What are the latest trends in AI technology?",
  "How can I improve my productivity?",
  "Explain quantum computing in simple terms",
  "Write a creative story about space exploration",
  "Help me plan a healthy meal prep routine",
  "What are the best practices for remote work?",
];

const features = [
  {
    icon: MessageCircle,
    title: "Natural Conversations",
    description: "Chat naturally with AI that understands context and nuance"
  },
  {
    icon: Sparkles,
    title: "Creative Content",
    description: "Generate images, videos, and creative content on demand"
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your conversations are private and secure"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get instant responses powered by advanced AI"
  },
];

export function HomePage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold gradient-text">
            Welcome to MyChatAI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your intelligent AI companion for creative conversations, problem-solving, and endless possibilities.
          </p>
        </div>
        
        <Button size="lg" className="text-lg px-8" asChild>
          <Link href="/chat">
            <MessageCircle className="mr-2 h-5 w-5" />
            Start Chatting
          </Link>
        </Button>
      </section>

      {/* Example Questions */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">Try asking me...</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exampleQuestions.map((question, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/chat?question=${encodeURIComponent(question)}`)}
            >
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">&quot;{question}&quot;</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-semibold">Ready to Get Started?</h2>
        <p className="text-muted-foreground">
          Join thousands of users who are already exploring the future of AI conversation.
        </p>
        <Button size="lg" asChild>
          <Link href="/chat">
            Start Your Chat
          </Link>
        </Button>
      </section>
    </div>
  );
}