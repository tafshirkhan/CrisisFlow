
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

import { stats } from '../../../constants/dashboard';

export default function DashboardStats() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const Trend =
          stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;

        return (
          <article
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/70"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.background} ${stat.color}`}
              >
                <Icon size={21} />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs">
              <span
                className={`inline-flex items-center font-semibold ${
                  stat.trend === 'up'
                    ? 'text-emerald-600'
                    : 'text-emerald-600'
                }`}
              >
                <Trend size={14} />
                {stat.change}
              </span>
              <span className="text-slate-400">
                vs. previous period
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
