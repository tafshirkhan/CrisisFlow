
interface IncidentDescriptionProps {
  description: string;
  additionalInformation: string;
  onDescriptionChange: (value: string) => void;
  onAdditionalInformationChange: (value: string) => void;
  error?: string;
}

export default function IncidentDescription({
  description,
  additionalInformation,
  onDescriptionChange,
  onAdditionalInformationChange,
  error,
}: IncidentDescriptionProps) {
  return (
    <div className="space-y-5">
      <div>
        <label
          htmlFor="incident-description"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Describe the emergency
          <span className="ml-1 text-red-600">*</span>
        </label>

        <textarea
          id="incident-description"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="Explain what happened, what you can see, and any immediate dangers..."
          rows={5}
          maxLength={500}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'description-error' : 'description-help'}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 ${
            error
              ? 'border-red-400 focus:ring-red-100'
              : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
          }`}
        />

        <div className="mt-2 flex items-start justify-between gap-3">
          <p
            id={error ? 'description-error' : 'description-help'}
            className={`text-xs ${error ? 'text-red-600' : 'text-slate-500'}`}
          >
            {error ?? 'Provide at least 10 characters so responders understand the situation.'}
          </p>

          <span className="shrink-0 text-xs text-slate-500">
            {description.length}/500
          </span>
        </div>
      </div>

      <div>
        <label
          htmlFor="additional-information"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Additional information
          <span className="ml-2 font-normal text-slate-500">(optional)</span>
        </label>

        <textarea
          id="additional-information"
          value={additionalInformation}
          onChange={(event) =>
            onAdditionalInformationChange(event.target.value)
          }
          placeholder="Nearby landmarks, vehicle details, access instructions, or other useful information..."
          rows={3}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}
