
import { useEffect,useState, type FormEvent } from 'react';

import { createAssignment } from '../api/assignmentApi';
import { useAssignableIncidents } from '../hooks/useAssignableIncidents';
import { useResponderRecommendations } from '../hooks/useResponderRecommendations';

import ResponderSelector from './ResponderSelector';
import ResponderRecommendation from './ResponderRecommendation';

export default function AssignmentForm() {
  const {
    incidents,
    loading: incidentsLoading,
    error: incidentsError,
    refetch: refetchIncidents,
  } = useAssignableIncidents();

  const [selectedIncidentId, setSelectedIncidentId] = useState('');
  const [selectedResponderId, setSelectedResponderId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const selectedIncident = incidents.find(
    (incident) => incident.id === selectedIncidentId,
    );

  const {
    responders,
    loading: respondersLoading,
    error: respondersError,
    } = useResponderRecommendations(selectedIncident?.id);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
  if (!toast) return;

  const timeoutId = window.setTimeout(() => {
    setToast(null);
  }, 5000);

    return () => window.clearTimeout(timeoutId);
    }, [toast]);


  const selectedResponder = responders.find(
    (responder) => responder.responder_id === selectedResponderId,
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setToast(null);

    if (!selectedIncidentId || !selectedResponderId) {
      setToast({
        message: 'Please select an incident and a responder.',
        type: 'error',
      });
      return;
    }

    setIsConfirmationOpen(true);
  };

  const confirmAssignment = async () => {
    try {
      setSubmitting(true);
      setIsConfirmationOpen(false);
      setToast(null);

      const response = await createAssignment({
        incidentId: selectedIncidentId,
        responderId: selectedResponderId,
      });

      setToast({
        message: response.message,
        type: 'success',
      });

      setSelectedIncidentId('');
      setSelectedResponderId('');

      await refetchIncidents();
    } catch {
      setToast({
        message: 'Failed to assign responder. Please try again.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-lg px-5 py-4 shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <span className="text-lg">
            {toast.type === 'success' ? '✓' : '⚠'}
          </span>

          <p className="text-sm font-medium">
            {toast.message}
          </p>

          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-3 text-white hover:opacity-75"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Assign Responder
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Select an incident and assign the most suitable responder
          based on current workload.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Incident Selection */}
        <div>
          <label
            htmlFor="incident"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Select Incident
          </label>

          <select
            id="incident"
            value={selectedIncidentId}
            onChange={(event) => {
                setSelectedIncidentId(event.target.value);
                setSelectedResponderId('');
                setToast(null);
            }}
            disabled={incidentsLoading}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">
              {incidentsLoading
                ? 'Loading incidents...'
                : 'Choose an incident'}
            </option>

            {incidents.map((incident) => (
              <option key={incident.id} value={incident.id}>
                {incident.reference_number} — {incident.type} (
                {incident.priority})
              </option>
            ))}
          </select>

          {incidentsError && (
            <p className="mt-2 text-sm text-red-600">
              {incidentsError}
            </p>
          )}

          {!incidentsLoading &&
            !incidentsError &&
            incidents.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                No eligible incidents found.
              </p>
            )}
        </div>

        {/* Selected Incident Details */}
        {selectedIncident && (
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-800">
              Incident Details
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              <strong>Reference:</strong>{' '}
              {selectedIncident.reference_number}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              <strong>Priority:</strong> {selectedIncident.priority}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              <strong>Location:</strong>{' '}
              {selectedIncident.address || 'Not provided'}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              <strong>Description:</strong>{' '}
              {selectedIncident.description}
            </p>
          </div>
        )}

        {/* Responder Recommendation */}
        {respondersError && (
          <p className="text-sm text-red-600">
            {respondersError}
          </p>
        )}

        <ResponderRecommendation responders={responders} />

        {/* Responder Selection */}
        <ResponderSelector
          responders={responders}
          selectedResponderId={selectedResponderId}
          onSelect={(responderId) => {
            setSelectedResponderId(responderId);
            setToast(null);
          }}
          loading={respondersLoading}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={
            submitting ||
            incidentsLoading ||
            respondersLoading ||
            !selectedIncidentId ||
            !selectedResponderId
          }
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Assign Responder
        </button>
      </form>

      {/* Assignment Confirmation Dialog */}
      {isConfirmationOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmation-title"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <h3
              id="confirmation-title"
              className="text-lg font-semibold text-gray-900"
            >
              Confirm Responder Assignment
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to assign this responder
              to the selected incident?
            </p>

            <div className="mt-5 space-y-3 rounded-lg bg-gray-50 p-4">

              <div>
                <p className="text-xs text-gray-500">Incident</p>
                <p className="font-medium text-gray-900">
                  {selectedIncident?.reference_number}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Priority</p>
                <p className="font-medium text-gray-900">
                  {selectedIncident?.priority}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Responder</p>
                <p className="font-medium text-gray-900">
                  {selectedResponder?.responder_name}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Current Active Assignments
                </p>
                <p className="font-medium text-gray-900">
                  {selectedResponder?.active_assignments}
                </p>
              </div>

            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmationOpen(false)}
                disabled={submitting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmAssignment}
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
