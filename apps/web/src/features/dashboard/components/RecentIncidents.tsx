
import { useState, useEffect } from 'react';
import { ArrowRight, Search, ChevronLeft, ChevronRight, } from 'lucide-react';

import {
  priorityStyles,
  statusStyles,
} from '../../../constants/dashboard';

import IncidentTable from '../../incidents/components/IncidentTable';
import type { Incident } from '../../../types/app.types';
import { getIncidents } from '../../incidents/api/incidentApi';
import type { CreatedIncident } from '../../incidents/types/incidentApi.types';

interface RecentIncidentsProps {
  onMenuSelect: (menu: string) => void;
  priorityFilter: Incident['priority'] | 'All';
  onPriorityFilterChange: (
    priority: Incident['priority'] | 'All'
  ) => void;
}

export default function RecentIncidents({
  onMenuSelect,
  priorityFilter,
  onPriorityFilterChange,
}: RecentIncidentsProps) {

const pageSize = 10;
const [search, setSearch] = useState('');
const [allIncidents, setAllIncidents] = useState<CreatedIncident[]>([]);
const [page, setPage] = useState(1);
const [totalIncidents, setTotalIncidents] = useState(0);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);


useEffect(() => {
  let cancelled = false;

  async function loadIncidents() {
    try {
      setLoading(true);
      setError(null);

      const response = await getIncidents({
        limit: pageSize,
        offset: (page - 1) * pageSize,
        priority:
          priorityFilter === 'All'
            ? undefined
            : priorityFilter,
      });

      if (cancelled) return;

      setAllIncidents(response.data);
      setTotalIncidents(response.pagination.total);
    } catch (err) {
      if (cancelled) return;

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load incidents.',
      );
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void loadIncidents();

  return () => {
    cancelled = true;
  };
}, [page, priorityFilter]);


const visibleIncidents = allIncidents.filter((incident) => {
  const searchableText = [
    incident.reference_number,
    incident.description,
    incident.address ?? '',
    incident.type,
  ]
    .join(' ')
    .toLowerCase();

  return searchableText.includes(search.toLowerCase());
});


  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
        <div>
          <h3 className="font-bold">Recent incidents</h3>
          <p className="mt-1 text-xs text-slate-500">
            Review the latest reported emergencies
          </p>
        </div>

        <button
          onClick={() => onMenuSelect('All Incidents')}
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          View all <ArrowRight size={15} />
        </button>
      </div>

      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-6">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            id="incident-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search incidents or locations..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={priorityFilter}
          onChange={(event) => {
            setPage(1);
            onPriorityFilterChange(event.target.value as Incident['priority'] | 'All',);
            }}
          aria-label="Filter by priority"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="All">All priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      {loading ? (
        <div className="px-6 py-12 text-center text-sm text-slate-500">
            Loading incidents...
        </div>
        ) : error ? (
        <div className="px-6 py-12 text-center text-sm text-red-600">
            {error}
        </div>
        ) : (
        <IncidentTable
            incidents={visibleIncidents}
            priorityStyles={priorityStyles}
            statusStyles={statusStyles}
        />
        )}

    <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-xs text-slate-500">
        Showing{' '}
        {totalIncidents === 0 ? 0 : (page - 1) * pageSize + 1}
        {'–'}
        {Math.min(page * pageSize, totalIncidents)}
        {' of '}
        {totalIncidents} incidents
    </p>

    <div className="flex items-center gap-2">
        <button
        type="button"
        onClick={() => setPage((current) => Math.max(1, current - 1))}
        disabled={page === 1 || loading}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
        <ChevronLeft size={16} />
        Previous
        </button>

        <span className="px-2 text-sm text-slate-600">
        Page {page} of {Math.max(1, Math.ceil(totalIncidents / pageSize))}
        </span>

        <button
        type="button"
        onClick={() => setPage((current) => current + 1)}
        disabled={
            loading ||
            page * pageSize >= totalIncidents
        }
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
        Next
        <ChevronRight size={16} />
        </button>
    </div>
    </div>

    </article>
  );
}
