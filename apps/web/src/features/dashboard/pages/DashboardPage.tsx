import { useState } from 'react';
import type { Role, Incident } from '../../../types/app.types';

import DashboardStats from '../components/DashboardStats';
import ResponseOverview from '../components/ResponseOverview';
import PriorityAttention from '../components/PriorityAttention';
import DashboardHeader from '../components/DashboardHeader';
import RecentIncidents from '../components/RecentIncidents';
import ResponderWorkload from '../components/ResponderWorkload';

interface DashboardPageProps {
  role: Role;
  onMenuSelect: (menu: string) => void;
}

export default function DashboardPage({
  role,
  onMenuSelect,
}: DashboardPageProps) {
  const [priorityFilter, setPriorityFilter] =
    useState<Incident['priority'] | 'All'>('All');

  const isOperationalRole =
    role === 'Dispatcher' || role === 'Administrator';

  return (
    <>
      <DashboardHeader
        role={role}
        onMenuSelect={onMenuSelect}
      />

      {isOperationalRole ? (
        <>
          <DashboardStats />
          <div className="mt-6">
            <ResponderWorkload />
          </div>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <RecentIncidents
              onMenuSelect={onMenuSelect}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
            />

            <div className="space-y-6">
              <ResponseOverview />

              <PriorityAttention
                onPrioritySelect={() => {}}
                onMenuSelect={onMenuSelect}
                isCitizen={false}
              />
            </div>
          </section>
        </>
      ) : role === 'Citizen' ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Welcome to your Citizen Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Report an emergency and keep track of the incidents
            you have submitted.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onMenuSelect('Report Emergency')}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Report Emergency
            </button>

            <button
              type="button"
              onClick={() => onMenuSelect('My Reports')}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View My Reports
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Responder Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Your assigned incidents and response updates will be
            available here.
          </p>
        </section>
      )}
    </>
  );
}