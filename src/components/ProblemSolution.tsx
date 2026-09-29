const problems = [
  {
    title: "Opaque landed amounts",
    body: "Senders see a headline rate; recipients discover fees, FX spreads, and delays after the fact.",
  },
  {
    title: "Fragmented rails",
    body: "Banks, aggregators, and MoMo each quote differently — comparing paths is manual and error-prone.",
  },
  {
    title: "Corridor friction",
    body: "NGN↔GHS and GHS↔XOF traffic is growing, but transparency and soft MoMo receive still lag.",
  },
];

const solutions = [
  {
    title: "All-in quote ranking",
    body: "Amount out, fee, FX, and speed in one ranked list — so the best path is obvious.",
  },
  {
    title: "PAPSS-aligned story",
    body: "Designed around regional clearing intent. This demo does not claim live PAPSS connectivity.",
  },
  {
    title: "MoMo soft handoff",
    body: "Recommended paths highlight MoMo-compatible receive — no ClearSend custody of funds.",
  },
];

export function ProblemSolution() {
  return (
    <section id="problem" className="scroll-mt-20 bg-slate-50 py-14 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            MoMo Fintech Labs
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            The problem ClearSend solves
          </h2>
          <p className="mt-3 text-slate-600">
            Cross-border MoMo and bank transfers in West Africa still hide the
            true cost of getting money to the other side. ClearSend makes the
            all-in outcome comparable before anyone taps send.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-rose-700">
              Today
            </h3>
            <ul className="space-y-3">
              {problems.map((p) => (
                <li
                  key={p.title}
                  className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900">{p.title}</div>
                      <p className="mt-1 text-sm text-slate-600">{p.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-700">
              With ClearSend
            </h3>
            <ul className="space-y-3">
              {solutions.map((s) => (
                <li
                  key={s.title}
                  className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900">{s.title}</div>
                      <p className="mt-1 text-sm text-slate-600">{s.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
