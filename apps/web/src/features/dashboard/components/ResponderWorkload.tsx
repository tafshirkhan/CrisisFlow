// What this component displays
// Total active responders returned by the API.
// Total active assignments across those responders.
// Each responder's individual assignment count.
// Loading and error states.
// A refresh button to fetch the latest data.

const priorityStyles: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 ring-red-200',
  HIGH: 'bg-orange-100 text-orange-800 ring-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  LOW: 'bg-green-100 text-green-800 ring-green-200',
};

const statusStyles: Record<string, string> = {
  REPORTED: 'bg-blue-100 text-blue-800 ring-blue-200',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  DISPATCHED: 'bg-violet-100 text-violet-800 ring-violet-200',
  RESOLVED: 'bg-green-100 text-green-800 ring-green-200',
};

import { Activity, Users, RefreshCw } from 'lucide-react';

import { useResponderWorkload } from '../hooks/useResponderWorkload';
import { useState } from 'react';
import { X, MapPin, ClipboardList } from 'lucide-react';
import { useResponderAssignments } from '../hooks/useResponderAssignments';

export default function ResponderWorkload() {
  const [selectedResponder, setSelectedResponder] =
  useState<{
    id: string;
    name: string;
  } | null>(null);

const {
  data: assignmentData,
  loading: assignmentsLoading,
  error: assignmentsError,
  fetchAssignments,
  clearAssignments,
} = useResponderAssignments();

const handleResponderClick = (
  responderId: string,
  responderName: string,
) => {
  setSelectedResponder({
    id: responderId,
    name: responderName,
  });

  void fetchAssignments(responderId);
};

const closeDetails = () => {
  setSelectedResponder(null);
  clearAssignments();
};



  const { data, loading, error, refetch } = useResponderWorkload();

  const totalAssignments =
    data?.responders.reduce(
      (total, responder) =>
        total + responder.active_assignments,
      0
    ) ?? 0;

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Loading responder workload...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-red-600">{error}</p>

        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-3 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900">
            Responder workload
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Current assignment distribution
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refetch()}
          title="Refresh workload"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-blue-50 p-4">
          <Users size={20} className="text-blue-700" />

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {data?.count ?? 0}
          </p>

          <p className="text-xs text-slate-600">
            Active Responders
          </p>
        </div>

        <div className="rounded-xl bg-violet-50 p-4">
          <Activity size={20} className="text-violet-700" />

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {totalAssignments}
          </p>

          <p className="text-xs text-slate-600">
            Active Assignments
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="mb-3 text-sm font-semibold text-slate-800">
            Individual workload
        </h4>

        {data?.responders.length ? (
            <div className="space-y-3">
            {data.responders.map((responder) => (
                <button
                key={responder.responder_id}
                type="button"
                onClick={() =>
                    handleResponderClick(
                    responder.responder_id,
                    responder.responder_name,
                    )
                }
                className="flex w-full items-center justify-between rounded-lg border border-slate-100 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                <div className="flex min-w-0 flex-wrap items-center gap-2">
  <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
    {responder.responder_name}
  </span>

  {responder.active_assignments === 0 ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-200">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      Available
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Busy
    </span>
  )}
</div>

                <span className="ml-3 whitespace-nowrap rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {responder.active_assignments} active
                </span>
                </button>
            ))}
            </div>
        ) : (
            <p className="text-sm text-slate-500">
            No active responders found.
            </p>
        )}
      </div>

    {selectedResponder && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
            <div>
                <h3 className="text-lg font-bold text-slate-900">
                {selectedResponder.name}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">
                        ID: {selectedResponder.id.slice(0, 8)}...{selectedResponder.id.slice(-6)}
                    </span>

                    <button
                        type="button"
                        onClick={() => {
                        void navigator.clipboard.writeText(selectedResponder.id);
                        }}
                        className="text-xs font-medium text-blue-700 hover:text-blue-900"
                        title="Copy full responder ID"
                    >
                        Copy ID
                    </button>
                </div>
            </div>

            <button
                type="button"
                onClick={closeDetails}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close responder details"
            >
                <X size={18} />
            </button>
            </div>

            <div className="mt-5">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <ClipboardList size={17} />
                Active assignments
            </h4>

            {assignmentsLoading ? (
                <p className="text-sm text-slate-500">
                Loading assignments...
                </p>
            ) : assignmentsError ? (
                <p className="text-sm text-red-600">
                {assignmentsError}
                </p>
            ) : assignmentData?.assignments.length ? (
                <div className="space-y-4">
                {assignmentData.assignments.map((assignment) => {
                    const incident = assignment.incident?.data;

                    return (
                     
                    <article key={assignment.id} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5" >
                    {/* Incident information */}
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                        <h5 className="font-semibold text-blue-700">
                            {incident?.reference_number ?? assignment.incident_id}
                        </h5>

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                            priorityStyles[incident?.priority ?? ''] ??
                            'bg-slate-100 text-slate-700 ring-slate-200'
                            }`}
                        >
                            {incident?.priority ?? 'Unknown'}
                        </span>
                        </div>

                        <p className="mt-3 text-sm font-semibold text-slate-800">
                        {incident?.type?.replaceAll('_', ' ') ?? 'Unknown incident'}
                        </p>

                        {incident?.description && (
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            {incident.description}
                        </p>
                        )}
                    </div>

                    <div className="my-4 border-t border-slate-100" />

                    {/* Location information */}
                    <div>
                        <h6 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Location
                        </h6>

                        <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                            <MapPin size={16} className="mt-0.5 shrink-0 text-slate-500" />

                            <span>
                            {incident?.address ?? 'Location unavailable'}
                            </span>
                        </div>

                        {incident?.latitude != null &&
                            incident?.longitude != null && (
                            <a
                                href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                            >
                                Open in Google Maps
                                <MapPin size={13} />
                            </a>
                            )}
                        </div>
                    </div>

                    <div className="my-4 border-t border-slate-100" />

                    {/* Assignment information */}
                    <div>
                        <h6 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Assignment information
                        </h6>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <p className="text-xs text-slate-500">
                            Assigned date
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-800">
                            {new Date(assignment.assigned_at).toLocaleString(
                                'en-IE',
                                {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                                },
                            )}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">
                            Incident status
                            </p>

                            <span
                            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                                statusStyles[incident?.status ?? ''] ??
                                'bg-slate-100 text-slate-700 ring-slate-200'
                            }`}
                            >
                            {(incident?.status ?? assignment.status).replaceAll('_', ' ')}
                            </span>
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">
                            People affected
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-800">
                            {incident?.people_affected ?? 'N/A'}
                            </p>
                        </div>
                        </div>
                    </div>
                    </article>

                    );
                })}
                </div>
            ) : (
                <p className="text-sm text-slate-500">
                This responder currently has no active assignments.
                </p>
            )}
            </div>
        </div>
    )}
    </section>
  );
}
