'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/hooks/use-auth';
import { Palette, User, Bell, Save } from 'lucide-react';
import { supabase } from '@/data/supabase';
import { toast } from 'sonner';
import bcrypt from 'bcryptjs';
import { Eye, EyeOff } from 'lucide-react';

const themes = [
  { name: 'Light', value: 'light' as const, color: 'bg-white border' },
  { name: 'Dark', value: 'dark' as const, color: 'bg-gray-900' },
  { name: 'Pink', value: 'pink' as const, color: 'bg-pink-500' },
  { name: 'Yellow', value: 'yellow' as const, color: 'bg-yellow-500' },
  { name: 'Blue', value: 'blue' as const, color: 'bg-blue-500' },
  { name: 'Green', value: 'green' as const, color: 'bg-green-500' },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [notifications, setNotifications] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [password, setPassword] = useState(user?.password || '');
  const [showPassword, setShowPassword] = useState(false);


  const handleAvatarUpload = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chatai-avatars') // your bucket name
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('chatai-avatars')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      setAvatarUrl(publicUrlData.publicUrl);
      toast.success('Avatar uploaded successfully!');
    } catch (error: any) {
      toast.error(`Avatar upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

const handleSave = async () => {
  try {
    let updatedPassword = password;
    if (password !== user?.password) {
      // ✅ Hash new password only if changed
      updatedPassword = await bcrypt.hash(password, 10);
    }

    const { error } = await supabase
      .from('Users')
      .update({ name, email, avatar: avatarUrl, password: updatedPassword })
      .eq('id', user?.id);

    if (error) throw error;

    // Refetch updated user
    const { data: updatedUserData, error: fetchError } = await supabase
      .from('Users')
      .select('*')
      .eq('id', user?.id)
      .single();

    if (fetchError) throw fetchError;

    setName(updatedUserData.name);
    setEmail(updatedUserData.email);
    setAvatarUrl(updatedUserData.avatar);
    setPassword(updatedUserData.password);

    setUser({
      ...user,
      id: user?.id ?? '',
      name: updatedUserData.name,
      email: updatedUserData.email,
      avatar: updatedUserData.avatar,
      password: updatedUserData.password,
    });

    localStorage.setItem(
      'user',
      JSON.stringify({
        ...user,
        name: updatedUserData.name,
        email: updatedUserData.email,
        avatar: updatedUserData.avatar,
        password: updatedUserData.password,
      })
    );

    toast.success('Settings saved successfully!');
  } catch (error: any) {
    toast.error(`Failed to save: ${error.message}`);
  }
};

  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotifications(true);
        toast.success('Notifications enabled!');
      } else {
        setNotifications(false);
        toast.error('Notifications denied.');
      }
    } else {
      toast.error('This browser does not support notifications.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={handleSave} disabled={uploading}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Manage your account information and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            {/* <label
              htmlFor="avatarUpload"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-md cursor-pointer bg-transparent hover:bg-accent transition"
            >
              {uploading ? 'Uploading...' : 'Change Avatar'}
              <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleAvatarUpload(file);
                  }
                }}
              />
            </label> */}
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[0.75rem]">The password shown on the screen is a hashed password, and cannot be viewed in plain text.</p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme
          </CardTitle>
          <CardDescription>Customize the appearance of your application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label>Color Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => setTheme(themeOption.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    theme === themeOption.value
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${themeOption.color}`} />
                    <span className="text-sm font-medium">{themeOption.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Control how and when you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about new features and updates
              </p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={() => {
                handleRequestNotificationPermission();
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
