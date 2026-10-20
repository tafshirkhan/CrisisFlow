
import type { IncidentType } from '../types/incidentReport.types';

interface IncidentTypeSelectorProps {
  value: IncidentType;
  onChange: (type: IncidentType) => void;
}


const incidentTypes: {
  value: IncidentType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: 'MEDICAL_EMERGENCY',
    label: 'Medical Emergency',
    description: 'Urgent medical assistance',
    icon: '🚑',
  },
  {
    value: 'FIRE',
    label: 'Fire',
    description: 'Fire, smoke, or explosion',
    icon: '🔥',
  },
  {
    value: 'ROAD_ACCIDENT',
    label: 'Road Accident',
    description: 'Vehicle collision or road incident',
    icon: '🚗',
  },
  {
    value: 'PUBLIC_SAFETY',
    label: 'Public Safety',
    description: 'Threats to public safety',
    icon: '🚨',
  },
  {
    value: 'FLOOD',
    label: 'Flood',
    description: 'Flooding or rising water',
    icon: '🌊',
  },
  {
    value: 'HAZARDOUS_MATERIAL',
    label: 'Hazardous Material',
    description: 'Chemical spills or hazardous substances',
    icon: '☣️',
  },
  {
    value: 'MISSING_PERSON',
    label: 'Missing Person',
    description: 'Report a missing person',
    icon: '🔎',
  },
  {
    value: 'INFRASTRUCTURE_EMERGENCY',
    label: 'Infrastructure Emergency',
    description: 'Building, utility, or structural danger',
    icon: '🏗️',
  },
  {
    value: 'OTHER',
    label: 'Other Emergency',
    description: 'Another type of emergency',
    icon: '⚠️',
  },
];


export default function IncidentTypeSelector({
  value,
  onChange,
}: IncidentTypeSelectorProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-sm font-semibold text-slate-800">
        What type of emergency is this?
      </legend>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {incidentTypes.map((incident) => {
          const selected = value === incident.value;

          return (
            <button
              key={incident.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(incident.value)}
              className={`rounded-xl border p-4 text-left transition ${
                selected
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <span className="mb-3 block text-2xl" aria-hidden="true">
                {incident.icon}
              </span>

              <span className="block text-sm font-semibold text-slate-900">
                {incident.label}
              </span>

              <span className="mt-1 block text-xs text-slate-500">
                {incident.description}
              </span>

              {selected && (
                <span className="mt-3 inline-block text-xs font-semibold text-blue-700">
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
