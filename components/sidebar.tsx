'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Home, 
  MessageCircle, 
  Library, 
  Search, 
  Settings, 
  Plus,
  LogOut 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

const menuItems = [
  { name: 'Home', icon: Home, href: '/' },
  { name: 'New Chat', icon: MessageCircle, href: '/chat' },
  { name: 'Library', icon: Library, href: '/library' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-64 bg-muted/30 border-r flex flex-col">
      <div className="p-4">
        <Button className="w-full" asChild>
          <Link href="/chat">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Link>
        </Button>
      </div>

      <nav className="flex-1 px-3">
        {menuItems.map((item) => (
          <Button
            key={item.name}
            variant={pathname === item.href ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start mb-1',
              pathname === item.href && 'bg-secondary'
            )}
            asChild
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          </Button>
        ))}
      </nav>

      <div className="p-3 border-t">
        <div className="mb-2">
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
          />
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}