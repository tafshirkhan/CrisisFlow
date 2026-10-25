
import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { Incident } from '../../../types/app.types';

interface PriorityAttentionProps {
  onPrioritySelect: (priority: Incident['priority'] | 'All') => void;
  onMenuSelect: (menu: string) => void;
  isCitizen: boolean;
}

export default function PriorityAttention({
  onPrioritySelect,
  onMenuSelect,
  isCitizen,
}: PriorityAttentionProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <AlertTriangle size={19} className="text-amber-600" />
        <h3 className="font-bold">Priority attention</h3>
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Critical incidents should be reviewed promptly by an authorised
        dispatcher.
      </p>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-3">
        <div>
          <p className="text-sm font-semibold text-red-800">
            Critical incidents
          </p>
          <p className="mt-1 text-xs text-red-600">Example data</p>
        </div>
        <span className="text-2xl font-bold text-red-700">02</span>
      </div>

      <button
        onClick={() => {
          onPrioritySelect('Critical');
          onMenuSelect(isCitizen ? 'My Reports' : 'All Incidents');
        }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Review critical incidents
        <ArrowRight size={16} />
      </button>
    </article>
  );
}
