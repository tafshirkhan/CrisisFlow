
import {
  CheckCircle2,
  Clock3,
  Radio,
  Siren,
} from 'lucide-react';

import type { Incident } from '../types/app.types';

export const incidents: Incident[] = [
  {
    reference: 'CF-2026-0042',
    title: 'Road traffic collision',
    location: 'North Circular Road, Dublin 7',
    priority: 'Critical',
    status: 'Dispatched',
    time: '2 min ago',
    type: 'Road Accident',
  },
  {
    reference: 'CF-2026-0041',
    title: 'Medical assistance required',
    location: 'Dorset Street, Dublin 1',
    priority: 'High',
    status: 'Under Review',
    time: '8 min ago',
    type: 'Medical',
  },
  {
    reference: 'CF-2026-0040',
    title: 'Building fire reported',
    location: 'Phibsborough Road, Dublin 7',
    priority: 'Critical',
    status: 'Dispatched',
    time: '12 min ago',
    type: 'Fire',
  },
  {
    reference: 'CF-2026-0039',
    title: 'Localised flooding',
    location: 'Church Street, Dublin 7',
    priority: 'Medium',
    status: 'Reported',
    time: '18 min ago',
    type: 'Flood',
  },
  {
    reference: 'CF-2026-0038',
    title: 'Minor road collision',
    location: 'Cabra Road, Dublin 7',
    priority: 'Medium',
    status: 'Resolved',
    time: '32 min ago',
    type: 'Road Accident',
  },
];

export const stats = [
  {
    label: 'Total incidents',
    value: '128',
    change: '+12.5%',
    trend: 'up',
    icon: Siren,
    color: 'text-blue-600',
    background: 'bg-blue-50',
  },
  {
    label: 'Awaiting response',
    value: '18',
    change: '-8.2%',
    trend: 'down',
    icon: Clock3,
    color: 'text-amber-600',
    background: 'bg-amber-50',
  },
  {
    label: 'Teams deployed',
    value: '24',
    change: '+4.1%',
    trend: 'up',
    icon: Radio,
    color: 'text-violet-600',
    background: 'bg-violet-50',
  },
  {
    label: 'Resolved today',
    value: '86',
    change: '+16.8%',
    trend: 'up',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    background: 'bg-emerald-50',
  },
];

export const priorityStyles: Record<Incident['priority'], string> = {
  Critical: 'bg-red-50 text-red-700 ring-red-200',
  High: 'bg-orange-50 text-orange-700 ring-orange-200',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-200',
};

export const statusStyles: Record<Incident['status'], string> = {
  Reported: 'bg-slate-100 text-slate-700',
  'Under Review': 'bg-blue-50 text-blue-700',
  Dispatched: 'bg-violet-50 text-violet-700',
  Resolved: 'bg-emerald-50 text-emerald-700',
};
