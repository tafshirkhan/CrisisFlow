//This component displays the CrisisFlow icon, title, and description. Both pages can reuse it.

import { ShieldCheck } from 'lucide-react';

interface AuthHeaderProps {
  title: string;
  description: string;
}

export default function AuthHeader({
  title,
  description,
}: AuthHeaderProps) {
  return (
    <header className="mb-7 flex flex-col items-center text-center">
      <div className="mb-4 rounded-2xl bg-blue-100 p-3 text-blue-700">
        <ShieldCheck size={32} aria-hidden="true" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {title}
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </header>
  );
}
