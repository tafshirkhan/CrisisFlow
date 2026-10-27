// This component provides the common page background and centred card for both login and registration.

import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

// Shared background and centred card for authentication pages.
interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <>
      <Toaster position="top-right" richColors />

      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
          {children}
        </section>
      </main>
    </>
  );
}
