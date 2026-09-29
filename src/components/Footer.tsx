export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-400 text-xs font-bold text-white">
              CS
            </span>
            <span className="font-semibold text-white">ClearSend</span>
          </div>
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            All-in FX + fee transparency for West Africa. ClearSend does not
            hold funds.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} ClearSend · Estimated quotes · No fund
          holding
        </p>
      </div>
    </footer>
  );
}
