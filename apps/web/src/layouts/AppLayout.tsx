
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import type { NavigationItem, Role } from '../types/app.types';
import { useAuth } from '../features/auth/context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

interface AppLayoutProps {
  role: Role;
  navigation: NavigationItem[];
  activeMenu: string;
  pageTitle: string;
  mobileMenuOpen: boolean;
  onMenuSelect: (menu: string) => void;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  children: ReactNode;
}

export default function AppLayout({
  role,
  navigation,
  activeMenu,
  pageTitle,
  mobileMenuOpen,
  onMenuSelect,
  onOpenMenu,
  onCloseMenu,
  children,
}: AppLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Toaster position="top-right" richColors />

      {mobileMenuOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={onCloseMenu}
        />
      )}

      <Sidebar
        role={role}
        navigation={navigation}
        activeMenu={activeMenu}
        mobileMenuOpen={mobileMenuOpen}
        onMenuSelect={onMenuSelect}
        onClose={onCloseMenu}
      />

      <div className="min-h-screen lg:pl-64">
        <Navbar
          role={role}
          pageTitle={pageTitle}
          userName={user?.fullName ?? 'User'}
          userEmail={user?.email ?? ''}
          onOpenMenu={onOpenMenu}
          onLogout={logout}
        />

        <main className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-6 lg:p-8">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}
