//This reusable button handles the loading state for both login and registration.

import { LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface AuthSubmitButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading: boolean;
  children: ReactNode;
  loadingText: string;
}

export default function AuthSubmitButton({
  loading,
  children,
  loadingText,
  disabled,
  ...buttonProps
}: AuthSubmitButtonProps) {
  return (
    <button
      {...buttonProps}
      type="submit"
      disabled={loading || disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 ${
        loading || disabled
          ? 'cursor-not-allowed opacity-60'
          : ''
      }`}
    >
      {loading && (
        <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
      )}

      {loading ? loadingText : children}
    </button>
  );
}
