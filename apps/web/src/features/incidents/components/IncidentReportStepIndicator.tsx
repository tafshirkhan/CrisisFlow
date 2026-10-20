
import type { ReportStep } from '../types/incidentReport.types';

interface IncidentReportStepIndicatorProps {
  currentStep: ReportStep;
}

const steps = [
  { number: 1, label: 'Incident details' },
  { number: 2, label: 'Location' },
  { number: 3, label: 'Review & submit' },
] as const;

export default function IncidentReportStepIndicator({
  currentStep,
}: IncidentReportStepIndicatorProps) {
  return (
    <nav aria-label="Incident reporting progress" className="w-full">
      <ol className="flex items-start">
        {steps.map((step, index) => {
          const isComplete = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <li
              key={step.number}
              className={`relative flex flex-1 flex-col items-center text-center ${
                index < steps.length - 1
                  ? 'after:absolute after:left-1/2 after:top-5 after:h-0.5 after:w-full after:translate-x-1/2 after:bg-slate-200 after:content-[""]'
                  : ''
              }`}
            >
              <span
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                  isComplete
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : isCurrent
                      ? 'border-blue-600 bg-white text-blue-700'
                      : 'border-slate-300 bg-white text-slate-500'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isComplete ? '✓' : step.number}
              </span>

              <span
                className={`mt-2 px-1 text-xs sm:text-sm ${
                  isCurrent
                    ? 'font-semibold text-blue-700'
                    : isComplete
                      ? 'font-medium text-slate-700'
                      : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
