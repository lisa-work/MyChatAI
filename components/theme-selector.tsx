'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/data/supabase';
import { toast } from 'sonner';
import { Palette } from 'lucide-react';

// Define Theme type explicitly
type Theme = 'light' | 'dark' | 'pink' | 'yellow' | 'blue' | 'green';

const themes = [
  { name: 'Light', value: 'light' as const, color: 'bg-white' },
  { name: 'Dark', value: 'dark' as const, color: 'bg-gray-900' },
  { name: 'Pink', value: 'pink' as const, color: 'bg-pink-500' },
  { name: 'Yellow', value: 'yellow' as const, color: 'bg-yellow-500' },
  { name: 'Blue', value: 'blue' as const, color: 'bg-blue-500' },
  { name: 'Green', value: 'green' as const, color: 'bg-green-500' },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const { user, setUser } = useAuth();

  const handleThemeChange = async (selectedTheme: Theme) => {
    setTheme(selectedTheme);

    try {
      const { error } = await supabase
        .from('Users')
        .update({ theme: selectedTheme })
        .eq('id', user?.id);

      if (error) throw error;

      // Update context and local storage
      const updatedUser = {
        ...user,
        id: user!.id,
        theme: selectedTheme,
        email: user!.email,
        name: user!.name,
        avatar: user!.avatar,
        password: user!.password
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success(`Theme updated to ${selectedTheme}`);
    } catch (error: any) {
      toast.error(`Failed to update theme: ${error.message}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => handleThemeChange(themeOption.value)}
            className="flex items-center gap-2"
          >
            <div className={`w-4 h-4 rounded-full ${themeOption.color} border`} />
            {themeOption.name}
            {theme === themeOption.value && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
