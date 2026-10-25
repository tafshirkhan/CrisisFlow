
import { Activity, ArrowRight, Plus } from 'lucide-react';

import type { Role } from '../../../types/app.types';

interface DashboardHeaderProps {
  role: Role;
  onMenuSelect: (menu: string) => void;
}

export default function DashboardHeader({
  role,
  onMenuSelect,
}: DashboardHeaderProps) {
  return (
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
          <Activity size={15} />
          Emergency management platform
        </div>

        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Good day, {role === 'Citizen' ? 'there' : role}.
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {role === 'Dispatcher'
            ? 'Monitor incoming incidents, coordinate response teams, and keep every response moving.'
            : role === 'Citizen'
              ? 'Report emergencies and keep track of the incidents you have submitted.'
              : role === 'Responder'
                ? 'Review your assigned incidents and stay up to date with response activities.'
                : 'Monitor platform activity and review incident operations at a glance.'}
        </p>
      </div>

      {role === 'Citizen' ? (
        <button
          onClick={() => onMenuSelect('Report Emergency')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
        >
          <Plus size={18} />
          Report emergency
        </button>
      ) : (
        <button
          onClick={() => onMenuSelect('All Incidents')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
        >
          <Activity size={18} />
          View incidents
          <ArrowRight size={16} />
        </button>
      )}
    </section>
  );
}
