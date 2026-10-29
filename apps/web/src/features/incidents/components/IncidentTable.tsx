
import { useEffect, useState } from 'react';
import { MapPin, Paperclip, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { CreatedIncident, IncidentAttachment } from '../types/incidentApi.types';
import {
  listIncidentAttachments,
  fetchIncidentAttachment,
} from '../api/incidentApi';

interface IncidentTableProps {
  incidents: CreatedIncident[];
  priorityStyles: Record<string, string>;
  statusStyles: Record<string, string>;
}

function formatStatus(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatReportedDate(date: string): string {
  return new Date(date).toLocaleString('en-IE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getPriorityStyle(
  priority: string,
  priorityStyles: Record<string, string>,
): string {
  return (
    priorityStyles[priority] ??
    'bg-slate-100 text-slate-600 ring-slate-200'
  );
}

function getStatusStyle(
  status: string,
  statusStyles: Record<string, string>,
): string {
  return (
    statusStyles[formatStatus(status)] ??
    statusStyles[status] ??
    'bg-slate-100 text-slate-600'
  );
}

export default function IncidentTable({
  incidents,
  priorityStyles,
  statusStyles,
}: IncidentTableProps) {
  const [attachmentsByIncident, setAttachmentsByIncident] = useState<
    Record<string, IncidentAttachment[]>
  >({});
  const [attachmentErrors, setAttachmentErrors] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    let cancelled = false;

    async function loadAttachments() {
      const results = await Promise.all(
        incidents.map(async (incident) => {
          try {
            const attachments = await listIncidentAttachments(incident.id);

            return {
              incidentId: incident.id,
              attachments,
              failed: false,
            };
          } catch {
            return {
              incidentId: incident.id,
              attachments: [],
              failed: true,
            };
          }
        }),
      );

      if (cancelled) return;

      const nextAttachments: Record<string, IncidentAttachment[]> = {};
      const nextErrors: Record<string, boolean> = {};

      for (const result of results) {
        nextAttachments[result.incidentId] = result.attachments;

        if (result.failed) {
          nextErrors[result.incidentId] = true;
        }
      }

      setAttachmentsByIncident(nextAttachments);
      setAttachmentErrors(nextErrors);
    }

    void loadAttachments();

    return () => {
      cancelled = true;
    };
  }, [incidents]);

  
  async function handleOpenEvidence(attachment: IncidentAttachment) {
    // Open a blank tab immediately to avoid popup blocking.
    const newTab = window.open('about:blank', '_blank');

    if (!newTab) {
      toast.error('Allow pop-ups in your browser to open evidence.');
      return;
    }

    newTab.opener = null;
    newTab.document.title = 'Loading incident evidence...';
    newTab.document.body.textContent = 'Loading evidence...';

    try {
      const blob = await fetchIncidentAttachment(
        attachment.incident_id,
        attachment.id,
      );

      const fileBlob = blob.type
        ? blob
        : new Blob([blob], { type: attachment.mime_type });

      const objectUrl = URL.createObjectURL(fileBlob);

      newTab.location.href = objectUrl;

      // Keep the URL alive while the new tab displays or plays the file.
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10 * 60 * 1000);
    } catch (error) {
      newTab.close();
      console.error('Unable to open incident evidence:', error);
      toast.error('Unable to open evidence. Please try again.');
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[690px] text-left">
        <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-6 py-3">Incident</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Reported</th>
            <th className="px-4 py-3">Evidence</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {incidents.map((incident) => {
            const attachments = attachmentsByIncident[incident.id];
            const failed = attachmentErrors[incident.id];

            return (
              <tr
                key={incident.id}
                className="transition hover:bg-slate-50/80"
              >
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold">
                    {incident.description || incident.type}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {incident.reference_number}
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={12} />
                    {incident.address || 'Location not provided'}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getPriorityStyle(
                      incident.priority,
                      priorityStyles,
                    )}`}
                  >
                    {formatStatus(incident.priority)}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                      incident.status,
                      statusStyles,
                    )}`}
                  >
                    {formatStatus(incident.status)}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                  {formatReportedDate(incident.created_at)}
                </td>

                <td className="px-4 py-4">
                  {failed ? (
                    <span className="text-xs text-red-600">
                      Unavailable
                    </span>
                  ) : attachments === undefined ? (
                    <span className="text-xs text-slate-400">
                      Loading...
                    </span>
                  ) : attachments.length === 0 ? (
                    <span className="text-xs text-slate-400">
                      No evidence
                    </span>
                  ) : (
                    <div className="flex flex-col items-start gap-1">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                        <Paperclip size={13} />
                        {attachments.length}{' '}
                        {attachments.length === 1 ? 'file' : 'files'}
                      </span>

                      {attachments.map((attachment) => {                       
                        return (
                          <button
                            key={attachment.id}
                            type="button"
                            onClick={() => void handleOpenEvidence(attachment)}
                            className="inline-flex max-w-[180px] items-center gap-1 truncate text-left text-xs text-blue-700 hover:text-blue-900 hover:underline"
                            title={`Open ${attachment.file_name}`}
                          >
                            <ExternalLink size={12} className="shrink-0" />
                            <span className="truncate">{attachment.file_name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}

          {incidents.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-12 text-center text-sm text-slate-500"
              >
                No incidents match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
