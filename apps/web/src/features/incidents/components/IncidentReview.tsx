
import type { IncidentReportForm } from '../types/incidentReport.types';

interface IncidentReviewProps {
  form: IncidentReportForm;
}

const incidentLabels: Record<IncidentReportForm['type'], string> = {
  MEDICAL_EMERGENCY: 'Medical Emergency',
  FIRE: 'Fire',
  ROAD_ACCIDENT: 'Road Accident',
  PUBLIC_SAFETY: 'Public Safety',
  FLOOD: 'Flood',
  HAZARDOUS_MATERIAL: 'Hazardous Material',
  MISSING_PERSON: 'Missing Person',
  INFRASTRUCTURE_EMERGENCY: 'Infrastructure Emergency',
  OTHER: 'Other Emergency',
};

const severityLabels: Record<
  IncidentReportForm['priority'],
  string
> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export default function IncidentReview({ form }: IncidentReviewProps) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Review your report
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Check the information below before submitting your incident report.
        </p>
      </div>

      <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Incident details
          </p>

          <dl className="mt-3 space-y-3">
            <div>
              <dt className="text-xs text-slate-500">Incident type</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {incidentLabels[form.type]}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-slate-500">Description</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                {form.description || 'Not provided'}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-slate-500">Reported severity</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {severityLabels[form.priority]}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-slate-500">People affected</dt>
              <dd className="mt-1 text-sm text-slate-800">
                {form.peopleAffected}
              </dd>
            </div>

            {form.additionalInformation.trim() && (
              <div>
                <dt className="text-xs text-slate-500">
                  Additional information
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                  {form.additionalInformation}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Incident location
          </p>

          <p className="mt-3 text-sm text-slate-800">
            {form.location.address || 'No address provided'}
          </p>

          {form.location.latitude !== null &&
            form.location.longitude !== null && (
              <p className="mt-2 text-xs text-slate-500">
                Coordinates: {form.location.latitude.toFixed(6)},{' '}
                {form.location.longitude.toFixed(6)}
              </p>
            )}
        </div>

        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Supporting evidence
          </p>

          {form.evidence.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              No files attached.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {form.evidence.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 truncate text-slate-800">
                    {item.file.name}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        Your selected severity is an initial assessment. In a real deployment,
        incident priority and response decisions would require appropriate
        operational validation.
      </p>
    </section>
  );
}
