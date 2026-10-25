
import {
  Activity,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Radio,
  Settings,
  Siren,
  Users,
} from 'lucide-react';

import type { NavigationItem, Role } from '../types/app.types';

export const roleOptions: Role[] = [
  'Dispatcher',
  'Citizen',
  'Responder',
  'Administrator',
];

export const roleMenus: Record<Role, NavigationItem[]> = {
  Dispatcher: [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'All Incidents', icon: Siren },
    { label: 'Live Operations', icon: Radio },
    { label: 'Response Teams', icon: Users },
    { label: 'Reports', icon: FileText },
  ],
  Citizen: [
    { label: 'My Dashboard', icon: LayoutDashboard },
    { label: 'Report Emergency', icon: Plus },
    { label: 'My Reports', icon: Siren },
    { label: 'Messages', icon: MessageSquare },
  ],
  Responder: [
    { label: 'My Dashboard', icon: LayoutDashboard },
    { label: 'Assigned Incidents', icon: Siren },
    { label: 'Response Updates', icon: Activity },
    { label: 'Messages', icon: MessageSquare },
  ],
  Administrator: [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'All Incidents', icon: Siren },
    { label: 'User Management', icon: Users },
    { label: 'Reports & Analytics', icon: FileText },
    { label: 'Settings', icon: Settings },
  ],
};
