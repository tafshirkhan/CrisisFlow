
interface PeopleAffectedInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export default function PeopleAffectedInput({
  value,
  onChange,
  error,
}: PeopleAffectedInputProps) {
  return (
    <div>
      <label
        htmlFor="people-affected"
        className="mb-2 block text-sm font-semibold text-slate-800"
      >
        Number of people affected
        <span className="ml-1 text-red-600">*</span>
      </label>

      <input
        id="people-affected"
        type="number"
        min={1}
        max={1000}
        step={1}
        value={value}
        onChange={(event) => {
          const inputValue = event.target.value;

          onChange(inputValue === '' ? 0 : Number(inputValue));
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'people-affected-error' : undefined}
        placeholder="e.g. 3"
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 ${
          error
            ? 'border-red-400 focus:ring-red-100'
            : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
        }`}
      />

      {error && (
        <p
          id="people-affected-error"
          className="mt-2 text-xs text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      <p className="mt-2 text-xs text-slate-500">
        Include anyone injured, trapped, or otherwise directly affected.
        Enter at least 1.
      </p>
    </div>
  );
}
