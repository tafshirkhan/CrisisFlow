
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
import { useState } from 'react';
import axios from 'axios';
import {createIncident, uploadIncidentAttachment,listIncidentAttachments,getIncidentAttachmentUrl,} from '../api/incidentApi';
import type { IncidentAttachment } from '../types/incidentApi.types';
//useState is a React Hook that allows you to store and update data inside a functional component.
//useState — Stores data and updates the UI when that data changes.
//axios — Sends requests to a backend and receives responses.

export default function CitizenReportPage() {
  const report = useIncidentReport();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [incidentReference, setIncidentReference] = useState('');

  const [submittedIncidentId, setSubmittedIncidentId] = useState('');
  const [submittedAttachments, setSubmittedAttachments] = useState<IncidentAttachment[]>([]);

async function handleSubmit() {
  setIsSubmitting(true);
  setSubmissionError('');

  try {
    const incident = await createIncident({
      type:
        report.form.type === 'MEDICAL_EMERGENCY'
          ? 'MEDICAL'
          : report.form.type,
      description: report.form.description.trim(),
      address: report.form.location.address.trim() || undefined,
      latitude: report.form.location.latitude ?? undefined,
      longitude: report.form.location.longitude ?? undefined,
      peopleAffected: report.form.peopleAffected,
      additionalInformation:
        report.form.additionalInformation.trim() || undefined,
    });

    for (const evidence of report.evidence.files) {
      await uploadIncidentAttachment(incident.id, evidence.file);
    }

    setIncidentReference(incident.reference_number);
    setSubmittedIncidentId(incident.id);

    const attachments = await listIncidentAttachments(incident.id);
    setSubmittedAttachments(attachments);
    report.setSubmittedPreview(true);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      setSubmissionError(
        error.response?.data?.message ??
          'Unable to submit your report. Please try again.',
      );
    } else {
      setSubmissionError(
        'An unexpected error occurred while submitting your report.',
      );
    }
  } finally {
    setIsSubmitting(false);
  }
}

const handleCreateAnotherReport = () => {
  setIncidentReference('');
  setSubmittedIncidentId('');
  setSubmittedAttachments([]);
  setSubmissionError('');
  report.resetForm();
};



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
            Incident report submitted
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
            Your incident report has been saved in CrisisFlow.
            Reference number:
          </p>
          <p className='mt-3 text-xl fonr-bold text-blue-700'>
            {incidentReference}
          </p>

          {submittedAttachments.length > 0 && (
            <section className="mt-6 text-left">
              <h2 className="text-sm font-semibold text-slate-900">
                Uploaded supporting evidence
              </h2>

              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {submittedAttachments.map((attachment) => {
                  const attachmentUrl = getIncidentAttachmentUrl(
                    submittedIncidentId,
                    attachment.id,
                  );

                  return (
                    <div
                      key={attachment.id}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3"
                    >
                      {attachment.mime_type.startsWith('image/') ? (
                        <a
                          href={attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${attachment.file_name}`}
                        >
                          <img
                            src={attachmentUrl}
                            alt={attachment.file_name}
                            className="h-40 w-full rounded-lg object-cover"
                          />
                        </a>
                      ) : attachment.mime_type === 'video/mp4' ? (
                        <video
                          src={attachmentUrl}
                          controls
                          preload="metadata"
                          className="w-full rounded-lg"
                        >
                          Your browser does not support video playback.
                        </video>
                      ) : null}

                      <p className="mt-2 truncate text-sm font-medium text-slate-800">
                        {attachment.file_name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {(attachment.file_size_bytes / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {/* <button
              type="button"
              onClick={() => report.setSubmittedPreview(false)}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to review
            </button> */}

            <button
              type="button"
              onClick={handleCreateAnotherReport}
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
                disabled={isSubmitting}
                className="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                {isSubmitting ? 'Submitting Report.....' : 'Submit Incident Report'}
              </button>
            )}
          </div>

          {submissionError && (
              <p role="alert" className="mt-4 text-sm text-red-600">
                {submissionError}
              </p>
            )}
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
