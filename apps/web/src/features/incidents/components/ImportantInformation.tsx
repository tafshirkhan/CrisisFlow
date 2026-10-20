
export default function ImportantInformation() {
  return (
    <aside
      aria-labelledby="important-information-title"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">
          ⚠️
        </span>

        <div>
          <h2
            id="important-information-title"
            className="text-sm font-bold text-amber-950"
          >
            Important safety information
          </h2>

          <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-amber-900">
            <li>
              If there is immediate danger to life in Ireland, call
              112 or 999.
            </li>
            <li>
              Move to a safe location if you can do so without putting
              yourself or others at further risk.
            </li>
            <li>
              Provide accurate details and the clearest possible
              incident location.
            </li>
            <li>
              Do not put yourself in danger to take photos or videos.
            </li>
          </ul>

          <p className="mt-4 border-t border-amber-200 pt-3 text-xs leading-5 text-amber-800">
            CrisisFlow is an academic project prototype. Submitting
            this form does not contact emergency services or guarantee
            a response.
          </p>
        </div>
      </div>
    </aside>
  );
}
