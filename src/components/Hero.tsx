export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-teal-950 to-teal-900 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(45,212,191,0.35), transparent 40%), radial-gradient(circle at 80% 10%, rgba(16,185,129,0.25), transparent 35%)",
        }}
      />
      <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-100">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          MoMo Fintech Labs pitch demo · DEMO quotes only
        </div>
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl sm:leading-[1.1]">
          All-in FX + fee transparency for West Africa corridors
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-teal-50/85 sm:text-lg">
          ClearSend shows what recipients actually get across{" "}
          <span className="font-semibold text-white">NGN</span>,{" "}
          <span className="font-semibold text-white">GHS</span>, and{" "}
          <span className="font-semibold text-white">CFA/XOF</span> — ranked by
          amount out, fee, FX, and speed — then soft-hands off to MoMo receive.
          PAPSS-aligned narrative. No fund holding.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#quote"
            className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300"
          >
            Compare demo quotes
          </a>
          <a
            href="#problem"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
          >
            Why this matters
          </a>
        </div>
        <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { k: "Corridors", v: "NGN · GHS · XOF" },
            { k: "Output", v: "Ranked all-in" },
            { k: "Receive", v: "MoMo soft handoff" },
            { k: "Custody", v: "None — quote only" },
          ].map((item) => (
            <div
              key={item.k}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur"
            >
              <dt className="text-[11px] font-medium uppercase tracking-wide text-teal-200/70">
                {item.k}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-white">{item.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
