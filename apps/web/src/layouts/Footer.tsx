
export default function Footer() {
  return (
    <footer className="flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
      <p>© 2026 CrisisFlow · Emergency response coordination</p>

      <p className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Development preview · Sample data only
      </p>
    </footer>
  );
}
