
import type { IncidentSeverity } from '../types/incidentReport.types';

interface SeveritySelectorProps {
  value: IncidentSeverity;
  onChange: (severity: IncidentSeverity) => void;
}

const severityOptions: {
  value: IncidentSeverity;
  label: string;
  description: string;
  selectedClass: string;
}[] = [
  {
    value: 'LOW',
    label: 'Low',
    description: 'Limited immediate danger',
    selectedClass: 'border-emerald-500 bg-emerald-50',
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    description: 'Needs timely attention',
    selectedClass: 'border-amber-500 bg-amber-50',
  },
  {
    value: 'HIGH',
    label: 'High',
    description: 'Serious or worsening situation',
    selectedClass: 'border-orange-500 bg-orange-50',
  },
  {
    value: 'CRITICAL',
    label: 'Critical',
    description: 'Immediate threat to life or safety',
    selectedClass: 'border-red-500 bg-red-50',
  },
];

export default function SeveritySelector({
  value,
  onChange,
}: SeveritySelectorProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-sm font-semibold text-slate-800">
        How urgent is the situation?
      </legend>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {severityOptions.map((option) => {
          const selected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`rounded-xl border p-4 text-left transition ${
                selected
                  ? `${option.selectedClass} ring-2 ring-slate-200`
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-900">
                  {option.label}
                </span>

                {selected && (
                  <span className="text-xs font-semibold text-slate-700">
                    Selected
                  </span>
                )}
              </span>

              <span className="mt-1 block text-xs text-slate-600">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
