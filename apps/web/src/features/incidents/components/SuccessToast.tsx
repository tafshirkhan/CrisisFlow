
import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessToastProps {
  message: string;
  onClose: () => void;
}

export default function SuccessToast({
  message,
  onClose,
}: SuccessToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 4000);

    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-4 z-[2000] flex w-[calc(100%-2rem)] max-w-md items-start gap-3 rounded-xl border border-emerald-200 bg-white p-4 shadow-xl"
    >
      <CheckCircle2
        size={22}
        className="mt-0.5 shrink-0 text-emerald-600"
      />

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">
          Success
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <X size={18} />
      </button>
    </div>
  );
}
