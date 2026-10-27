
import {
  ShieldCheck,
  Siren,
  X,
} from 'lucide-react';

//import { roleOptions } from '../constants/navigation';
import type { NavigationItem, Role } from '../types/app.types';

interface SidebarProps {
  role: Role;
  navigation: NavigationItem[];
  activeMenu: string;
  mobileMenuOpen: boolean;
  onMenuSelect: (menu: string) => void;
  onClose: () => void;
}

export default function Sidebar({
  navigation,
  activeMenu,
  mobileMenuOpen,
  onMenuSelect,
  onClose,
}: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
            <Siren size={23} />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight">
              Crisis<span className="text-blue-700">Flow</span>
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Emergency response
            </p>
          </div>
        </a>

        <button
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Close sidebar"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Workspace
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;
          const active = activeMenu === item.label;

          return (
            <button
              key={item.label}
              onClick={() => {
                onMenuSelect(item.label);
                onClose();
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={19} />
              <span>{item.label}</span>

              {item.label === 'All Incidents' && (
                <span className="ml-auto rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                  18
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-2xl bg-slate-900 p-4 text-white">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <ShieldCheck size={20} />
          </div>

          <p className="text-sm font-semibold">
            Emergency operations
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Keep teams informed and communities safer.
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Interface preview
          </div>
        </div>
      </div>
    </aside>
  );
}
