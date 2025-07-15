'use client';

import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { SettingsPage } from '@/components/settings-page';
import { useAuth } from '@/hooks/use-auth';
import { AuthPage } from '@/components/auth-page';

export default function Settings() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <SettingsPage />
        </main>
      </div>
    </div>
  );
}