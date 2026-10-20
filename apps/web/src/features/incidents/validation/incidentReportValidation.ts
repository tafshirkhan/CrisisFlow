
import type {
  IncidentReportErrors,
  IncidentReportForm,
  ReportStep,
} from '../types/incidentReport.types';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
]);

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 5;

export function validateIncidentReport(
  form: IncidentReportForm,
  step: ReportStep,
): IncidentReportErrors {
  const errors: IncidentReportErrors = {};

  if (step === 1) {
    if (form.description.trim().length < 10) {
      errors.description =
        'Description must contain at least 10 characters.';
    }

    if (form.description.length > 500) {
      errors.description =
        'Description cannot exceed 500 characters.';
    }

    if (
      !Number.isInteger(form.peopleAffected) ||
      form.peopleAffected < 1 ||
      form.peopleAffected > 1000
    ) {
      errors.peopleAffected =
        'Enter a number between 1 and 1000.';
    }

    if (form.evidence.length > MAX_FILES) {
      errors.evidence = `You can upload a maximum of ${MAX_FILES} files.`;
    }

    for (const item of form.evidence) {
      if (!ALLOWED_MIME_TYPES.has(item.file.type)) {
        errors.evidence =
          'Only JPEG, PNG, WebP and MP4 files are supported.';
        break;
      }

      if (
        item.file.size === 0 ||
        item.file.size > MAX_FILE_SIZE
      ) {
        errors.evidence =
          'Each file must be non-empty and no larger than 50 MB.';
        break;
      }
    }
  }

  if (step === 2) {
    const hasCoordinates =
      form.location.latitude !== null &&
      form.location.longitude !== null;

    if (!form.location.address.trim() && !hasCoordinates) {
      errors.location =
        'Enter an address or select the incident coordinates.';
    }

    if (
      form.location.latitude !== null &&
      (form.location.latitude < -90 ||
        form.location.latitude > 90)
    ) {
      errors.location = 'Latitude must be between -90 and 90.';
    }

    if (
      form.location.longitude !== null &&
      (form.location.longitude < -180 ||
        form.location.longitude > 180)
    ) {
      errors.location = 'Longitude must be between -180 and 180.';
    }
  }

  return errors;
}
