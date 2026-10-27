
import { Bell, LogOut, Menu, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { Role } from '../types/app.types';

interface NavbarProps {
  role: Role;
  pageTitle: string;
  userName: string;
  userEmail: string;
  onOpenMenu: () => void;
  onLogout: () => void;
}

export default function Navbar({
  role,
  pageTitle,
  userName,
  userEmail,
  onOpenMenu,
  onLogout,
}: NavbarProps) {
  const navigate = useNavigate();

  const focusIncidentSearch = () => {
    document.getElementById('incident-search')?.focus();
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login', { replace: true });
  };

  const initials =
    userName
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
          onClick={onOpenMenu}
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <p className="truncate text-xs text-slate-400">
            Workspace / {role}
          </p>
          <h1 className="mt-1 truncate text-lg font-bold sm:text-xl">
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="ml-3 flex items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          System online
        </div>

        <button
          aria-label="Search incidents"
          onClick={focusIncidentSearch}
          className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"
        >
          <Search size={20} />
        </button>

        <button
          aria-label="Notifications"
          className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
        </button>

        <div className="hidden h-9 w-px bg-slate-200 sm:block" />

        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {initials}
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="max-w-40 truncate text-sm font-semibold">
              {userName}
            </p>
            <p className="max-w-40 truncate text-xs text-slate-400">
              {userEmail || role}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Sign out"
          title="Sign out"
          onClick={handleLogout}
          className="rounded-xl p-2.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
