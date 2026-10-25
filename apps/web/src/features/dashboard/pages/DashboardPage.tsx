import { useState } from 'react';
import type { Role } from '../../../types/app.types';
import DashboardStats from '../components/DashboardStats';
import ResponseOverview from '../components/ResponseOverview';
import PriorityAttention from '../components/PriorityAttention';
import DashboardHeader from '../components/DashboardHeader';
import RecentIncidents from '../components/RecentIncidents';
import type { Incident } from '../../../types/app.types';

interface DashboardPageProps {
  role: Role;
  onMenuSelect: (menu: string) => void;
}


export default function DashboardPage({
  role,
  onMenuSelect,
}: DashboardPageProps) {
 
const [priorityFilter, setPriorityFilter] = useState<Incident['priority'] | 'All'>('All');

  return (
    <>
      {/* Dashboard */}

      <DashboardHeader
        role={role}
        onMenuSelect={onMenuSelect}
      />

      {/* //Dashboard Statistics */}
      <DashboardStats />

      
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Incident List */}
        <RecentIncidents
          onMenuSelect={onMenuSelect}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
        />

        <div className="space-y-6">
          <ResponseOverview />
          {/* Priority attention */}
          <PriorityAttention
            onPrioritySelect={() => {}}
            onMenuSelect={onMenuSelect}
            isCitizen={role === 'Citizen'}
          />
        </div>
      </section>
    </>
  );
}