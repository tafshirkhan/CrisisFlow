
import { useState } from 'react';

import { useEvidenceFiles } from './useEvidenceFiles';
import { useIncidentLocation } from './useIncidentLocation';

import { validateIncidentReport } from '../validation/incidentReportValidation';

import type {
  IncidentReportErrors,
  IncidentSeverity,
  IncidentType,
  ReportStep,
} from '../types/incidentReport.types';

export function useIncidentReport() {
  const [step, setStep] = useState<ReportStep>(1);
  const [type, setType] = useState<IncidentType>('ROAD_ACCIDENT');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IncidentSeverity>('HIGH');
  const [peopleAffected, setPeopleAffected] = useState(1);
  const [additionalInformation, setAdditionalInformation] =
    useState('');
  const [errors, setErrors] = useState<IncidentReportErrors>({});
  const [submittedPreview, setSubmittedPreview] = useState(false);

  const evidence = useEvidenceFiles();
  const location = useIncidentLocation();

  const form = {
    type,
    description,
    priority,
    peopleAffected,
    additionalInformation,
    location: location.location,
    evidence: evidence.files,
  };

  function nextStep() {
    const validationErrors = validateIncidentReport(form, step);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setStep((current) => Math.min(3, current + 1) as ReportStep);
  }

  function previousStep() {
    setErrors({});
    setStep((current) => Math.max(1, current - 1) as ReportStep);
  }

  function resetForm() {
    setStep(1);
    setType('ROAD_ACCIDENT');
    setDescription('');
    setPriority('HIGH');
    setPeopleAffected(1);
    setAdditionalInformation('');
    setErrors({});
    setSubmittedPreview(false);
    evidence.clearFiles();
    location.resetLocation();
  }

  return {
    step,
    form,
    errors,
    submittedPreview,

    setType,
    setDescription,
    setPriority,
    setPeopleAffected,
    setAdditionalInformation,

    evidence,
    location,

    nextStep,
    previousStep,
    resetForm,
    setSubmittedPreview,
  };
}
