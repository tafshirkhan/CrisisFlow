
import type { LucideIcon } from 'lucide-react';

export type Role =
  | 'Dispatcher'
  | 'Citizen'
  | 'Responder'
  | 'Administrator';

export interface Incident {
  reference: string;
  title: string;
  location: string;
  priority: 'Critical' | 'High' | 'Medium';
  status: 'Reported' | 'Under Review' | 'Dispatched' | 'Resolved';
  time: string;
  type: 'Fire' | 'Road Accident' | 'Medical' | 'Flood';
}

export interface NavigationItem {
  label: string;
  icon: LucideIcon;
}
