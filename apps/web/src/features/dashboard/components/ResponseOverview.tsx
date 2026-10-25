
import { Activity, CheckCircle2 } from 'lucide-react';

export default function ResponseOverview() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold">Response overview</h3>
          <p className="mt-1 text-xs text-slate-500">
            Current operational snapshot
          </p>
        </div>
        <Activity size={19} className="text-blue-700" />
      </div>

      <div className="mt-6 space-y-5">
        {[
          {
            label: 'Reported',
            count: 18,
            width: '25%',
            color: 'bg-slate-400',
          },
          {
            label: 'Under review',
            count: 12,
            width: '40%',
            color: 'bg-blue-500',
          },
          {
            label: 'Dispatched',
            count: 24,
            width: '65%',
            color: 'bg-violet-500',
          },
          {
            label: 'Resolved',
            count: 86,
            width: '90%',
            color: 'bg-emerald-500',
          },
        ].map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-600">{item.label}</span>
              <span className="font-semibold">{item.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${item.color}`}
                style={{ width: item.width }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl bg-blue-50 p-3.5">
        <CheckCircle2
          size={18}
          className="mt-0.5 shrink-0 text-blue-700"
        />
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Operations snapshot
          </p>
          <p className="mt-1 text-xs leading-5 text-blue-800/75">
            Example figures for the dashboard preview. Live metrics will come
            from the API.
          </p>
        </div>
      </div>
    </article>
  );
}
