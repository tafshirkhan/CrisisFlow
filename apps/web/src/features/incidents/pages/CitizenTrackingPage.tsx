
import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Search,
} from 'lucide-react';

import { getIncidentByReferenceNumber, cancelIncident, getIncidentStatusHistory, } from '../api/incidentApi';
import type { CreatedIncident, IncidentStatusHistoryEntry,  } from '../types/incidentApi.types';
import { toast } from 'sonner';

export default function CitizenTrackingPage() {
   
    function formatDate(value: string) {
    return new Date(value).toLocaleString();
    }

    function formatLabel(value: string) {
    return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) =>
        char.toUpperCase(),
    );
    }

  const [referenceNumber, setReferenceNumber] = useState('');
  const [incident, setIncident] = useState<CreatedIncident | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [cancelling, setCancelling] = useState(false);
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [statusHistory, setStatusHistory] = useState<IncidentStatusHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const reference = referenceNumber.trim();

    if (!reference) {
      setError('Please enter your incident reference number.');
      setIncident(null);
      return;
    }

    setLoading(true);
    setError('');
    setIncident(null);

    
    try {
    const result = await getIncidentByReferenceNumber(reference);
    setIncident(result);

    // Load the real status history for this incident
    setHistoryLoading(true);
    setHistoryError('');
    setStatusHistory([]);

    try {
        const historyResponse = await getIncidentStatusHistory(result.id);
        setStatusHistory(historyResponse.history);
    } catch {
        setHistoryError(
        'Incident details were found, but status history could not be loaded.',
        );
    } finally {
        setHistoryLoading(false);
    }
    } catch (err: unknown) {
    setIncident(null);
    setStatusHistory([]);

    const statusCode =
        typeof err === 'object' && err !== null && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;

    if (statusCode === 404) {
        setError(
        'No incident was found for that reference number. Please check it and try again.',
        );
    } else {
        setError('Unable to retrieve the incident. Please try again later.');
    }
    } finally {
        setLoading(false);
     }

}



  async function handleCancelIncident() {
  if (!incident) return;
  setCancelling(true);
  try {
    await cancelIncident(incident.id);

    setIncident({
      ...incident,
      status: 'CANCELLED',
      updated_at: new Date().toISOString(),
    });

    try {
        const historyResponse = await getIncidentStatusHistory(incident.id);
        setStatusHistory(historyResponse.history);
        setHistoryError('');
        } catch {
        setHistoryError(
            'Incident was cancelled, but its status history could not be refreshed.',
        );
    }

    toast.success('Incident report cancelled successfully.');
    setShowCancelModal(false);
  } catch (error) {
    toast.error(
      'Unable to cancel this incident. It may no longer be eligible for cancellation.',
    );
  } finally {
    setCancelling(false);
  }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-600">Citizen Services</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Track My Report
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your incident reference number to check its latest status.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <label
          htmlFor="incident-reference"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Incident reference number
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="incident-reference"
            type="text"
            value={referenceNumber}
            onChange={(event) => setReferenceNumber(event.target.value)}
            placeholder="e.g. CF-9D471AE7790E"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search size={17} />
            {loading ? 'Searching...' : 'Track report'}
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 text-sm text-red-600"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}
      </form>

      {incident && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reference number
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {incident.reference_number}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Submitted {formatDate(incident.created_at)}
                </p>
              </div>

              <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                {formatLabel(incident.status)}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Incident type</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatLabel(incident.type)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Priority</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatLabel(incident.priority)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">People affected</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {incident.people_affected}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-800">
                Incident description
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {incident.description}
              </p>
            </div>

            {incident.address && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-slate-800">
                  Reported location
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {incident.address}
                </p>
              </div>
            )}

            
            {['REPORTED', 'RECEIVED'].includes(incident.status) && (
                <div className="mt-6 border-t border-slate-100 pt-5">
                    <h3 className="text-sm font-semibold text-slate-800">
                    Cancel incident report
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                    If you submitted this report by mistake, you can request cancellation
                    while it is still eligible.
                    </p>

                    {/* {cancelError && (
                    <p role="alert" className="mt-3 text-sm text-red-600">
                        {cancelError}
                    </p>
                    )}

                    {cancelSuccess && (
                    <p role="status" className="mt-3 text-sm text-emerald-700">
                        {cancelSuccess}
                    </p>
                    )} */}

                    <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    disabled={cancelling}
                    className="mt-4 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                    {cancelling ? 'Cancelling...' : 'Cancel incident report'}
                    </button>
                </div>
            )}

          </section>

          {/* <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Response progress
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Current progress based on the incident status.
            </p>

            {incident.status === 'CANCELLED' ? (
              <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-amber-800">
                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Report cancelled</p>
                  <p className="mt-1 text-sm">
                    This incident has been marked as cancelled.
                  </p>
                </div>
              </div>
            ) : currentStep >= 0 ? (
              <ol className="mt-6 space-y-5">
                {statusSteps.map((step, index) => {
                  const completed = index <= currentStep;
                  const current = index === currentStep;

                  return (
                    <li key={step.value} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        {completed ? (
                          <CheckCircle2
                            size={22}
                            className="shrink-0 text-emerald-600"
                          />
                        ) : (
                          <Clock
                            size={22}
                            className="shrink-0 text-slate-300"
                          />
                        )}
                        {index < statusSteps.length - 1 && (
                          <div
                            className={`mt-1 min-h-6 w-0.5 flex-1 ${
                              index < currentStep
                                ? 'bg-emerald-500'
                                : 'bg-slate-200'
                            }`}
                          />
                        )}
                      </div>

                      <div className="pb-2">
                        <p
                          className={`text-sm font-semibold ${
                            current ? 'text-blue-700' : completed ? 'text-slate-800' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                          {current && ' — Current status'}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-slate-700">
                <ShieldAlert size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">
                    {formatLabel(incident.status)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    The incident has a status that is not included in the standard progress timeline.
                  </p>
                </div>
              </div>
            )}

            <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
              Last updated: {formatDate(incident.updated_at)}
            </p>
          </section> */}

          
<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
  <h2 className="text-lg font-bold text-slate-900">
    Incident Status History
  </h2>
  <p className="mt-1 text-sm text-slate-500">
    A timeline of recorded updates for your incident.
  </p>

  {historyLoading ? (
    <p className="mt-5 text-sm text-slate-500">
      Loading status history...
    </p>
  ) : historyError ? (
    <p className="mt-5 text-sm text-red-600" role="alert">
      {historyError}
    </p>
  ) : statusHistory.length === 0 ? (
    <p className="mt-5 text-sm text-slate-500">
      No status history is available for this incident yet.
    </p>
  ) : (
    <ol className="mt-6 space-y-5">
      {statusHistory.map((entry, index) => (
        <li key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            {index === 0 ? (
              <AlertCircle
                size={22}
                className="shrink-0 text-blue-600"
              />
            ) : (
              <CheckCircle2
                size={22}
                className="shrink-0 text-emerald-600"
              />
            )}

            {index < statusHistory.length - 1 && (
              <div className="mt-1 min-h-6 w-0.5 flex-1 bg-slate-200" />
            )}
          </div>

          <div className="pb-2">
            <p className="text-sm font-semibold text-slate-800">
              {formatLabel(entry.new_status)}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {entry.previous_status
                ? `${formatLabel(entry.previous_status)} → ${formatLabel(entry.new_status)}`
                : 'Incident report submitted'}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {formatDate(entry.changed_at)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )}

  {incident.status === 'CANCELLED' && (
    <div className="mt-5 rounded-xl bg-amber-50 p-4 text-amber-800">
      <p className="font-semibold">Report cancelled</p>
      <p className="mt-1 text-sm">
        This incident has been marked as cancelled.
      </p>
    </div>
  )}

  <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
    Last updated: {formatDate(incident.updated_at)}
  </p>
</section>

        </div>
      )}

    {/* //CANCEL incident modal */}
    {showCancelModal && incident && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <AlertCircle size={26} className="text-amber-600" />
        </div>

        <h2
            id="cancel-modal-title"
            className="mt-4 text-xl font-bold text-slate-900"
        >
            Cancel incident report?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
            Are you sure you want to cancel incident{' '}
            <strong>{incident.reference_number}</strong>? This action will update
            the incident status and may not be reversible.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
            type="button"
            onClick={() => setShowCancelModal(false)}
            disabled={cancelling}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
            Keep Report
            </button>

            <button
            type="button"
            onClick={() => {
                setShowCancelModal(false);
                void handleCancelIncident();
            }}
            disabled={cancelling}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
            Yes, Cancel Report
            </button>
        </div>
        </div>
    </div>
    )}

    </div>
  );
}
