
import { useIncidentReport } from '../hooks/useIncidentReport';

import IncidentTypeSelector from '../components/IncidentTypeSelector';
import IncidentDescription from '../components/IncidentDescription';
import SeveritySelector from '../components/SeveritySelector';
import PeopleAffectedInput from '../components/PeopleAffectedInput';
import EvidenceUploader from '../components/EvidenceUploader';
import IncidentLocationStep from '../components/IncidentLocation';
import IncidentReview from '../components/IncidentReview';
import ReportStepIndicator from '../components/IncidentReportStepIndicator';
import ImportantInformation from '../components/ImportantInformation';

export default function CitizenReportPage() {
  const report = useIncidentReport();

  function handleSubmit() {
    // Prototype only: no incident is saved to the backend yet.
    report.setSubmittedPreview(true);
  }

  if (report.submittedPreview) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700"
            aria-hidden="true"
          >
            ✓
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Report preview complete
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
            Your incident report has passed the prototype review flow.
            It has not been submitted to the CrisisFlow backend, and no
            emergency services have been contacted.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => report.setSubmittedPreview(false)}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to review
            </button>

            <button
              type="button"
              onClick={report.resetForm}
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Create another report
            </button>
          </div>
        </div>

        <ImportantInformation />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-sm font-semibold text-blue-700">
          CITIZEN SERVICES
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Report an emergency
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Provide accurate details about the incident so it can be
          reviewed and prioritised in the CrisisFlow prototype.
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <ReportStepIndicator currentStep={report.step} />

          <div className="my-7 border-t border-slate-200" />

          {report.step === 1 && (
            <div className="space-y-7">
              <IncidentTypeSelector
                value={report.form.type}
                onChange={report.setType}
              />

              <IncidentDescription
                description={report.form.description}
                additionalInformation={report.form.additionalInformation}
                onDescriptionChange={report.setDescription}
                onAdditionalInformationChange={
                  report.setAdditionalInformation
                }
                error={report.errors.description}
              />

              <SeveritySelector
                value={report.form.priority}
                onChange={report.setPriority}
              />

              <PeopleAffectedInput
                value={report.form.peopleAffected}
                onChange={report.setPeopleAffected}
                error={report.errors.peopleAffected}
              />

              <EvidenceUploader
                files={report.evidence.files}
                error={report.errors.evidence ?? report.evidence.error ?? undefined}
                onAddFiles={report.evidence.addFiles}
                onRemoveFile={report.evidence.removeFile}
              />
            </div>
          )}

          {report.step === 2 && (
            <IncidentLocationStep
              location={report.location.location}
              error={report.errors.location}
              locationError={report.location.error}
              isLocating={report.location.isLocating}
              onAddressChange={report.location.updateAddress}
              onSelectCoordinates={report.location.setCoordinates}
              onUseCurrentLocation={report.location.useCurrentLocation}
            />
          )}

          {report.step === 3 && (
            <IncidentReview form={report.form} />
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={report.previousStep}
              disabled={report.step === 1}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>

            {report.step < 3 ? (
              <button
                type="button"
                onClick={report.nextStep}
                className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Complete report preview
              </button>
            )}
          </div>
        </section>

        <div className="space-y-5">
          <ImportantInformation />

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Reporting checklist
            </h2>

            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>✓ Describe what happened clearly.</li>
              <li>✓ Estimate how many people are affected.</li>
              <li>✓ Provide the incident location.</li>
              <li>✓ Review the information before completing the preview.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
